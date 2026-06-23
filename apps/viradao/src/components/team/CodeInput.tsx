import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore } from "@/store/useGameStore";
import { normalizeCode } from "@/lib/helpers";
import { cn } from "@/lib/cn";
import { Send, Lock, CheckCircle2 } from "lucide-react";

type Notice = { kind: "ok" | "already" | "unknown" | "locked"; text: string } | null;

function bonusLabel(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `+${m} min` : `+${m}:${s.toString().padStart(2, "0")}`;
}

export function CodeInput() {
  const phase = useGameStore((s) => s.phase);
  const submitCode = useGameStore((s) => s.submitCode);
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [shake, setShake] = useState(false);

  const locked = phase === "failed" || phase === "success";

  if (locked) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-hairline bg-bg-surface/60 px-4 py-3 font-mono text-[13px] uppercase tracking-wide text-text-muted">
        <Lock className="h-4 w-4" />
        {phase === "failed" ? "O tempo acabou" : "Missão cumprida"}
      </div>
    );
  }

  function submit() {
    const code = normalizeCode(value);
    if (!code) return;
    const res = submitCode(value);
    if (res.kind === "unknown") {
      setNotice({ kind: "unknown", text: "Código não reconhecido, tente de novo." });
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } else if (res.kind === "locked") {
      setNotice({
        kind: "locked",
        text:
          res.card.tag === "final"
            ? "Ainda não é a hora do final. Concluam as 4 etapas principais primeiro."
            : "Esse código ainda não é a hora. Resolvam a etapa anterior primeiro.",
      });
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } else if (res.kind === "already") {
      setNotice({ kind: "already", text: "Você já desbloqueou isto." });
      setValue("");
    } else {
      // C2: confirmacao celebrativa. Mostra o bonus ganho e da um feedback tatil.
      const bonus = res.kind === "unlocked" ? res.bonus : 0;
      setNotice({
        kind: "ok",
        text: bonus > 0 ? `Código aceito! ${bonusLabel(bonus)}` : "Código aceito!",
      });
      setValue("");
      navigator.vibrate?.(60);
    }
  }

  return (
    <div>
      <div className="hud-label mb-1.5">Código</div>
      <div className={cn("flex gap-2", shake && "animate-shake")}>
        <input
          value={value}
          onChange={(e) => {
            setValue(normalizeCode(e.target.value));
            if (notice) setNotice(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Digite o código"
          inputMode="text"
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="min-h-[52px] flex-1 rounded-[var(--radius-sm)] border border-hairline bg-bg-surface px-4 font-mono text-xl font-semibold uppercase tracking-wider text-text-primary outline-none placeholder:text-text-muted placeholder:normal-case placeholder:tracking-normal placeholder:text-base focus:border-system"
        />
        <button
          onClick={submit}
          aria-label="Enviar código"
          className="flex min-h-[52px] min-w-[52px] items-center justify-center rounded-[var(--radius-sm)] border border-system/40 bg-system/15 text-system transition-colors hover:bg-system/25 active:bg-system/30"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <AnimatePresence mode="wait">
        {notice &&
          (notice.kind === "ok" ? (
            // C2: chip celebrativo com pop ao aceitar o codigo.
            <motion.div
              key={notice.text}
              initial={{ opacity: 0, scale: 0.85, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-success/50 bg-success/15 px-3 py-1 font-mono text-[13px] font-bold text-success"
            >
              <CheckCircle2 className="h-4 w-4" />
              {notice.text}
            </motion.div>
          ) : (
            <motion.div
              key={notice.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 font-sans text-[13px] text-notice"
            >
              {notice.text}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
