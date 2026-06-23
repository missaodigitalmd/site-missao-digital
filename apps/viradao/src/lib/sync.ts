// Camada de persistencia e sincronizacao da Fase 3.
//
// Modelo (ver "Fase 3 - Analise e Plano de Execucao"):
//  - O relogio nunca e gravado pronto: e DERIVADO de started_at + (initial +
//    panel_adjust + soma dos bonus dos unlocks). Os unlocks sao append-only, o
//    que torna o merge offline+painel livre de conflito.
//  - Tres camadas de durabilidade:
//      1. Espelho em localStorage por token: resume instantaneo, ate offline.
//      2. Supabase: memoria que sobrevive entre aparelhos + canal do painel.
//      3. Fila offline: escritas que falham sobem quando a net volta.
//  - Realtime: ouve a propria linha da equipe (e os unlocks) para o painel da
//    Fase 4 refletir ao vivo, e para varios aparelhos convergirem.

import { supabase } from "./supabase";
import { initServerTime, serverNow } from "./serverTime";
import { useGameStore, type HydratePatch } from "@/store/useGameStore";
import { useFeedStore } from "@/store/useFeedStore";
import { CARD_BY_ID, URGENCY_CUES } from "@/content/story";

// ---- cross-feed entre equipes (Fase 6, Ponto 9) ----
// Canal compartilhado de Broadcast: quando uma equipe conclui algo, ela transmite a
// frase pronta (ja sabe o proprio nome e o tempo restante), e as demais telas a
// mostram como aviso passageiro. Broadcast (nao postgres_changes) porque a mensagem
// e transitoria e a equipe emissora tem todo o contexto local, sem precisar mapear
// team_id -> nome nem consultar o tempo de outra equipe.
const FEED_CHANNEL = "feed-viradao";
let feedChannel: ReturnType<typeof supabase.channel> | null = null;

export function broadcastCompletion(fromToken: string, text: string): void {
  void feedChannel?.send({
    type: "broadcast",
    event: "completion",
    payload: { fromToken, text },
  });
}

// ---- tempos por estacao (Fase 6, Ponto 8) ----
// O bonus de cada card vem do banco (viradao.stations, editavel no painel antes da
// partida), nao mais do numero chumbado no story.ts. Cache em memoria, carregado no
// attach e atualizado por realtime. stationBonus cai no fallback (valor do story.ts)
// enquanto o banco nao respondeu, para o jogo nunca ficar sem bonus.
const stationBonuses = new Map<string, number>();
export function stationBonus(cardId: string, fallback: number): number {
  return stationBonuses.has(cardId) ? stationBonuses.get(cardId)! : fallback;
}
async function loadStations(): Promise<void> {
  const { data } = await supabase.from("stations").select("card_id,bonus_seconds");
  if (!data) return;
  stationBonuses.clear();
  for (const r of data as { card_id: string; bonus_seconds: number }[]) {
    stationBonuses.set(r.card_id, r.bonus_seconds);
  }
}

type Kind = "principal" | "secundaria" | "final";

// Modo de uma sincronizacao com o banco (ver Fase 6, Ponto 7):
//  - "resume":    carga inicial. Estabelece o relogio a partir do servidor; nunca
//                 REGRIDE o progresso local (corrida de busca tardia).
//  - "authority": mudanca vinda do painel via realtime. Pode regredir de proposito
//                 (reset/pausa/reviver): o painel e a autoridade.
//  - "resync":    reconexao de rede (evento online). NUNCA derruba bruscamente o
//                 cronometro nem encerra um jogo que, para o aparelho, ainda corre.
type SyncMode = "resume" | "authority" | "resync";

// Em um resync, uma correcao PARA BAIXO do relogio e limitada a esta janela por
// evento (converge suave, sem tranco). Ganho de tempo entra integral na hora.
const MAX_RESYNC_DROP_MS = 5000;

