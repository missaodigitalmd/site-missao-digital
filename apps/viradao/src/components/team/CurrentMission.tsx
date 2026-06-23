import { AnimatePresence, motion } from "motion/react";
import { Target } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { cn } from "@/lib/cn";

// Missao vigente. Por padrao, bloco destacado (Design System 5). No modo `compact`
// (Ponto 10), vai para o fim da 1a dobra, logo abaixo do input: versao enxuta, sem
// sticky, com no maximo 2 linhas (o texto completo continua no card da estacao).
export function CurrentMission({ compact = false }: { compact?: boolean }) {
  const mission = useGameStore((s) => s.currentMission);
  if (!mission) return null;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-system/30 bg-bg-surface/95 backdrop-blur",
        compact
          ? "px-3 py-2"
          : "sticky top-2 z-10 px-4 py-3 shadow-[0_0_24px_-8px_var(--color-system)]",
      )}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Target className="h-3.5 w-3.5 text-system" />
        <span className="hud-label">Missão vigente</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={mission}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "font-sans leading-snug text-text-primary",
            compact ? "line-clamp-2 text-[13px]" : "text-[15px]",
          )}
        >
          {mission}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
