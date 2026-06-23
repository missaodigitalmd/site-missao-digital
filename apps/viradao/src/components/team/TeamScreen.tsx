import { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { CARD_BY_ID, PRESET_TEAMS } from "@/content/story";
import { urgencyFromSeconds } from "@/lib/helpers";
import { attach } from "@/lib/sync";
import { useWakeLock } from "@/lib/useWakeLock";
import { Timer } from "./Timer";
import { CodeInput } from "./CodeInput";
import { CurrentMission } from "./CurrentMission";
import { StoryCard } from "./StoryCard";
import { GameSummary } from "./GameSummary";
import { SecondaryMissions } from "./SecondaryMissions";
import { StartScreen } from "./StartScreen";
import { UrgencyBanner } from "./UrgencyBanner";
import { PlusMinBalloon } from "./PlusMinBalloon";
import { CrossFeed } from "./CrossFeed";

function teamNameFromToken(token: string): string {
  const m = /team-(\d+)/.exec(token);
  if (m) return PRESET_TEAMS[parseInt(m[1], 10) - 1] ?? "Equipe Demo";
  return "Equipe Demo";
}

export function TeamScreen({ token }: { token: string }) {
  const teamName = teamNameFromToken(token);
  const phase = useGameStore((s) => s.phase);
  const remaining = useGameStore((s) => s.remaining);
  const mainUnlocked = useGameStore((s) => s.mainUnlocked);
  const tick = useGameStore((s) => s.tick);
  const reset = useGameStore((s) => s.reset);
  const setToken = useGameStore((s) => s.setToken);

  // Persistencia (Fase 3): define a equipe e liga resume + realtime + espelho.
  // setToken zera o estado; attach reidrata pelo espelho/banco logo em seguida.
  useEffect(() => {
    setToken(token);
    const detach = attach(token);
    return detach;
  }, [token, setToken]);

  // Cronometro: recalcula a partir do horario-alvo (PRD secao 3).
  useEffect(() => {
    const id = setInterval(() => tick(), 250);
    return () => clearInterval(id);
  }, [tick]);

  // C4: mantem a tela acesa enquanto o jogo corre (running/paused).
  useWakeLock(phase === "running" || phase === "paused");

  // Vibracao nos ultimos 30s (se o aparelho permitir).
  const buzzed = useRef(false);
  const urgency = urgencyFromSeconds(remaining);
  useEffect(() => {
    if (phase === "running" && urgency === "max" && !buzzed.current) {
      buzzed.current = true;
      navigator.vibrate?.([120, 80, 120]);
    }
    if (urgency !== "max") buzzed.current = false;
  }, [phase, urgency]);

  if (phase === "await") {
    return (
      <div className="min-h-full bg-bg-base">
        <StartScreen teamName={teamName} />
      </div>
    );
  }

  const showRedPulse = phase === "running" && urgency === "max";

  return (
    <div className="relative min-h-full bg-bg-base">
      {/* Pulso vermelho de tela cheia nos ultimos 30s */}
      {showRedPulse && (
        <div className="animate-pulse-hard pointer-events-none fixed inset-0 z-30" />
      )}

      <UrgencyBanner />

      {/* Ponto 9: log de conclusoes das outras equipes (toasts passageiros). */}
      <CrossFeed />

      {/* 1a dobra (sticky): cronometro + input */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-bg-base/95 backdrop-blur">
        <div className="hud-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-md px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="hud-label opacity-60" style={{ fontSize: 10 }}>
                Equipe
              </div>
              <div className="font-sans text-sm font-semibold text-text-secondary">{teamName}</div>
            </div>
            {(phase === "failed" || phase === "success") && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-hairline px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-text-muted hover:text-text-secondary"
                title="Recomeçar (apaga o progresso) - simula o reset do líder"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          <div className="relative mb-4 pt-6">
            <PlusMinBalloon />
            <Timer />
          </div>

          <CodeInput />

          {/* Ponto 10: missao vigente no fim da 1a dobra (relogio + codigo + missao
              no mesmo bloco visivel). Versao compacta; o texto completo fica no card. */}
          <div className="mt-3">
            <CurrentMission compact />
          </div>
        </div>
      </header>

      {/* 2a dobra: diario + secundarias */}
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <div className="flex flex-col gap-3">
          {mainUnlocked.map((id) => (
            <StoryCard key={id} card={CARD_BY_ID[id]} />
          ))}
        </div>

        {/* Ponto 11: resumo da partida, logo apos o card de fechamento. */}
        <GameSummary />

        <SecondaryMissions />
      </main>
    </div>
  );
}
