import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore } from "@/store/useGameStore";

function label(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `+${m} min` : `+${m}:${s.toString().padStart(2, "0")}`;
}

// Balao "+min" que sobe junto ao cronometro quando um codigo soma tempo (Design System 9.1).
export function PlusMinBalloon() {
  const feedback = useGameStore((s) => s.feedback);
  const [active, setActive] = useState<{ ts: number; amount: number } | null>(null);

  useEffect(() => {
    if (!feedback || feedback.amount <= 0) return;
    setActive(feedback);
    const t = setTimeout(() => setActive(null), 1600);
    return () => clearTimeout(t);
  }, [feedback?.ts]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.ts}
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: -28, opacity: 1, scale: 1 }}
            exit={{ y: -52, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-full border border-success/50 bg-success/15 px-3 py-1 font-mono text-sm font-bold text-success"
          >
            {label(active.amount)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
