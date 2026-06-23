import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, KeyRound, Check, Copy } from "lucide-react";
import { PRINCIPAIS, SECUNDARIAS, FINAL_V1, FINAL_V2, type StoryCard } from "@/content/story";
import { formatTime, copyText } from "@/lib/helpers";

// Referencia rapida de codigos para o lider (acesso rapido durante a noite). Lista
// todos os codigos agrupados: principais NA ORDEM, secundarias e os dois finais.
// Cada codigo e clicavel para copiar. So leitura, nao toca o estado das equipes.
export function CodesReference({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(code: string) {
    if (await copyText(code)) {
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1400);
    }
  }

  // Portal para o body: o header do painel usa backdrop-blur (backdrop-filter), que
  // cria containing block para position:fixed e prenderia o overlay dentro da barra.
  return createPortal(
    <AnimatePresence>
      {open && (
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
              <KeyRound className="h-5 w-5" />
              <h3 className="font-sans text-lg font-bold">Códigos do jogo</h3>
            </div>
            <p className="mb-4 font-sans text-[13px] leading-relaxed text-text-muted">
              Acesso rápido para o líder. Toque em um código para copiar. As principais
              seguem a ordem da história; as secundárias são livres.
            </p>

            <Group title="Principais (em ordem)" color="var(--color-system)">
              {PRINCIPAIS.map((c, i) => (
                <Row key={c.id} card={c} index={i + 1} copied={copied} onCopy={copy} />
              ))}
            </Group>

            <Group title="Secundárias (livres)" color="var(--color-amber)">
              {SECUNDARIAS.map((c) => (
                <Row key={c.id} card={c} copied={copied} onCopy={copy} />
              ))}
            </Group>

            <Group title="Finais (exigem as 4 principais)" color="var(--color-success)">
              <Row card={FINAL_V2} label="Final pleno (V2)" copied={copied} onCopy={copy} />
              <Row card={FINAL_V1} label="Final superficial (V1)" copied={copied} onCopy={copy} />
            </Group>
          </motion.div>
        </motion.div>
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
  label,
  copied,
  onCopy,
}: {
  card: StoryCard;
  index?: number;
  label?: string;
  copied: string | null;
  onCopy: (code: string) => void;
}) {
  const code = card.code ?? "";
  const isCopied = copied === code && code !== "";
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-hairline bg-bg-base px-3 py-2">
      <div className="min-w-0">
        <div className="truncate font-sans text-[14px] text-text-primary">
          {index ? `${index}. ` : ""}
          {label ?? card.title}
        </div>
        {card.bonusSeconds > 0 && (
          <div className="font-mono text-[11px] text-success">+{formatTime(card.bonusSeconds)}</div>
        )}
      </div>
      <button
        onClick={() => code && onCopy(code)}
        title="Copiar código"
        className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-system/40 bg-system/10 px-2.5 py-1.5 font-mono text-[13px] font-bold uppercase tracking-wider text-system transition-colors hover:bg-system/20"
      >
        {isCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        {code}
      </button>
    </div>
  );
}
