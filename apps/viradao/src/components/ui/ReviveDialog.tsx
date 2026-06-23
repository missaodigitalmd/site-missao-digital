import { AnimatePresence, motion } from "motion/react";
import { HeartPulse } from "lucide-react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  teamName: string;
  onRevive: (seconds: number) => void;
  onCancel: () => void;
}

// Presets de tempo extra ao reviver um time encerrado (Fase 6, Ponto 6).
const PRESETS_MIN = [3, 5, 10];

// Acao de RECUPERACAO (verde), oposta ao Reset (vermelho/destrutivo): traz de volta
// um time que zerou, dando mais tempo e mantendo todo o progresso ja conquistado.
export function ReviveDialog({ open, teamName, onRevive, onCancel }: Props) {
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
            className="w-full max-w-sm rounded-[var(--radius-lg)] border border-success/40 bg-bg-surface p-5"
          >
            <div className="mb-2 flex items-center gap-2 text-success">
              <HeartPulse className="h-5 w-5" />
              <h3 className="font-sans text-lg font-bold">Reviver {teamName}?</h3>
            </div>
            <p className="mb-5 font-sans text-[15px] leading-relaxed text-text-secondary">
              Recoloca a equipe no jogo com o tempo extra escolhido, mantendo todas as
              missões já destravadas. Escolha quantos minutos conceder:
            </p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {PRESETS_MIN.map((min) => (
                <Button key={min} variant="success" onClick={() => onRevive(min * 60)}>
                  {min} min
                </Button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
