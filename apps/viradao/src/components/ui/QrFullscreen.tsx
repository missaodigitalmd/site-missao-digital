import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, Copy, Check } from "lucide-react";
import { QrMock } from "./QrMock";
import { teamUrl, copyText } from "@/lib/helpers";

interface Props {
  open: boolean;
  token: string;
  teamName: string;
  onClose: () => void;
}

// QR ampliado para distribuicao (Ponto 1): grande, legivel a mais de 1 metro, com o
// nome do time em destaque e o link completo copiavel. A galera escaneia de uma vez.
export function QrFullscreen({ open, token, teamName, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const url = teamUrl(token);

  async function copy() {
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-system/40 bg-bg-surface p-6 text-center"
          >
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="hud-label mb-4 text-system">Escaneie para entrar</div>

            <div className="mx-auto mb-4 w-fit rounded-[var(--radius-md)] bg-white p-3">
              <QrMock token={token} size={280} />
            </div>

            <h3 className="mb-1 font-sans text-xl font-bold text-text-primary">{teamName}</h3>

            <button
              onClick={copy}
              title="Clique para copiar o link"
              className="mx-auto mt-3 flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-hairline bg-bg-base px-3 py-2 font-mono text-[12px] text-text-secondary transition-colors hover:border-system/40 hover:text-text-primary"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="break-all text-left">{copied ? "Link copiado!" : url}</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
