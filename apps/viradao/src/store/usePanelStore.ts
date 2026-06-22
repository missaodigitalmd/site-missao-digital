import { create } from "zustand";
import { DEFAULT_INITIAL_SECONDS, CARD_BY_ID, PRESET_TEAMS } from "@/content/story";
import { supabase } from "@/lib/supabase";

// Nome de exibicao vem da constante local (fonte da verdade do texto), indexada
// pelo token team-N; evita qualquer problema de encoding vindo do banco.
function displayName(token: string, fallback: string): string {
  const m = /team-(\d+)/.exec(token);
  if (m) return PRESET_TEAMS[parseInt(m[1], 10) - 1] ?? fallback;
  return fallback;
}

// Painel de Gerenciamento (Fase 4). Le e escreve no schema viradao do Supabase,
// com realtime: o que o lider faz aqui chega aos aparelhos das equipes ao vivo, e
// o progresso das equipes aparece aqui. O relogio que corre usa tempo do aparelho
// (Date.now), igual a Tela da Equipe; a hora do servidor entra na derivacao.

export type TeamStatus = "aguardando" | "rodando" | "pausada" | "cumpriu" | "falhou" | "encerrada";

export interface UnlockRow {
  title: string;
  time: string; // horario (ex.: "23:14")
  bonus: string; // ex.: "+6:00"
}

export interface PanelTeam {
  id: string; // uuid no banco
  name: string;
  token: string; // token do link oculto (ex.: team-1)
  active: boolean;
  status: TeamStatus;
  endsAt: number | null; // horario-alvo em tempo do aparelho (ms)
  pausedRemaining: number | null;
  remaining: number; // recalculado no tick
  online: boolean;
  mission: string;
  mainCount: number; // principais (estacoes) destravados, de 4
  secCount: number;
  successKind: "v1" | "v2" | null;
  unlocks: UnlockRow[];
  // brutos do banco (para a matematica do relogio nos controles)
  startedAt: number | null;
  initialSeconds: number;
  panelAdjust: number;
  bonusSum: number;
}

interface DbTeam {
  id: string;
  token: string;
  name: string;
  active: boolean;
  status: string;
  started_at: string | null;
  initial_seconds: number;
  paused_remaining: number | null;
  panel_adjust_seconds: number;
  final_kind: string | null;
  bonus_sum: number; // da view team_state
  remaining_seconds: number; // calculado pelo servidor (view team_state)
}
interface DbUnlock {
  team_id: string;
  card_id: string;
  bonus_seconds: number;
  kind: string;
  created_at: string;
}

const STATUS_MAP: Record<string, TeamStatus> = {
  await: "aguardando",
  running: "rodando",
  paused: "pausada",
  success: "cumpriu",
  failed: "falhou",
};

function fmtClock(ts: string): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function fmtBonus(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `+${m}:${String(s).padStart(2, "0")}`;
}

function buildTeam(row: DbTeam, unlocks: DbUnlock[]): PanelTeam {
  const ordered = [...unlocks].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const bonusSum = row.bonus_sum ?? 0;
  const startedAt = row.started_at ? new Date(row.started_at).getTime() : null;
  const status = STATUS_MAP[row.status] ?? "aguardando";

  const mains = ordered.filter((u) => u.kind === "principal" && u.card_id !== "abertura");
  const secs = ordered.filter((u) => u.kind === "secundaria");

  let mission = "";
  for (const u of ordered) {
    const c = CARD_BY_ID[u.card_id];
    if (c?.updatesMission && c.mission) mission = c.mission;
  }

  const list: UnlockRow[] = ordered
    .filter((u) => u.card_id !== "abertura")
    .map((u) => ({
      title: CARD_BY_ID[u.card_id]?.title ?? u.card_id,
      time: fmtClock(u.created_at),
      bonus: fmtBonus(u.bonus_seconds || 0),
    }));

  // Tempo restante vem PRONTO do servidor (view team_state); o relogio que corre
  // conta a partir de Date.now() (frame do aparelho), sem matematica de offset.
  const remaining = Math.max(0, row.remaining_seconds);
  const endsAt = status === "rodando" ? Date.now() + remaining * 1000 : null;

  return {
    id: row.id,
    name: displayName(row.token, row.name),
    token: row.token,
    active: row.active,
    status,
    endsAt,
    pausedRemaining: row.paused_remaining,
    remaining,
    online: true,
    mission,
    mainCount: mains.length,
    secCount: secs.length,
    successKind: status === "cumpriu" ? (row.final_kind as "v1" | "v2" | null) : null,
    unlocks: list,
    startedAt,
    initialSeconds: row.initial_seconds,
    panelAdjust: row.panel_adjust_seconds,
    bonusSum,
  };
}

