// Controlador de narracao do app (Design System 6.4).
//
// Modelo: UM arquivo de audio por card (uma narracao por estacao/secao, com
// narrador e personagens no mesmo arquivo). A revelacao das caixas e
// distribuida ao longo da DURACAO do audio (sem sincronia perfeita: se o audio
// tem 1 min, as caixas vao aparecendo ao longo desse 1 min). A timeline e
// continua em segundos e da para clicar para voltar/avancar.
//
// Sem o arquivo de audio, o player cai num "tempo sintetico" (durationHint) e a
// revelacao acontece por tempo, entao a Fase 2 roda mesmo sem nenhum audio.
//
// Um audio por vez; pausar/retomar; ducking da urgencia por cima da narracao.

import { Howl, Howler } from "howler";
import { useAudioStore } from "@/store/useAudioStore";

interface PlayOpts {
  cardId: string;
  src: string; // audio/{cardId}.mp3
  total: number; // numero de caixas do card (para distribuir a revelacao)
  durationHint: number; // segundos sinteticos quando nao ha audio (fallback)
  startFraction?: number; // 0..1 (para re-tocar de um ponto)
  onProgress: (fraction: number, revealCount: number) => void;
  onDone: () => void;
}

interface Active {
  cardId: string;
  total: number;
  onProgress: (fraction: number, revealCount: number) => void;
  onDone: () => void;
  howl: Howl | null;
  usingAudio: boolean;
  duration: number; // segundos (real ou sintetico); 0 = ainda desconhecido
  baseElapsed: number; // segundos ja decorridos no trecho atual (fallback / seek)
  startedAt: number; // performance.now() do inicio do trecho atual
  raf: number | null;
  paused: boolean;
  duckedByUrgency: boolean;
}

let A: Active | null = null;
let urgencyHowl: Howl | null = null;

export function unlock(): void {
  try {
    const ctx = Howler.ctx as AudioContext | undefined;
    if (ctx && ctx.state === "suspended") void ctx.resume();
  } catch {
    /* sem WebAudio: o html5 audio ainda funciona */
  }
}

export function isActive(cardId: string): boolean {
  return A?.cardId === cardId;
}

function revealFor(frac: number, total: number): number {
  return Math.min(total, Math.max(1, Math.floor(frac * total) + 1));
}

function currentTime(a: Active): number {
  if (a.usingAudio && a.howl) return Number(a.howl.seek()) || 0;
  if (a.paused) return a.baseElapsed;
  return a.baseElapsed + (performance.now() - a.startedAt) / 1000;
}

function stopLoop(a: Active): void {
  if (a.raf != null) {
    cancelAnimationFrame(a.raf);
    a.raf = null;
  }
}

function startLoop(a: Active): void {
  stopLoop(a);
  const loop = () => {
    if (A !== a || a.paused) return;
    const t = currentTime(a);
    const frac = a.duration > 0 ? Math.min(1, t / a.duration) : 0;
    a.onProgress(frac, revealFor(frac, a.total));
    if (frac >= 1 && !a.usingAudio) {
      finish(a);
      return;
    }
    a.raf = requestAnimationFrame(loop);
  };
  a.raf = requestAnimationFrame(loop);
}

function finish(a: Active): void {
  stopLoop(a);
  a.onProgress(1, a.total);
  a.onDone();
  const id = a.cardId;
  disposeHowl(a);
  A = null;
  clearActiveFlag(id);
}

function disposeHowl(a: Active): void {
  if (a.howl) {
    a.howl.off();
    a.howl.stop();
    a.howl.unload();
    a.howl = null;
  }
}

function clearActiveFlag(cardId: string): void {
  if (useAudioStore.getState().activeId === cardId) {
    useAudioStore.getState().setActive(null);
  }
}

export function stop(cardId?: string): void {
  if (!A) return;
  if (cardId && A.cardId !== cardId) return;
  const id = A.cardId;
  stopLoop(A);
  disposeHowl(A);
  A = null;
  clearActiveFlag(id);
}

export function play(opts: PlayOpts): void {
  stop(); // um audio por vez
  const a: Active = {
    cardId: opts.cardId,
    total: opts.total,
    onProgress: opts.onProgress,
    onDone: opts.onDone,
    howl: null,
    usingAudio: false,
    duration: 0,
    baseElapsed: 0,
    startedAt: performance.now(),
    raf: null,
    paused: false,
    duckedByUrgency: false,
  };
  A = a;
  useAudioStore.getState().setActive(opts.cardId);

  const start = Math.max(0, Math.min(1, opts.startFraction ?? 0));
  // mostra de cara a primeira caixa, sem esperar o audio carregar
  opts.onProgress(start, revealFor(start, opts.total));

  const howl = new Howl({ src: [opts.src], html5: true });
  a.howl = howl;

  howl.once("load", () => {
    if (A !== a) return;
    a.usingAudio = true;
    a.duration = howl.duration() || opts.durationHint;
    const t = start * a.duration;
    howl.seek(t);
    howl.play();
    startLoop(a);
  });
  howl.once("loaderror", () => {
    if (A !== a) return;
    // arquivo ainda nao produzido: tempo sintetico
    a.usingAudio = false;
    a.duration = opts.durationHint;
    a.baseElapsed = start * a.duration;
    a.startedAt = performance.now();
    startLoop(a);
  });
  howl.once("end", () => {
    if (A === a) finish(a);
  });
}

export function pause(): void {
  const a = A;
  if (!a || a.paused) return;
  a.paused = true;
  stopLoop(a);
  if (a.usingAudio && a.howl) {
    a.howl.pause();
  } else {
    a.baseElapsed = currentTime(a);
  }
}

export function resume(): void {
  const a = A;
  if (!a || !a.paused) return;
  a.paused = false;
  if (a.usingAudio && a.howl) {
    a.howl.play();
  } else {
    a.startedAt = performance.now();
  }
  startLoop(a);
}

/** Salta no tempo da narracao (clique na timeline). fraction 0..1. */
export function seek(cardId: string, fraction: number): void {
  const a = A;
  if (!a || a.cardId !== cardId || a.duration <= 0) return;
  const f = Math.max(0, Math.min(1, fraction));
  const t = f * a.duration;
  a.paused = false;
  if (a.usingAudio && a.howl) {
    a.howl.seek(t);
    if (!a.howl.playing()) a.howl.play();
  } else {
    a.baseElapsed = t;
    a.startedAt = performance.now();
  }
  a.onProgress(f, revealFor(f, a.total));
  startLoop(a);
}

/** A urgencia sempre ganha: pausa a narracao, toca o aviso e retoma. */
export function playUrgency(src: string): void {
  if (A && !A.paused) {
    pause();
    A.duckedByUrgency = true;
  }
  if (urgencyHowl) {
    urgencyHowl.off();
    urgencyHowl.stop();
    urgencyHowl.unload();
    urgencyHowl = null;
  }
  const done = () => {
    if (urgencyHowl) {
      urgencyHowl.off();
      urgencyHowl.unload();
      urgencyHowl = null;
    }
    if (A && A.duckedByUrgency) {
      A.duckedByUrgency = false;
      resume();
    }
  };
  const u = new Howl({ src: [src], html5: true });
  urgencyHowl = u;
  u.once("end", done);
  u.once("loaderror", done);
  u.once("playerror", done);
  u.play();
}
