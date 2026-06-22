import { create } from "zustand";
import {
  ABERTURA,
  CARD_BY_CODE,
  DEFAULT_INITIAL_SECONDS,
  FINAL_FRACASSO,
  URGENCY_AUDIO,
  URGENCY_CUES,
  type FinalKind,
  type StoryCard,
} from "@/content/story";
import { normalizeCode } from "@/lib/helpers";
import { pushStart, pushUnlock, pushTeamUpdate, pushReset } from "@/lib/sync";

export type GamePhase = "await" | "running" | "paused" | "failed" | "success";

// Mapeia a etiqueta do card para o "kind" guardado na tabela viradao.unlocks.
function unlockKind(card: StoryCard): "principal" | "secundaria" | "final" {
  if (card.tag === "secundaria") return "secundaria";
  if (card.tag === "final") return "final";
  return "principal"; // abertura e estacoes
}

export type SubmitResult =
  | { kind: "unknown" }
  | { kind: "already"; card: StoryCard }
  | { kind: "unlocked"; card: StoryCard; bonus: number }
  | { kind: "final"; card: StoryCard };

export interface UnlockEntry {
  id: string;
  at: number; // ms
  bonus: number; // segundos somados
}

interface FeedbackEvent {
  ts: number;
  amount: number; // segundos do bonus
}

interface BannerEvent {
  ts: number;
  text: string;
  level: "amber" | "red";
  audio: string; // url da narracao de urgencia (tocada por cima, com ducking)
}

// Campos do estado que sao reconstruidos no resume (do banco ou do espelho local).
export interface HydratePatch {
  phase: GamePhase;
  endsAt: number | null;
  remaining: number;
  mainUnlocked: string[];
  secondaryUnlocked: string[];
  log: UnlockEntry[];
  currentMission: string;
  finalKind: FinalKind | null;
  finalCardId: string | null;
  firedCues: number[];
  audioUnlocked: boolean;
}

interface GameState {
  phase: GamePhase;
  teamToken: string | null;
  initialSeconds: number;
  endsAt: number | null; // ms (horario-alvo)
  remaining: number; // segundos restantes (recalculado no tick)
  pausedRemaining: number | null;

  mainUnlocked: string[]; // ids principais + abertura, na ordem
  secondaryUnlocked: string[]; // ids secundarios, na ordem
  log: UnlockEntry[]; // tudo, com horario e bonus
  currentMission: string;
  finalKind: FinalKind | null;
  finalCardId: string | null;

  audioUnlocked: boolean;
  firedCues: number[]; // marcos ja disparados (em segundos)

  lastUnlockTick: number; // muda a cada destravamento (sinaliza auto-open)
  lastUnlockId: string | null;
  feedback: FeedbackEvent | null; // balao "+min"
  banner: BannerEvent | null; // banner de urgencia

  // acoes
  setToken: (token: string) => void;
  hydrate: (patch: Partial<HydratePatch>) => void;
  setInitial: (seconds: number) => void;
  start: () => void;
  submitCode: (raw: string) => SubmitResult;
  tick: () => void;
  reset: () => void;
}