interface PanelState {
  eventName: string;
  eventId: string | null;
  globalInitialSeconds: number;
  systemActive: boolean;
  loaded: boolean;
  teams: PanelTeam[];

  load: () => Promise<void>;
  subscribe: () => () => void;

  setEventName: (name: string) => void;
  setGlobalInitial: (s: number) => void;
  toggleActive: (id: string) => void;
  activateSystem: () => void;
  backToConfig: () => void;

  startTeam: (id: string) => void;
  pauseTeam: (id: string) => void;
  addTime: (id: string, seconds: number) => void;
  resetTeam: (id: string) => void;

  startAll: () => void;
  pauseAll: () => void;
  addTimeAll: (seconds: number) => void;
  resetAll: () => void;

  tick: () => void;
}

const byId = (id: string) => (t: PanelTeam) => t.id === id;

export const usePanelStore = create<PanelState>((set, get) => {
  // ---- escritas no banco (a equipe reage por realtime) ----
  // Start e pause usam now() do SERVIDOR (RPC), nunca o relogio do cliente, para
  // o horario-alvo nascer sempre certo, mesmo se o offset local estiver ruim.
  async function dbStart(t: PanelTeam) {
    await supabase.rpc("start_team", { p_token: t.token });
  }
  async function dbPauseToggle(t: PanelTeam) {
    await supabase.rpc("pause_team", { p_token: t.token });
  }
  async function dbAddTime(t: PanelTeam, sec: number) {
    if (t.status === "pausada") {
      await supabase
        .from("teams")
        .update({ paused_remaining: Math.max(0, Math.round((t.pausedRemaining ?? 0) + sec)) })
        .eq("id", t.id);
    } else {
      await supabase
        .from("teams")
        .update({ panel_adjust_seconds: t.panelAdjust + sec })
        .eq("id", t.id);
    }
  }
  async function dbReset(t: PanelTeam) {
    await supabase
      .from("teams")
      .update({
        status: "await",
        started_at: null,
        paused_remaining: null,
        panel_adjust_seconds: 0,
        final_kind: null,
        final_card_id: null,
      })
      .eq("id", t.id);
    await supabase.from("unlocks").delete().eq("team_id", t.id);
  }

  return {
    eventName: "Corujão do Viradão, Adolas",
    eventId: null,
    globalInitialSeconds: DEFAULT_INITIAL_SECONDS,
    systemActive: false,
    loaded: false,
    teams: [],

    load: async () => {
      const { data: ev } = await supabase
        .from("events")
        .select("id,name,initial_seconds")
        .order("created_at")
        .limit(1)
        .single();
      const { data: teamRows } = await supabase
        .from("team_state")
        .select(
          "id,token,name,active,status,started_at,initial_seconds,paused_remaining,panel_adjust_seconds,final_kind,bonus_sum,remaining_seconds",
        )
        .order("token");
      const { data: unlockRows } = await supabase
        .from("unlocks")
        .select("team_id,card_id,bonus_seconds,kind,created_at");

      const unlocks = (unlockRows as DbUnlock[]) ?? [];
      const teams = ((teamRows as DbTeam[]) ?? []).map((r) =>
        buildTeam(r, unlocks.filter((u) => u.team_id === r.id)),
      );
      set({
        teams,
        loaded: true,
        eventId: ev?.id ?? null,
        eventName: ev?.name ?? get().eventName,
        globalInitialSeconds: ev?.initial_seconds ?? DEFAULT_INITIAL_SECONDS,
      });
    },

    subscribe: () => {
      let t: ReturnType<typeof setTimeout> | null = null;
      const refetch = () => {
        if (t) clearTimeout(t);
        t = setTimeout(() => void get().load(), 150);
      };
      const channel = supabase
        .channel("panel")
        .on("postgres_changes", { event: "*", schema: "viradao", table: "teams" }, refetch)
        .on("postgres_changes", { event: "*", schema: "viradao", table: "unlocks" }, refetch)
        .subscribe();
      return () => {
        if (t) clearTimeout(t);
        void supabase.removeChannel(channel);
      };
    },

    setEventName: (name) => {
      set({ eventName: name });
      if (get().eventId) void supabase.from("events").update({ name }).eq("id", get().eventId);
    },

    setGlobalInitial: (s) => {
      const anyStarted = get().teams.some((t) => t.status !== "aguardando");
      if (anyStarted) return;
      set((st) => ({
        globalInitialSeconds: s,
        teams: st.teams.map((t) => (t.status === "aguardando" ? { ...t, remaining: s } : t)),
      }));
      const eid = get().eventId;
      if (eid) void supabase.from("events").update({ initial_seconds: s }).eq("id", eid);
      void supabase.from("teams").update({ initial_seconds: s }).eq("status", "await");
    },

    toggleActive: (id) => {
      const t = get().teams.find(byId(id));
      if (!t) return;
      const active = !t.active;
      set((st) => ({ teams: st.teams.map((x) => (x.id === id ? { ...x, active } : x)) }));
      void supabase.from("teams").update({ active }).eq("id", id);
    },

    activateSystem: () => set({ systemActive: true }),
    backToConfig: () => set({ systemActive: false }),

    startTeam: (id) => {
      const t = get().teams.find(byId(id));
      if (!t || t.status !== "aguardando") return;
      void dbStart(t);
    },
    pauseTeam: (id) => {
      const t = get().teams.find(byId(id));
      if (t) void dbPauseToggle(t);
    },
    addTime: (id, sec) => {
      const t = get().teams.find(byId(id));
      if (t) void dbAddTime(t, sec);
    },
    resetTeam: (id) => {
      const t = get().teams.find(byId(id));
      if (t) void dbReset(t);
    },

    startAll: () => {
      get()
        .teams.filter((t) => t.active && t.status === "aguardando")
        .forEach((t) => void dbStart(t));
    },
    pauseAll: () => {
      const anyRunning = get().teams.some((t) => t.active && t.status === "rodando");
      get()
        .teams.filter((t) => t.active)
        .forEach((t) => {
          if (anyRunning && t.status === "rodando") void dbPauseToggle(t);
          else if (!anyRunning && t.status === "pausada") void dbPauseToggle(t);
        });
    },
    addTimeAll: (sec) => {
      get()
        .teams.filter((t) => t.active && t.status !== "aguardando")
        .forEach((t) => void dbAddTime(t, sec));
    },
    resetAll: () => {
      get()
        .teams.filter((t) => t.active)
        .forEach((t) => void dbReset(t));
    },

    // So recalcula o relogio que corre (tempo do aparelho). O estado de verdade
    // vem do banco pelo load/realtime.
    tick: () =>
      set((st) => ({
        teams: st.teams.map((t) => {
          if (t.status === "rodando" && t.endsAt) {
            const rem = Math.max(0, (t.endsAt - Date.now()) / 1000);
            if (rem <= 0) return { ...t, status: "falhou", remaining: 0, endsAt: null };
            return { ...t, remaining: rem };
          }
          return t;
        }),
      })),
  };
});
