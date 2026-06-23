-- =============================================================================
-- viradao schema, bootstrap / fonte da verdade reproduzivel
-- =============================================================================
-- Projeto: missaodigitalsite (ref wpgjlptwoydiejbphmhj) - MESMO banco do site.
-- Este schema isolado guarda o estado do jogo "Brincadeira Noturna do Viradao"
-- (app em /viradao). O schema `public` e do site em producao e NUNCA e tocado.
--
-- POR QUE ESTE ARQUIVO EXISTE
--   O schema viradao foi criado nas Fases 3 e 4 via Supabase Management API (SQL
--   cru), entao ele NAO aparece no historico de migracoes do projeto. Este arquivo
--   foi extraido do banco VIVO em 2026-06-22 (introspeccao via MCP) para ser a copia
--   reproduzivel: recriar/replicar o backend do jogo do zero. Mantenha-o em sincronia
--   se alterar o schema (ver "Fase 5 - Deploy e Runbook de Atualizacao", secao 3).
--
-- COMO USAR
--   Idempotente: pode rodar de novo sem duplicar (IF NOT EXISTS / CREATE OR REPLACE /
--   DROP POLICY ... IF EXISTS / ON CONFLICT DO NOTHING). Aplicar manualmente (MCP
--   apply_migration ou Management API), NUNCA com `supabase db push` automatico que
--   pudesse rodar contra o projeto sem revisao.
--
-- PASSO MANUAL QUE NAO ESTA NESTE SQL (critico para o app enxergar o schema)
--   Expor `viradao` na API (Settings > API > Exposed schemas, ou PATCH /postgrest
--   db_schema=public,graphql_public,viradao). E aditivo: o `public` do site continua
--   exposto. Sem isso, o supabase-js do app nao acessa o schema.
-- =============================================================================

create schema if not exists viradao;
grant usage on schema viradao to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- events: o container do evento (uma noite). Na pratica, um unico registro.
create table if not exists viradao.events (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  initial_seconds integer not null default 1200,   -- 1200 = 20 min
  created_at      timestamptz not null default now()
);

-- show_cross_feed (Fase 6, Ponto 9): liga/desliga o log de conclusoes entre equipes
-- nas telas dos jogadores. Default ligado (clima de gincana); o lider desliga nos
-- momentos serios da historia. Coluna aditiva para nao quebrar o banco vivo.
alter table viradao.events add column if not exists show_cross_feed boolean not null default true;

-- teams: uma linha por equipe. O relogio mora aqui em pedacos que se somam sem
-- conflito (started_at + initial + panel_adjust + soma dos bonus dos unlocks).
create table if not exists viradao.teams (
  id                   uuid primary key default gen_random_uuid(),
  event_id             uuid not null references viradao.events(id) on delete cascade,
  token                text not null unique,            -- chave da URL da equipe
  name                 text not null,
  status               text not null default 'await'
                         check (status in ('await','running','paused','failed','success')),
  started_at           timestamptz,                     -- base do relogio (now() do servidor)
  initial_seconds      integer not null default 1200,
  paused_remaining     integer,                         -- "faltavam X" guardado na pausa
  panel_adjust_seconds integer not null default 0,      -- ajustes +/- min do painel
  final_kind           text check (final_kind in ('fracasso','v1','v2')),
  final_card_id        text,
  updated_at           timestamptz not null default now(),
  active               boolean not null default true    -- equipe ativa no evento (painel)
);

-- unlocks: append-only. Fonte da verdade de quais cards abriram e do bonus total.
create table if not exists viradao.unlocks (
  id            uuid primary key default gen_random_uuid(),
  team_id       uuid not null references viradao.teams(id) on delete cascade,
  card_id       text not null,
  bonus_seconds integer not null default 0,
  kind          text not null default 'principal'
                  check (kind in ('principal','secundaria','final')),
  created_at    timestamptz not null default now(),
  unique (team_id, card_id)                            -- codigo repetido nao duplica
);

-- stations (Fase 6, Ponto 8): bonus de tempo por estacao/missao, editavel pelo
-- painel ANTES da partida (sem deploy). O app da equipe le estes valores no inicio,
-- em vez do numero chumbado no story.ts. Uma linha por card_id destravavel.
create table if not exists viradao.stations (
  card_id       text primary key,
  bonus_seconds integer not null default 0,
  updated_at    timestamptz not null default now()
);

