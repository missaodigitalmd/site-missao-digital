import { create } from "zustand";
import {
  ABERTURA,
  CARD_BY_CODE,
  DEFAULT_INITIAL_SECONDS,
  FINAL_FRACASSO,
  PRINCIPAIS,
  PRESET_TEAMS,
  URGENCY_AUDIO,
  URGENCY_CUES,
  type FinalKind,
  type StoryCard,
} from "@/content/story";
import { normalizeCode, formatTime } from "@/lib/helpers";
import {
  pushStart,
  pushUnlock,
  pushTeamUpdate,
  pushReset,
  broadcastCompletion,
  stationBonus,
} from "@/lib/sync";
import { serverNow } from "@/lib/serverTime";

// Nome bonito da equipe a partir do token (para o cross-feed do Ponto 9).
function teamName(token: string | null): string {
  const m = token ? /team-(\d+)/.exec(token) : null;
  return (m && PRESET_TEAMS[parseInt(m[1], 10) - 1]) || "Uma equipe";
}

// Carencia antes de declarar fracasso automatico: o tempo precisa ficar zerado de
// forma consistente (confirmado pela hora do servidor) por esta janela. Protege
// contra um glitch de um frame ou um snapshot transitorio matar a equipe. Ponto 7.
const FAIL_GRACE_MS = 2500;

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
  | { kind: "final"; card: StoryCard }
  | { kind: "locked"; card: StoryCard; needed?: string };

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
  initialSeconds?: number; // tempo inicial real do evento (para o resumo da partida)
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
  zeroSince: number | null; // serverNow do 1o frame zerado; carencia anti-glitch

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
  // Bonus efetivo: tempo configurado no painel (banco), com fallback no story.ts. Ponto 8.
  const bonus = stationBonus(card.id, card.bonusSeconds);
  const patch: Partial<GameState> = {
    lastUnlockTick: now,
    lastUnlockId: card.id,
    log: [...state.log, { id: card.id, at: now, bonus }],
  };

  if (card.tag === "secundaria") {
    patch.secondaryUnlocked = [...state.secondaryUnlocked, card.id];
  } else {
    patch.mainUnlocked = [...state.mainUnlocked, card.id];
  }

  // Bonus de tempo: muda o horario-alvo.
  if (bonus > 0 && state.endsAt) {
    patch.endsAt = state.endsAt + bonus * 1000;
    patch.feedback = { ts: now, amount: bonus };
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
  zeroSince: null,

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
      zeroSince: null,
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
    // O relogio que corre e ancorado na HORA DO SERVIDOR (serverNow = Date.now +
    // offset cacheado), nao no relogio cru do aparelho. Assim o cronometro local e
    // o servidor falam a mesma lingua: uma ressincronizacao vira ajuste, nao tranco.
    const anchor = serverNow();
    const endsAt = anchor + initialSeconds * 1000;
    set({
      phase: "running",
      endsAt,
      remaining: initialSeconds,
      audioUnlocked: true,
      zeroSince: null,
    });
    // Destrava a abertura (card 0), que abre sozinha.
    set((s) => ({ ...s, ...unlockCard(get(), ABERTURA, anchor) }));
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

    // Ponto 5: encadeamento da historia. Uma etapa principal so abre se a anterior
    // (order - 1) ja foi resolvida; o final (v1/v2) so com as 4 principais
    // destravadas. Bloqueio puramente local: nao destrava nem da bonus. As
    // secundarias seguem livres (podem ser pegas a qualquer momento).
    if (card.tag === "principal" && typeof card.order === "number" && card.order > 1) {
      const prev = PRINCIPAIS.find((p) => p.order === card.order! - 1);
      if (prev && !state.mainUnlocked.includes(prev.id)) {
        return { kind: "locked", card, needed: prev.title };
      }
    }
    if (card.tag === "final") {
      const missing = PRINCIPAIS.find((p) => !state.mainUnlocked.includes(p.id));
      if (missing) return { kind: "locked", card, needed: missing.title };
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
        // Cross-feed (Ponto 9): conclusao do jogo, com o tempo que sobrou.
        broadcastCompletion(token, `${teamName(token)} concluiu a missão com ${formatTime(remaining)} sobrando.`);
      }
      return { kind: "final", card };
    }

    const effBonus = stationBonus(card.id, card.bonusSeconds); // Ponto 8
    set((s) => ({ ...s, ...unlockCard(get(), card, now) }));
    if (token) {
      pushUnlock(token, card.id, effBonus, unlockKind(card));
      // Cross-feed (Ponto 9): principal anuncia a etapa; secundaria sem revelar qual.
      const msg =
        card.tag === "secundaria"
          ? `${teamName(token)} descobriu uma missão secundária.`
          : `${teamName(token)} concluiu a ${card.order}ª etapa.`;
      broadcastCompletion(token, msg);
    }
    return { kind: "unlocked", card, bonus: effBonus };
  },

  tick: () => {
    const state = get();
    if (state.phase !== "running" || state.endsAt == null) return;
    // Conta contra a hora do servidor (endsAt tambem esta no referencial do
    // servidor), nao contra Date.now() cru. Se o SO do celular corrigir a hora no
    // meio do jogo, o offset cacheado absorve, e o cronometro nao da salto.
    const remaining = Math.max(0, (state.endsAt - serverNow()) / 1000);
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

    // Fracasso automatico ao zerar (dispara mesmo offline), porem com CARENCIA: o
    // tempo precisa ficar zerado de forma consistente (FAIL_GRACE_MS, medido pela
    // hora do servidor) antes de declarar fracasso. Um zero transitorio (glitch de
    // relogio, snapshot de resync) nao mata mais a equipe. Ponto 7.
    if (remaining > 0) {
      if (state.zeroSince != null) patch.zeroSince = null; // recuperou tempo (bonus)
      set(patch);
      return;
    }

    const t = serverNow();
    if (state.zeroSince == null) {
      patch.zeroSince = t; // marca o inicio do zero; ainda nao falha
      set(patch);
      return;
    }
    if (t - state.zeroSince < FAIL_GRACE_MS) {
      set(patch); // dentro da carencia: mostra 00:00, segura o fracasso
      return;
    }

    // Zero confirmado por tempo suficiente: agora sim, fracasso.
    {
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
      zeroSince: null,
      lastUnlockTick: 0,
      lastUnlockId: null,
      feedback: null,
      banner: null,
    });
    // Persiste o reset: equipe volta ao zero no banco e apaga os destravamentos.
    if (token) pushReset(token);
  },
}));
