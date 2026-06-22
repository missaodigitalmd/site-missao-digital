import { AnimatePresence, motion } from "motion/react";
import { Target } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";

// Missao vigente: bloco fixo no topo da 2a dobra, acima dos cards (Design System 5).
export function CurrentMission() {
  const mission = useGameStore((s) => s.currentMission);
  if (!mission) return null;

  return (
    <div className="sticky top-2 z-10 rounded-[var(--radius-md)] border border-system/30 bg-bg-surface/95 px-4 py-3 shadow-[0_0_24px_-8px_var(--color-system)] backdrop-blur">
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
          className="font-sans text-[15px] leading-snug text-text-primary"
        >
          {mission}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
