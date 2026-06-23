import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, Target, Check } from "lucide-react";
import { PRINCIPAIS, SECUNDARIAS, type StoryCard } from "@/content/story";
import { usePanelStore, type PanelTeam } from "@/store/usePanelStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/cn";

// "Botao de Deus" do lider (Fase 6, Ponto 4): marcar/desmarcar missoes de uma equipe.
// Marcar credita o bonus de tempo NORMAL (igual ao codigo); desmarcar remove o unlock
// e o tempo. Desmarcar pede confirmacao porque ENCURTA o relogio da equipe na hora.
export function MissionsDialog({
  open,
  team,
  onClose,
}: {
  open: boolean;
  team: PanelTeam;
  onClose: () => void;
}) {
  const togglePanelUnlock = usePanelStore((s) => s.togglePanelUnlock);
  const stations = usePanelStore((s) => s.stations);
  const [pendingOff, setPendingOff] = useState<StoryCard | null>(null);

  // Bonus efetivo = tempo configurado no painel (Ponto 8), com fallback no story.ts.
  const bonusOf = (card: StoryCard) => stations[card.id] ?? card.bonusSeconds;

  function handleToggle(card: StoryCard, isOn: boolean) {
    const kind = card.tag === "secundaria" ? "secundaria" : "principal";
    const bonusSeconds = bonusOf(card);
    if (isOn) {
      // Desmarcar tira tempo: confirma antes (prevencao de erro).
      if (bonusSeconds > 0) {
        setPendingOff(card);
        return;
      }
      togglePanelUnlock(team.id, { id: card.id, bonusSeconds, kind }, false);
    } else {
      togglePanelUnlock(team.id, { id: card.id, bonusSeconds, kind }, true);
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-system/40 bg-bg-surface p-5"
          >
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-1 flex items-center gap-2 text-system">
              <Target className="h-5 w-5" />
              <h3 className="font-sans text-lg font-bold">Missões de {team.name}</h3>
            </div>
            <p className="mb-4 font-sans text-[13px] leading-relaxed text-text-muted">
              Marcar credita o tempo normal da missão; desmarcar remove a missão e o tempo.
              A equipe reflete na hora.
            </p>

            <Group title="Principais (etapas)" color="var(--color-system)">
              {PRINCIPAIS.map((c, i) => (
                <Row
                  key={c.id}
                  card={c}
                  index={i + 1}
                  bonus={bonusOf(c)}
                  on={team.unlockedIds.includes(c.id)}
                  onToggle={handleToggle}
                />
              ))}
            </Group>

            <Group title="Secundárias" color="var(--color-amber)">
              {SECUNDARIAS.map((c) => (
                <Row
                  key={c.id}
                  card={c}
                  bonus={bonusOf(c)}
                  on={team.unlockedIds.includes(c.id)}
                  onToggle={handleToggle}
                />
              ))}
            </Group>
          </motion.div>
        </motion.div>

          <ConfirmDialog
            open={!!pendingOff && open}
            title="Desmarcar missão?"
            message={
              pendingOff
                ? `Isto remove "${pendingOff.title}" e tira ${formatTime(
                    bonusOf(pendingOff),
                  )} do relógio de ${team.name} agora.`
                : ""
            }
            confirmLabel="Desmarcar"
            onConfirm={() => {
              if (pendingOff) {
                const kind = pendingOff.tag === "secundaria" ? "secundaria" : "principal";
                togglePanelUnlock(
                  team.id,
                  { id: pendingOff.id, bonusSeconds: bonusOf(pendingOff), kind },
                  false,
                );
              }
              setPendingOff(null);
            }}
            onCancel={() => setPendingOff(null)}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Group({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 hud-label" style={{ color }}>
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  card,
  index,
  bonus,
  on,
  onToggle,
}: {
  card: StoryCard;
  index?: number;
  bonus: number;
  on: boolean;
  onToggle: (card: StoryCard, isOn: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(card, on)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-3 py-2 text-left transition-colors",
        on
          ? "border-success/40 bg-success/10 hover:bg-success/15"
          : "border-hairline bg-bg-base hover:border-system/40",
      )}
    >
      <div className="min-w-0">
        <div className="truncate font-sans text-[14px] text-text-primary">
          {index ? `${index}. ` : ""}
          {card.title}
        </div>
        {bonus > 0 && (
          <div className="font-mono text-[11px] text-success">+{formatTime(bonus)}</div>
        )}
      </div>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border",
          on ? "border-success bg-success/20 text-success" : "border-hairline text-text-muted",
        )}
      >
        {on && <Check className="h-4 w-4" />}
      </span>
    </button>
  );
}