function unlockCard(state: GameState, card: StoryCard, now: number): Partial<GameState> {
  const patch: Partial<GameState> = {
    lastUnlockTick: now,
    lastUnlockId: card.id,
    log: [...state.log, { id: card.id, at: now, bonus: card.bonusSeconds }],
  };

  if (card.tag === "secundaria") {
    patch.secondaryUnlocked = [...state.secondaryUnlocked, card.id];
  } else {
    patch.mainUnlocked = [...state.mainUnlocked, card.id];
  }

  // Bonus de tempo: muda o horario-alvo.
  if (card.bonusSeconds > 0 && state.endsAt) {
    patch.endsAt = state.endsAt + card.bonusSeconds * 1000;
    patch.feedback = { ts: now, amount: card.bonusSeconds };
  }

  // Missao vigente: so principais atualizam.
  if (card.updatesMission && card.mission) {
    patch.currentMission = card.mission;
  }

  return patch;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "await",
  teamToken: null,
  initialSeconds: DEFAULT_INITIAL_SECONDS,
  endsAt: null,
  remaining: DEFAULT_INITIAL_SECONDS,
  pausedRemaining: null,

  mainUnlocked: [],
  secondaryUnlocked: [],
  log: [],
  currentMission: "",
  finalKind: null,
  finalCardId: null,

  audioUnlocked: false,
  firedCues: [],

  lastUnlockTick: 0,
  lastUnlockId: null,
  feedback: null,
  banner: null,

  // Define a equipe (token da URL). Trocar de token zera o estado para nao
  // vazar progresso de uma equipe para outra (so importa no DevHome de teste).
  setToken: (token) => {
    if (get().teamToken === token) return;
    set({
      teamToken: token,
      phase: "await",
      endsAt: null,
      remaining: get().initialSeconds,
      pausedRemaining: null,
      mainUnlocked: [],
      secondaryUnlocked: [],
      log: [],
      currentMission: "",
      finalKind: null,
      finalCardId: null,
      audioUnlocked: false,
      firedCues: [],
      lastUnlockTick: 0,
      lastUnlockId: null,
      feedback: null,
      banner: null,
    });
  },

  // Aplica um estado vindo do banco ou do espelho local (resume / realtime).
  // So mexe nos campos informados; sinais de auto-open (lastUnlock*) ficam de fora
  // de proposito, para o resume nao re-narrar nem recolher um card aberto.
  hydrate: (patch) => set((s) => ({ ...s, ...patch })),

  setInitial: (seconds) => {
    if (get().phase !== "await") return;
    set({ initialSeconds: seconds, remaining: seconds });
  },

  start: () => {
    const { phase, initialSeconds, teamToken } = get();
    if (phase !== "await") return;
    // O relogio que corre usa o tempo do APARELHO (Date.now), imune a drift de
    // offset. A hora do servidor entra so no resume (sync.ts).
    const device = Date.now();
    const endsAt = device + initialSeconds * 1000;
    set({
      phase: "running",
      endsAt,
      remaining: initialSeconds,
      audioUnlocked: true,
    });
    // Destrava a abertura (card 0), que abre sozinha.
    set((s) => ({ ...s, ...unlockCard(get(), ABERTURA, device) }));
    // Persiste so o inicio. O started_at e definido pelo now() do SERVIDOR (RPC
    // start_team no flush), nunca pelo relogio do cliente. A abertura nao e
    // gravada: e implicita (todo time que ja deu Start a tem aberta).
    if (teamToken) {
      pushStart(teamToken, new Date().toISOString(), initialSeconds);
    }
  },

  submitCode: (raw) => {
    const state = get();
    if (state.phase !== "running") {
      return { kind: "unknown" };
    }
    const code = normalizeCode(raw);
    const card = CARD_BY_CODE[code];
    if (!card) return { kind: "unknown" };

    const alreadyMain = state.mainUnlocked.includes(card.id);
    const alreadySec = state.secondaryUnlocked.includes(card.id);
    if (alreadyMain || alreadySec) {
      // Codigo ja usado: so realca, sem somar tempo.
      set({ lastUnlockTick: Date.now(), lastUnlockId: card.id });
      return { kind: "already", card };
    }

    const now = Date.now();
    const token = state.teamToken;

    // Finais por palavra-chave (v1 / v2): congelam o cronometro.
    if (card.tag === "final") {
      const remaining = state.remaining;
      set((s) => ({
        ...s,
        ...unlockCard(get(), card, now),
        phase: "success",
        finalKind: card.finalKind ?? null,
        finalCardId: card.id,
        endsAt: null,
        pausedRemaining: remaining,
        remaining,
      }));
      if (token) {
        pushUnlock(token, card.id, card.bonusSeconds, unlockKind(card));
        pushTeamUpdate(token, {
          status: "success",
          final_kind: card.finalKind ?? null,
          final_card_id: card.id,
          paused_remaining: Math.round(remaining),
        });
      }
      return { kind: "final", card };
    }

    set((s) => ({ ...s, ...unlockCard(get(), card, now) }));
    if (token) pushUnlock(token, card.id, card.bonusSeconds, unlockKind(card));
    return { kind: "unlocked", card, bonus: card.bonusSeconds };
  },

  tick: () => {
    const state = get();
    if (state.phase !== "running" || state.endsAt == null) return;
    const remaining = Math.max(0, (state.endsAt - Date.now()) / 1000);
    const patch: Partial<GameState> = { remaining };

    // Avisos de urgencia: dispara uma vez ao cruzar o marco para baixo.
    for (const cue of URGENCY_CUES) {
      if (remaining <= cue.atSeconds && !state.firedCues.includes(cue.atSeconds)) {
        patch.firedCues = [...(patch.firedCues ?? state.firedCues), cue.atSeconds];
        patch.banner = {
          ts: Date.now(),
          text: cue.banner,
          level: cue.atSeconds <= 60 ? "red" : "amber",
          audio: URGENCY_AUDIO(cue.audio),
        };
      }
    }

    // Fracasso automatico ao zerar (dispara mesmo offline).
    if (remaining <= 0) {
      const now = Date.now();
      patch.phase = "failed";
      patch.finalKind = "fracasso";
      patch.finalCardId = FINAL_FRACASSO.id;
      patch.endsAt = null;
      patch.mainUnlocked = [...state.mainUnlocked, FINAL_FRACASSO.id];
      patch.log = [...state.log, { id: FINAL_FRACASSO.id, at: now, bonus: 0 }];
      patch.lastUnlockTick = now;
      patch.lastUnlockId = FINAL_FRACASSO.id;
      // Persiste o fracasso (mesmo que tenha zerado offline, sobe quando voltar).
      if (state.teamToken) {
        pushUnlock(state.teamToken, FINAL_FRACASSO.id, 0, "final");
        pushTeamUpdate(state.teamToken, {
          status: "failed",
          final_kind: "fracasso",
          final_card_id: FINAL_FRACASSO.id,
          paused_remaining: 0,
        });
      }
    }

    set(patch);
  },

  reset: () => {
    const token = get().teamToken;
    set({
      phase: "await",
      endsAt: null,
      remaining: get().initialSeconds,
      pausedRemaining: null,
      mainUnlocked: [],
      secondaryUnlocked: [],
      log: [],
      currentMission: "",
      finalKind: null,
      finalCardId: null,
      audioUnlocked: false,
      firedCues: [],
      lastUnlockTick: 0,
      lastUnlockId: null,
      feedback: null,
      banner: null,
    });
    // Persiste o reset: equipe volta ao zero no banco e apaga os destravamentos.
    if (token) pushReset(token);
  },
}));
