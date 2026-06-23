import { AnimatePresence, motion } from "motion/react";
import { Trophy } from "lucide-react";
import { useFeedStore } from "@/store/useFeedStore";

// Avisos passageiros das conclusoes das OUTRAS equipes (Fase 6, Ponto 9). Sobem,
// ficam alguns segundos e somem sozinhos. Clima de gincana, sem bloquear a leitura.
// O liga/desliga e o filtro do proprio time ja vivem no useFeedStore / sync.
export function CrossFeed() {
  const messages = useFeedStore((s) => s.messages);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-40 flex flex-col items-center gap-2 px-4">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="flex w-full max-w-md items-center gap-2 rounded-[var(--radius-md)] border border-system/40 bg-bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur"
          >
            <Trophy className="h-4 w-4 shrink-0 text-system" />
            <span className="font-sans text-[13px] leading-snug text-text-primary">{m.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
