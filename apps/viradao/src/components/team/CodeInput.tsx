import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { normalizeCode } from "@/lib/helpers";
import { cn } from "@/lib/cn";
import { Send, Lock } from "lucide-react";

type Notice = { kind: "ok" | "already" | "unknown"; text: string } | null;

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
    } else if (res.kind === "already") {
      setNotice({ kind: "already", text: "Você já desbloqueou isto." });
      setValue("");
    } else {
      setNotice({ kind: "ok", text: "Código aceito." });
      setValue("");
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
      {notice && (
        <div
          className={cn(
            "mt-2 font-sans text-[13px]",
            notice.kind === "ok" && "text-success",
            notice.kind === "already" && "text-notice",
            notice.kind === "unknown" && "text-notice",
          )}
        >
          {notice.text}
        </div>
      )}
    </div>
  );
}
