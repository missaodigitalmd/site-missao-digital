import { Play } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { formatTime } from "@/lib/helpers";
import * as narration from "@/lib/narration";

export function StartScreen({ teamName }: { teamName: string }) {
  const initialSeconds = useGameStore((s) => s.initialSeconds);
  const start = useGameStore((s) => s.start);

  // O toque no Start libera o audio do navegador (mesmo gesto que inicia o jogo).
  function handleStart() {
    narration.unlock();
    start();
  }

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 text-center">
      <div className="hud-grid pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col items-center">
        <div className="hud-label mb-2">Equipe</div>
        <h1 className="mb-10 font-sans text-3xl font-bold leading-tight text-text-primary">
          {teamName}
        </h1>

        <div className="hud-label mb-1 opacity-60">Tempo</div>
        <div className="tabular mb-12 font-mono text-6xl font-bold leading-none text-text-secondary opacity-50">
          {formatTime(initialSeconds)}
        </div>

        <button
          onClick={handleStart}
          className="flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-full border-2 border-system bg-system/15 text-system transition-transform active:scale-95"
        >
          <Play className="h-12 w-12" />
          <span className="font-mono text-sm font-bold uppercase tracking-widest">Start</span>
        </button>
        <p className="mt-8 max-w-xs font-sans text-[15px] leading-relaxed text-text-secondary">
          Toque para iniciar a missão. O relógio começa a correr e a primeira pista aparece.
        </p>
      </div>
    </div>
  );
}
