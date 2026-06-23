import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, Flag, Check, Copy, Archive, Trash2 } from "lucide-react";
import { usePanelStore, type PanelTeam } from "@/store/usePanelStore";
import { Button } from "@/components/ui/Button";
import { formatTime, copyText } from "@/lib/helpers";

// C5: Encerrar evento. Mostra o resultado da noite, ARQUIVA um snapshot (para nao
// perder a memoria) e so entao oferece zerar tudo para a proxima. Distingue arquivar
// (guardar) de zerar (apagar): nunca perde o registro por engano.

function outcome(t: PanelTeam): string {
  switch (t.status) {
    case "cumpriu":
      return t.successKind === "v2"
        ? `cumpriu pleno (V2), ${formatTime(t.remaining)} sobrando`
        : t.successKind === "v1"
          ? `cumpriu superficial (V1), ${formatTime(t.remaining)} sobrando`
          : `cumpriu, ${formatTime(t.remaining)} sobrando`;
    case "falhou":
      return "não chegou a tempo";
    case "rodando":
      return `ainda jogando (${formatTime(t.remaining)})`;
    case "pausada":
      return `pausada (${formatTime(t.remaining)})`;
    default:
      return "não iniciou";
  }
}

function summaryText(eventName: string, teams: PanelTeam[]): string {
  const lines = teams.map(
    (t) => `- ${t.name}: ${outcome(t)} | ${t.mainCount}/4 etapas, ${t.secCount} secundárias`,
  );
  return `${eventName} — resultado (${new Date().toLocaleString("pt-BR")})\n${lines.join("\n")}`;
}

export function EndEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { eventName, teams, archiveEvent, resetAll } = usePanelStore();
  const [archived, setArchived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  async function doArchive() {
    setBusy(true);
    const ok = await archiveEvent();
    setBusy(false);
    setArchived(ok);
  }

  async function copy() {
    if (await copyText(summaryText(eventName, teams))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  function close() {
    setArchived(false);
    setConfirmReset(false);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-system/40 bg-bg-surface p-5"
          >
            <button
              onClick={close}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-1 flex items-center gap-2 text-system">
              <Flag className="h-5 w-5" />
              <h3 className="font-sans text-lg font-bold">Encerrar evento</h3>
            </div>
            <p className="mb-4 font-sans text-[13px] leading-relaxed text-text-muted">
              Resultado da noite. Arquive para guardar o registro antes de zerar tudo.
            </p>

            <div className="mb-4 space-y-1.5">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-hairline bg-bg-base px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate font-sans text-[14px] text-text-primary">{t.name}</div>
                    <div className="font-mono text-[11px] text-text-muted">
                      {t.mainCount}/4 etapas · {t.secCount} secundárias
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-right font-mono text-[12px]"
                    style={{
                      color:
                        t.status === "cumpriu"
                          ? "var(--color-success)"
                          : t.status === "falhou"
                            ? "var(--color-red)"
                            : "var(--color-text-secondary)",
                    }}
                  >
                    {outcome(t)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar resumo"}
              </Button>
              {!archived ? (
                <Button variant="system" onClick={doArchive} disabled={busy}>
                  <Archive className="h-4 w-4" /> {busy ? "Arquivando…" : "Arquivar resultado"}
                </Button>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-semibold text-success">
                    <Check className="h-4 w-4" /> Arquivado
                  </span>
                  <Button variant="danger" onClick={() => setConfirmReset(true)}>
                    <Trash2 className="h-4 w-4" /> Zerar para a próxima
                  </Button>
                </>
              )}
            </div>

            {confirmReset && (
              <div className="mt-4 rounded-[var(--radius-sm)] border border-red/40 bg-red/10 p-3">
                <p className="mb-3 font-sans text-[13px] text-text-secondary">
                  O resultado já está arquivado. Zerar apaga o progresso de todas as equipes e
                  volta ao tempo inicial. Confirmar?
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      resetAll();
                      close();
                    }}
                  >
                    Zerar tudo
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