interface TeamRow {
  id: string;
  status: HydratePatch["phase"];
  initial_seconds: number;
  final_kind: HydratePatch["finalKind"];
  final_card_id: string | null;
  remaining_seconds: number; // calculado pelo servidor (view team_state)
}
interface UnlockRow {
  card_id: string;
  bonus_seconds: number;
  kind: Kind;
  created_at: string;
}

// ---- cache de id da equipe por token ----
const teamIds = new Map<string, string>();
async function resolveTeamId(token: string): Promise<string | null> {
  if (teamIds.has(token)) return teamIds.get(token)!;
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("token", token)
    .single();
  if (error || !data) return null;
  teamIds.set(token, data.id);
  return data.id;
}

// ---- espelho local (por token) ----
const mirrorKey = (token: string) => `viradao:team:${token}`;
export function readMirror(token: string): Partial<HydratePatch> | null {
  try {
    const raw = localStorage.getItem(mirrorKey(token));
    return raw ? (JSON.parse(raw) as Partial<HydratePatch>) : null;
  } catch {
    return null;
  }
}
function writeMirror(token: string, p: HydratePatch): void {
  try {
    localStorage.setItem(mirrorKey(token), JSON.stringify(p));
  } catch {
    /* quota: ignora */
  }
}

// ---- deriva o estado do jogo a partir das linhas do banco ----
// O tempo restante vem PRONTO do servidor (view team_state, remaining_seconds),
// entao o cliente nunca depende de matematica de offset para o resume. O relogio
// que corre conta a partir de serverNow() + remaining (mesmo referencial do tick).
function deriveState(team: TeamRow, unlocks: UnlockRow[]): Partial<HydratePatch> {
  const remaining = Math.max(0, team.remaining_seconds);

  if (team.status === "await") {
    return {
      phase: "await",
      endsAt: null,
      remaining,
      initialSeconds: team.initial_seconds,
      mainUnlocked: [],
      secondaryUnlocked: [],
      log: [],
      currentMission: "",
      finalKind: null,
      finalCardId: null,
      firedCues: [],
    };
  }

  const ordered = [...unlocks].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // A abertura e implicita: todo time que ja comecou a tem aberta, mesmo que ela
  // nao esteja na tabela (nao e gravada). Prepende sem duplicar.
  const dbMain = ordered.filter((u) => u.kind !== "secundaria").map((u) => u.card_id);
  const mainUnlocked = ["abertura", ...dbMain.filter((id) => id !== "abertura")];
  const secondaryUnlocked = ordered.filter((u) => u.kind === "secundaria").map((u) => u.card_id);
  const log = ordered.map((u) => ({
    id: u.card_id,
    at: new Date(u.created_at).getTime(),
    bonus: u.bonus_seconds || 0,
  }));

  let currentMission = "";
  for (const id of mainUnlocked) {
    const c = CARD_BY_ID[id];
    if (c?.updatesMission && c.mission) currentMission = c.mission;
  }

  const frozen = team.status === "success" || team.status === "failed";
  // endsAt no referencial da HORA DO SERVIDOR (serverNow), igual ao tick e ao start,
  // para o cronometro local e o servidor falarem a mesma lingua. Ponto 7.
  const endsAt = frozen ? null : Math.round(serverNow() + remaining * 1000);

  // Avisos de urgencia ja ultrapassados nao devem retocar ao reabrir.
  const firedCues = URGENCY_CUES.filter((c) => c.atSeconds >= remaining).map((c) => c.atSeconds);

  return {
    phase: team.status,
    endsAt,
    remaining,
    initialSeconds: team.initial_seconds,
    mainUnlocked,
    secondaryUnlocked,
    log,
    currentMission,
    finalKind: team.final_kind,
    finalCardId: team.final_card_id,
    firedCues,
    audioUnlocked: true,
  };
}

