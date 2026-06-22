import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import * as narration from "@/lib/narration";

export function UrgencyBanner() {
  const banner = useGameStore((s) => s.banner);
  const [visibleTs, setVisibleTs] = useState<number | null>(null);

  useEffect(() => {
    if (!banner) return;
    setVisibleTs(banner.ts);
    // A narracao de urgencia toca por cima da narracao do card (ducking).
    if (banner.audio) narration.playUrgency(banner.audio);
    const t = setTimeout(() => setVisibleTs(null), 5000);
    return () => clearTimeout(t);
  }, [banner?.ts]);

  const show = banner && visibleTs === banner.ts;
  const color = banner?.level === "red" ? "var(--color-red)" : "var(--color-amber)";

  return (
    <AnimatePresence>
      {show && banner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setVisibleTs(null)}
          className="fixed inset-x-3 top-3 z-40 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3"
          style={{ borderColor: color, backgroundColor: "var(--color-bg-surface)" }}
        >
          <AlertTriangle className="h-5 w-5 shrink-0" style={{ color }} />
          <span className="font-sans text-[15px] font-medium text-text-primary">{banner.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
