# App da Missão (Viradão)

Frontend da Brincadeira Noturna do Viradão. App de evangelismo do corujão dos
Adolas: cada equipe corre contra um cronômetro, destrava cards de história por
palavra-chave e tenta alcançar o Wisly antes que ele embarque. Um painel do líder
controla todas as equipes ao vivo.

> **Status:** no ar em produção, em https://missaodigitalmd.com/viradao/
> Backend, persistência, offline (PWA) e painel ao vivo concluídos (Fases 1 a 4).
> O passo a passo de como atualizar na nuvem está em
> [[Fase 5 - Deploy e Runbook de Atualizacao]] (leitura obrigatória antes de publicar).

Esta pasta (`webapp/`) é o **código-fonte** do app. O build publicado vive separado,
dentro do repo do site, em `Site/app/public/viradao/` (ver o runbook da Fase 5).

## Rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # tsc + build de produção (gera dist/ com base /viradao/)
npm run preview   # serve o build
```

Para publicar a versão nova na nuvem, NÃO basta buildar: siga o runbook da Fase 5
(buildar aqui, copiar o `dist/` para `Site/app/public/viradao/`, commit + push no
repo do site, conferir bustando o service worker).

## Telas (acesso por link, igual ao produto)

- `#/` — DevHome, navegação só do teste interno (não existe no produto final).
- `#/equipe/team-1` … `team-5` — Tela da Equipe (retrato, mobile).
- `#/painel` — Painel de Gerenciamento (tablet landscape, link oculto).

Roteamento por **hash** de propósito: no servidor o caminho é sempre `/viradao/`, o
resto é client-side. Por isso o app convive com o `.htaccess` SPA do site sem conflito.

## Arquitetura (o essencial)

- **Backend:** Supabase, projeto `missaodigitalsite` (o mesmo do site), schema
  isolado **`viradao`** (nunca se toca no `public` do site). Cliente em
  `src/lib/supabase.ts` (`db.schema = 'viradao'`). DDL reproduzível versionado em
  `Site/app/supabase/migrations/20260622_viradao_schema_bootstrap.sql`.
- **Relógio:** derivado e calculado no servidor. Start/pause via RPCs
  (`start_team`/`pause_team`) usam `now()` do servidor; a view `team_state` entrega
  `remaining_seconds` pronto. O cliente nunca faz matemática de offset no caminho
  crítico (conta a partir de `Date.now() + remaining`).
- **Sincronização e offline:** `src/lib/sync.ts` faz resume, write-through, fila
  offline e espelho em localStorage. Realtime: a equipe ouve a própria linha e o
  painel reflete ao vivo. Unlocks são append-only (merge sem conflito).
- **PWA:** `vite-plugin-pwa` (autoUpdate). Precache do app + fontes + imagens;
  áudio em runtime cache sob demanda (CacheFirst), para não baixar ~25MB de cara.
- **Assets embutidos:** imagens em `public/images/` e narrações em `public/audio/`
  (um arquivo por card), versionados junto. O Supabase guarda só o estado do jogo.

## Conteúdo (fonte da verdade)

O texto que o jogador vê e a narração saem **só** do [[Roteiro de Conteúdo do App]];
`src/content/story.ts` espelha de lá. Edite o texto sempre no Roteiro e avise para
sincronizar. Dados montáveis (ids, códigos, bônus) na [[Tabela de Conteúdo do App]].

## Stack

React 19 + Vite 6 + TypeScript, Tailwind v4 (tokens do [[Design System - App da Missão]]),
Motion, lucide-react, Zustand, Fontsource (JetBrains Mono + Inter), Howler (áudio),
@supabase/supabase-js, qrcode, vite-plugin-pwa.

## Pendências conhecidas

Ver a seção "Débitos" da [[Fase 5 - Deploy e Runbook de Atualizacao]]: 3 áudios de
urgência ainda não gerados (o app tolera), calibragem final de tempos/códigos, e a
fonte do app trazida para o git. Componentes próprios (Button, Collapsible, etc.) em
vez de shadcn interativo, mantendo o princípio "a gente é dona do código".
</content>