// Progresso do jogo, para o resume nunca REGREDIR o estado local. Uma busca que
// resolve tarde (depois de o usuario ja ter dado Start) traz um snapshot velho;
// ela so pode ser aplicada se for igual ou mais avancada que o local.
function rank(phase: string): number {
  if (phase === "failed" || phase === "success") return 2;
  if (phase === "running" || phase === "paused") return 1;
  return 0; // await
}
function progress(p: { phase?: string; mainUnlocked?: string[]; secondaryUnlocked?: string[] }) {
  return {
    r: rank(p.phase ?? "await"),
    n: (p.mainUnlocked?.length ?? 0) + (p.secondaryUnlocked?.length ?? 0),
  };
}

async function fetchAndHydrate(token: string, mode: SyncMode = "resume"): Promise<boolean> {
  const { data: team, error } = await supabase
    .from("team_state")
    .select("id,status,initial_seconds,final_kind,final_card_id,remaining_seconds")
    .eq("token", token)
    .single();
  if (error || !team) return false;
  teamIds.set(token, team.id);
  const { data: unlocks } = await supabase
    .from("unlocks")
    .select("card_id,bonus_seconds,kind,created_at")
    .eq("team_id", team.id);
  const patch = deriveState(team as TeamRow, (unlocks as UnlockRow[]) ?? []);
  const store = useGameStore.getState();

  // Authority (painel via realtime) pode regredir de proposito (ex.: reset).
  // Resume e resync nunca regridem o local (corrida de busca tardia / snapshot velho).
  if (mode !== "authority") {
    const local = progress(store);
    const incoming = progress(patch);
    if (incoming.r < local.r || (incoming.r === local.r && incoming.n < local.n)) {
      return true;
    }
  }

  // Protecao do relogio na reconexao de rede (resync). Um snapshot que chega num
  // evento "online" NUNCA pode derrubar bruscamente o cronometro nem encerrar um
  // jogo que, para o aparelho, ainda corre. So o tick (com carencia) ou o painel
  // (authority) tem direito de encerrar. Ponto 7, camadas 2 e 3.
  if (mode === "resync" && store.phase === "running") {
    if (patch.phase === "running" || patch.phase === "paused") {
      const serverEndsAt = patch.endsAt;
      const localEndsAt = store.endsAt;
      if (typeof serverEndsAt === "number" && typeof localEndsAt === "number") {
        const delta = serverEndsAt - localEndsAt; // >0 = servidor concede mais tempo
        // Ganho de tempo entra na hora; perda converge limitada (sem tranco ate 0).
        const endsAt =
          delta >= 0 ? serverEndsAt : localEndsAt + Math.max(delta, -MAX_RESYNC_DROP_MS);
        patch.endsAt = endsAt;
        patch.remaining = Math.max(0, (endsAt - serverNow()) / 1000);
      }
      patch.phase = "running"; // resync jamais congela um jogo em andamento
      patch.firedCues = store.firedCues; // relogio local manda: nao suprime avisos
    } else {
      // Servidor diz encerrado/aguardando, mas o aparelho ainda corre: nao confiamos
      // num snapshot de resync para matar o jogo. Ignora este snapshot.
      return true;
    }
  }

  store.hydrate(patch);
  return true;
}

// ================= Fila offline =================
type Op =
  | { type: "start"; token: string; startedAt: string; initialSeconds: number }
  | { type: "unlock"; token: string; card_id: string; bonus_seconds: number; kind: Kind }
  | { type: "update"; token: string; fields: Record<string, unknown> }
  | { type: "reset"; token: string };

const QKEY = "viradao_queue";
function loadQueue(): Op[] {
  try {
    return JSON.parse(localStorage.getItem(QKEY) || "[]") as Op[];
  } catch {
    return [];
  }
}
function saveQueue(q: Op[]): void {
  localStorage.setItem(QKEY, JSON.stringify(q));
}
function enqueue(op: Op): void {
  const q = loadQueue();
  q.push(op);
  saveQueue(q);
  void flush();
}

