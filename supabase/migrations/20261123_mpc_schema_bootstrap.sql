-- =============================================================================
-- mpc schema, bootstrap: formulario de briefing da MPC Portugal (/mpcportugal)
-- =============================================================================
-- Projeto: missaodigitalsite (ref wpgjlptwoydiejbphmhj), MESMO banco do site.
-- O schema `public` e do site em producao e NUNCA e tocado.
--
-- DESENHO
--   O navegador NUNCA fala com estas tabelas. Todo acesso passa pela Edge Function
--   `mpc-briefing`, que conecta direto ao Postgres (SUPABASE_DB_URL). Por isso este
--   schema NAO e exposto na API REST (nao entra em db_schema) e nenhuma politica
--   existe para anon/authenticated. RLS ligado como cinto e suspensorio.
--   Tokens nunca ficam em claro: so o sha256 hex.
--
-- COMO USAR
--   Idempotente. Aplicar por Management API (POST /v1/projects/{ref}/database/query),
--   nunca por `supabase db push`. Os hashes dos tokens NAO estao neste arquivo:
--   sao inseridos por script, fora do Git.
-- =============================================================================

create schema if not exists mpc;
revoke all on schema mpc from public, anon, authenticated;

create table if not exists mpc.briefing (
  id          uuid primary key default gen_random_uuid(),
  token_hash  text not null unique,           -- sha256 hex do token do Mark
  admin_hash  text not null,                  -- sha256 hex do token de Navas
  data        jsonb not null default '{}'::jsonb,
  version     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists mpc.arquivo (
  id           uuid primary key default gen_random_uuid(),
  briefing_id  uuid not null references mpc.briefing(id) on delete cascade,
  escopo       text not null,                 -- 'ini_media' ou '<rid>.foto'
  nome         text not null,
  path         text not null,                 -- caminho no bucket mpc-briefing
  mime         text,
  bytes        bigint not null default 0,
  confirmado   boolean not null default false,
  created_at   timestamptz not null default now(),
  removido_em  timestamptz
);
create index if not exists arquivo_briefing_idx on mpc.arquivo (briefing_id);

create table if not exists mpc.historico (
  id           bigserial primary key,
  briefing_id  uuid not null references mpc.briefing(id) on delete cascade,
  chaves       text[] not null,
  em           timestamptz not null default now()
);
create index if not exists historico_briefing_idx on mpc.historico (briefing_id, em desc);

alter table mpc.briefing  enable row level security;
alter table mpc.arquivo   enable row level security;
alter table mpc.historico enable row level security;
revoke all on all tables    in schema mpc from public, anon, authenticated;
revoke all on all sequences in schema mpc from public, anon, authenticated;

-- Bucket privado. Sem politicas em storage.objects para este bucket: so a
-- service role (usada pela Edge Function) acessa.
insert into storage.buckets (id, name, public, file_size_limit)
values ('mpc-briefing', 'mpc-briefing', false, 52428800)
on conflict (id) do nothing;
