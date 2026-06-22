import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Confirmacao explicita para acoes destrutivas (PRD 2.2 / Design System 15.6).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[var(--radius-lg)] border border-red/40 bg-bg-surface p-5"
          >
            <div className="mb-2 flex items-center gap-2 text-red">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-sans text-lg font-bold">{title}</h3>
            </div>
            <p className="mb-5 font-sans text-[15px] leading-relaxed text-text-secondary">
              {message}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