let flushing = false;
async function runOp(op: Op): Promise<void> {
  if (op.type === "start") {
    // started_at = now() do servidor (via RPC), nunca o relogio do cliente.
    const { error } = await supabase.rpc("start_team", { p_token: op.token });
    if (error) throw error;
  } else if (op.type === "unlock") {
    const teamId = await resolveTeamId(op.token);
    if (!teamId) throw new Error("sem team_id");
    const { error } = await supabase
      .from("unlocks")
      .upsert(
        { team_id: teamId, card_id: op.card_id, bonus_seconds: op.bonus_seconds, kind: op.kind },
        { onConflict: "team_id,card_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  } else if (op.type === "update") {
    const { error } = await supabase.from("teams").update(op.fields).eq("token", op.token);
    if (error) throw error;
  } else if (op.type === "reset") {
    const teamId = await resolveTeamId(op.token);
    const { error } = await supabase
      .from("teams")
      .update({
        status: "await",
        started_at: null,
        paused_remaining: null,
        panel_adjust_seconds: 0,
        final_kind: null,
        final_card_id: null,
      })
      .eq("token", op.token);
    if (error) throw error;
    if (teamId) await supabase.from("unlocks").delete().eq("team_id", teamId);
  }
}

export async function flush(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    // Recarrega a fila a cada passo: ops enfileiradas durante o await (ex.: o
    // start e o unlock da abertura saem quase juntos) nao podem ser perdidas.
    while (true) {
      const q = loadQueue();
      if (!q.length) break;
      try {
        await runOp(q[0]);
      } catch {
        break; // offline ou erro: tenta de novo no proximo online
      }
      const after = loadQueue();
      after.shift(); // remove so a head processada; preserva o que chegou depois
      saveQueue(after);
    }
  } finally {
    flushing = false;
  }
}

// ================= API usada pelo store =================
export function pushStart(token: string, startedAt: string, initialSeconds: number): void {
  enqueue({ type: "start", token, startedAt, initialSeconds });
}
export function pushUnlock(
  token: string,
  card_id: string,
  bonus_seconds: number,
  kind: Kind,
): void {
  enqueue({ type: "unlock", token, card_id, bonus_seconds, kind });
}
export function pushTeamUpdate(token: string, fields: Record<string, unknown>): void {
  enqueue({ type: "update", token, fields });
}
export function pushReset(token: string): void {
  enqueue({ type: "reset", token });
}

// ================= Liga tudo (chamado pela TeamScreen) =================
export function attach(token: string): () => void {
  // 1. resume instantaneo pelo espelho (funciona ate offline)
  const mirror = readMirror(token);
  if (mirror) useGameStore.getState().hydrate(mirror);

  // 2. hora do servidor + estado do banco (best-effort). A ordem importa: o offset
  // precisa estar pronto ANTES do resume, porque o relogio agora e ancorado nele.
  void initServerTime().then(() => {
    void fetchAndHydrate(token, "resume");
    void flush();
  });

  // Tempos por estacao do banco (Ponto 8): carrega antes/no inicio do jogo.
  void loadStations();

  // 3. espelha cada mudanca do store no localStorage
  const unsubStore = useGameStore.subscribe((s) => {
    writeMirror(token, {
      phase: s.phase,
      endsAt: s.endsAt,
      remaining: s.remaining,
      initialSeconds: s.initialSeconds,
      mainUnlocked: s.mainUnlocked,
      secondaryUnlocked: s.secondaryUnlocked,
      log: s.log,
      currentMission: s.currentMission,
      finalKind: s.finalKind,
      finalCardId: s.finalCardId,
      firedCues: s.firedCues,
      audioUnlocked: s.audioUnlocked,
    });
  });

  // 4. quando a net voltar: primeiro drena a fila, depois re-sincroniza do banco
  // (a ordem importa, senao o fetch pegaria o estado antes dos unlocks subirem).
  // Modo "resync": reconcilia sem deixar o snapshot derrubar/encerrar o relogio.
  const onOnline = async () => {
    await flush();
    await fetchAndHydrate(token, "resync");
  };
  window.addEventListener("online", onOnline);

  // 5. realtime (Fase 4): o painel do lider mexe no relogio/status a distancia, e
  // a equipe reflete ao vivo. force=true porque o painel e autoridade (ex.: reset
  // precisa regredir a equipe para "aguardando").
  const channel = supabase
    .channel(`team-${token}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "viradao", table: "teams", filter: `token=eq.${token}` },
      () => void fetchAndHydrate(token, "authority"),
    )
    .subscribe();

  // 5b. unlocks da PROPRIA equipe via realtime (Fase 6, Ponto 4): o painel pode
  // marcar/desmarcar missoes (insert/delete em unlocks) a distancia, e a equipe tem
  // de refletir ao vivo. Precisa do team_id (unlocks nao tem token); resolve async e
  // cria um canal proprio. Modo "authority": pode regredir (desmarcar tira o bonus).
  let unlockChannel: ReturnType<typeof supabase.channel> | null = null;
  void resolveTeamId(token).then((id) => {
    if (!id) return;
    unlockChannel = supabase
      .channel(`team-unlocks-${token}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "viradao", table: "unlocks", filter: `team_id=eq.${id}` },
        () => void fetchAndHydrate(token, "authority"),
      )
      .subscribe();
  });

  // 6. presenca ao vivo (Fase 6, Pontos 2/3): cada celular entra num canal
  // compartilhado e se anuncia com seu token. O painel conta quantos celulares de
  // cada equipe estao com o app aberto agora. Puramente aditivo: nao toca no
  // relogio nem no estado do jogo, so anuncia presenca.
  const presenceKey =
    crypto?.randomUUID?.() ?? `c-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const presence = supabase.channel("presence-viradao", {
    config: { presence: { key: presenceKey } },
  });
  presence.subscribe((status) => {
    if (status === "SUBSCRIBED") void presence.track({ token });
  });

  // 7. cross-feed entre equipes (Fase 6, Ponto 9): toggle global + avisos passageiros.
  //  - estado inicial do toggle vem do evento (events.show_cross_feed);
  //  - mudancas do toggle chegam ao vivo (events no realtime);
  //  - conclusoes de OUTRAS equipes chegam por Broadcast e viram toast (o filtro do
  //    proprio token evita anunciar a si mesmo; o useFeedStore respeita o toggle).
  void supabase
    .from("events")
    .select("show_cross_feed")
    .limit(1)
    .single()
    .then(({ data }) => {
      if (data) useFeedStore.getState().setShowCrossFeed(!!data.show_cross_feed);
    });

  feedChannel = supabase
    .channel(FEED_CHANNEL)
    .on("broadcast", { event: "completion" }, ({ payload }) => {
      const p = payload as { fromToken?: string; text?: string };
      if (!p?.text || p.fromToken === token) return; // nao anuncia a si mesmo
      useFeedStore.getState().push(p.text);
    })
    .on(
      "postgres_changes",
      { event: "*", schema: "viradao", table: "events" },
      ({ new: row }) => {
        const r = row as { show_cross_feed?: boolean };
        if (typeof r?.show_cross_feed === "boolean")
          useFeedStore.getState().setShowCrossFeed(r.show_cross_feed);
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "viradao", table: "stations" },
      () => void loadStations(), // Ponto 8: tempo editado no painel atualiza o cache
    )
    .subscribe();

  return () => {
    unsubStore();
    window.removeEventListener("online", onOnline);
    void supabase.removeChannel(channel);
    if (unlockChannel) void supabase.removeChannel(unlockChannel);
    void supabase.removeChannel(presence);
    if (feedChannel) void supabase.removeChannel(feedChannel);
    feedChannel = null;
  };
}