-- archives (Fase 6, extra C5): snapshot do resultado de uma noite, salvo ao "Encerrar
-- evento" ANTES de zerar tudo, para nao perder a memoria do que aconteceu (quem cumpriu
-- V1/V2, quem falhou, tempos). Append-only; o summary e um jsonb com a linha de cada equipe.
create table if not exists viradao.archives (
  id          uuid primary key default gen_random_uuid(),
  event_name  text,
  summary     jsonb not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Funcoes
-- ---------------------------------------------------------------------------

-- updated_at automatico em teams.
create or replace function viradao.touch_updated_at()
  returns trigger
  language plpgsql
  set search_path to ''
as $$
begin new.updated_at = now(); return new; end
$$;

drop trigger if exists trg_teams_touch on viradao.teams;
create trigger trg_teams_touch before update on viradao.teams
  for each row execute function viradao.touch_updated_at();

-- hora do servidor (relogio confiavel, imune ao relogio errado do celular).
create or replace function viradao.server_now()
  returns timestamptz
  language sql
  stable
  set search_path to ''
as $$ select now() $$;

-- start_team / pause_team: usam now() do SERVIDOR (nunca o relogio do cliente).
-- NOTA (Debito 8): estas duas estao com search_path mutavel (advisor 0011). Sao
-- seguras porque qualificam tudo com viradao.*, mas para silenciar o linter pode-se
-- adicionar `set search_path = ''` (como nas duas funcoes acima). Mantido fiel ao vivo.
create or replace function viradao.start_team(p_token text)
  returns void
  language sql
as $$
  update viradao.teams set status='running', started_at=now()
  where token=p_token and status='await';
$$;

create or replace function viradao.pause_team(p_token text)
  returns void
  language plpgsql
as $$
declare t viradao.teams; b int; rem int;
begin
  select * into t from viradao.teams where token=p_token;
  if not found then return; end if;
  select coalesce(sum(bonus_seconds),0) into b from viradao.unlocks where team_id=t.id;
  if t.status='running' then
    rem := greatest(0, round(extract(epoch from (
      t.started_at + ((t.initial_seconds + t.panel_adjust_seconds + b) || ' seconds')::interval - now()))));
    update viradao.teams set status='paused', paused_remaining=rem where id=t.id;
  elsif t.status='paused' then
    update viradao.teams set status='running',
      started_at = now() - ((t.initial_seconds + t.panel_adjust_seconds + b - coalesce(t.paused_remaining,0)) || ' seconds')::interval,
      paused_remaining=null
    where id=t.id;
  end if;
end;
$$;

-- revive_team: recoloca no jogo um time encerrado (failed/success) SEM apagar o
-- progresso (Fase 6, Ponto 6). Remove so o unlock de final (kind='final'), preserva
-- estacoes e secundarias, e concede p_seconds de tempo a partir de AGORA. O novo
-- tempo nasce do now() do SERVIDOR: started_at=now() e panel_adjust calibrado para
-- que remaining_seconds da view valha exatamente p_seconds (initial + adjust + bonus).
create or replace function viradao.revive_team(p_token text, p_seconds integer)
  returns void
  language plpgsql
as $$
declare t viradao.teams; b int;
begin
  select * into t from viradao.teams where token = p_token;
  if not found then return; end if;
  if t.status not in ('failed','success') then return; end if; -- so revive encerrados
  delete from viradao.unlocks where team_id = t.id and kind = 'final'; -- tira o final
  select coalesce(sum(bonus_seconds),0) into b from viradao.unlocks where team_id = t.id;
  update viradao.teams set
    status = 'running',
    started_at = now(),
    paused_remaining = null,
    panel_adjust_seconds = p_seconds - t.initial_seconds - b,
    final_kind = null,
    final_card_id = null
  where id = t.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- View team_state: o tempo restante calculado NO SERVIDOR (zero matematica de
-- offset no cliente). A equipe e o painel leem remaining_seconds pronto daqui.
-- ---------------------------------------------------------------------------
create or replace view viradao.team_state as
  select
    id, token, name, active, status, started_at, initial_seconds,
    paused_remaining, panel_adjust_seconds, final_kind, final_card_id,
    coalesce((select sum(u.bonus_seconds) from viradao.unlocks u where u.team_id = t.id), 0::bigint) as bonus_sum,
    case
      when status = 'running' and started_at is not null then
        greatest(0::numeric, round(extract(epoch from
          started_at
          + (((initial_seconds + panel_adjust_seconds
               + coalesce((select sum(u.bonus_seconds) from viradao.unlocks u where u.team_id = t.id), 0::bigint))
              || ' seconds')::interval)
          - now())))
      when status = any (array['paused','success','failed']) then coalesce(paused_remaining, 0)::numeric
      else (initial_seconds + panel_adjust_seconds)::numeric
    end as remaining_seconds
  from viradao.teams t;

-- ---------------------------------------------------------------------------
-- RLS (sem login, token nao-adivinhavel na URL e a barreira; risco aceito no PRD).
-- Policies permissivas (using true) para o papel public. Sem dado sensivel: e
-- estado de brincadeira. unlocks tem DELETE liberado (usado pelo reset do painel).
-- ---------------------------------------------------------------------------
alter table viradao.events   enable row level security;
alter table viradao.teams    enable row level security;
alter table viradao.unlocks  enable row level security;
alter table viradao.stations enable row level security;
alter table viradao.archives enable row level security;

drop policy if exists viradao_events_read on viradao.events;
create policy viradao_events_read on viradao.events for select using (true);
-- O painel edita o evento (nome, tempo inicial global, toggle do cross-feed do Ponto 9).
drop policy if exists viradao_events_update on viradao.events;
create policy viradao_events_update on viradao.events for update using (true) with check (true);

drop policy if exists viradao_teams_read on viradao.teams;
create policy viradao_teams_read on viradao.teams for select using (true);
drop policy if exists viradao_teams_update on viradao.teams;
create policy viradao_teams_update on viradao.teams for update using (true) with check (true);

drop policy if exists viradao_unlocks_read on viradao.unlocks;
create policy viradao_unlocks_read on viradao.unlocks for select using (true);
drop policy if exists viradao_unlocks_insert on viradao.unlocks;
create policy viradao_unlocks_insert on viradao.unlocks for insert with check (true);
drop policy if exists viradao_unlocks_delete on viradao.unlocks;
create policy viradao_unlocks_delete on viradao.unlocks for delete using (true);

-- stations: leitura por todos; o painel edita (update) os tempos antes da partida.
drop policy if exists viradao_stations_read on viradao.stations;
create policy viradao_stations_read on viradao.stations for select using (true);
drop policy if exists viradao_stations_update on viradao.stations;
create policy viradao_stations_update on viradao.stations for update using (true) with check (true);

-- archives: leitura por todos; o painel insere o snapshot ao encerrar o evento.
drop policy if exists viradao_archives_read on viradao.archives;
create policy viradao_archives_read on viradao.archives for select using (true);
drop policy if exists viradao_archives_insert on viradao.archives;
create policy viradao_archives_insert on viradao.archives for insert with check (true);

-- ---------------------------------------------------------------------------
-- Grants (a anon usa SELECT em tudo, UPDATE em teams, INSERT/DELETE em unlocks,
-- e EXECUTE nas RPCs). RLS continua mediando linha a linha.
-- ---------------------------------------------------------------------------
grant select, update  on viradao.events     to anon, authenticated;
grant select, update  on viradao.teams      to anon, authenticated;
grant select, insert, delete on viradao.unlocks to anon, authenticated;
grant select, update  on viradao.stations   to anon, authenticated;
grant select, insert  on viradao.archives   to anon, authenticated;
grant select          on viradao.team_state to anon, authenticated;

grant execute on function viradao.server_now()        to anon, authenticated;
grant execute on function viradao.start_team(text)    to anon, authenticated;
grant execute on function viradao.pause_team(text)    to anon, authenticated;
grant execute on function viradao.revive_team(text, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: o painel mexe no relogio/status e as equipes refletem ao vivo.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='viradao' and tablename='teams') then
    alter publication supabase_realtime add table viradao.teams;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='viradao' and tablename='unlocks') then
    alter publication supabase_realtime add table viradao.unlocks;
  end if;
  -- events no realtime: o toggle do cross-feed (Ponto 9) chega ao vivo as telas.
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='viradao' and tablename='events') then
    alter publication supabase_realtime add table viradao.events;
  end if;
  -- stations no realtime: tempos editados no painel chegam aos aparelhos ja abertos.
  if not exists (select 1 from pg_publication_tables
                 where pubname='supabase_realtime' and schemaname='viradao' and tablename='stations') then
    alter publication supabase_realtime add table viradao.stations;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Seed (estado FRESCO = await, sem unlocks). Os nomes das 5 equipes sao os reais
