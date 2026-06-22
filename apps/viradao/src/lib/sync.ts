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
import { initServerTime } from "./serverTime";
import { useGameStore, type HydratePatch } from "@/store/useGameStore";
import { CARD_BY_ID, URGENCY_CUES } from "@/content/story";

type Kind = "principal" | "secundaria" | "final";

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
// entao o cliente nunca depende do relogio/offset local para o resume. O relogio
// que corre conta a partir de Date.now() + remaining (frame do aparelho, sem drift).
function deriveState(team: TeamRow, unlocks: UnlockRow[]): Partial<HydratePatch> {
  const remaining = Math.max(0, team.remaining_seconds);

  if (team.status === "await") {
    return {
      phase: "await",
      endsAt: null,
      remaining,
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
  const endsAt = frozen ? null : Math.round(Date.now() + remaining * 1000);

  // Avisos de urgencia ja ultrapassados nao devem retocar ao reabrir.
  const firedCues = URGENCY_CUES.filter((c) => c.atSeconds >= remaining).map((c) => c.atSeconds);

  return {
    phase: team.status,
    endsAt,
    remaining,
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

async function fetchAndHydrate(token: string, force = false): Promise<boolean> {
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

  // force=true: mudanca do painel (autoridade) pode regredir (ex.: reset).
  // force=false (resume na carga): nunca regride o local (corrida de busca tardia).
  if (!force) {
    const local = progress(useGameStore.getState());
    const incoming = progress(patch);
    if (incoming.r < local.r || (incoming.r === local.r && incoming.n < local.n)) {
      return true;
    }
  }
  useGameStore.getState().hydrate(patch);
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

  // 2. hora do servidor + estado do banco (best-effort)
  void initServerTime().then(() => {
    void fetchAndHydrate(token);
    void flush();
  });

  // 3. espelha cada mudanca do store no localStorage
  const unsubStore = useGameStore.subscribe((s) => {
    writeMirror(token, {
      phase: s.phase,
      endsAt: s.endsAt,
      remaining: s.remaining,
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
  const onOnline = async () => {
    await flush();
    await fetchAndHydrate(token, true);
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
      () => void fetchAndHydrate(token, true),
    )
    .subscribe();

  return () => {
    unsubStore();
    window.removeEventListener("online", onOnline);
    void supabase.removeChannel(channel);
  };
}