-- do evento. Re-rodar nao duplica (evento por nome, equipes por token unico).
-- ---------------------------------------------------------------------------
insert into viradao.events (name, initial_seconds)
select 'Viradão 2026', 1200
where not exists (select 1 from viradao.events where name = 'Viradão 2026');

insert into viradao.teams (event_id, token, name, status, initial_seconds, panel_adjust_seconds, active)
select e.id, v.token, v.name, 'await', 1200, 0, true
from (values
  ('team-1', 'Seleção dos Canelas Finas'),
  ('team-2', 'Os Pernas de Pau FC'),
  ('team-3', 'Seleção do Banco de Reserva'),
  ('team-4', 'Time do Quase Gol'),
  ('team-5', 'Os Reservas do Goleiro')
) as v(token, name)
cross join lateral (select id from viradao.events where name = 'Viradão 2026' limit 1) e
on conflict (token) do nothing;

-- seed dos tempos por estacao (Ponto 8): valores chumbados originais do story.ts.
-- Principais: HT314/EST1=720, AP206/EST2=600, JC417/EST3=840, PR905/EST5=840.
-- Secundarias: INTERCESSAO=480, demais=300. Re-rodar nao sobrescreve edicoes do painel.
insert into viradao.stations (card_id, bonus_seconds) values
  ('est1-hotel', 720),
  ('est2-achados', 600),
  ('est3-primo', 840),
  ('est5-hospital', 840),
  ('sec-oracao', 480),
  ('sec-ason', 300),
  ('sec-lwa', 300),
  ('sec-lakou', 300),
  ('sec-kanzo', 300),
  ('sec-houngan', 300)
on conflict (card_id) do nothing;

-- fim
