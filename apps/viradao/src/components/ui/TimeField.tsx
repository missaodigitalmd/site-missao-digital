import { Minus, Plus } from "lucide-react";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/cn";

interface Props {
  seconds: number;
  onChange: (s: number) => void;
  disabled?: boolean;
  step?: number; // segundos por clique
}

// Editor de tempo mm:ss com steppers e presets (modo Configuracao do painel).
export function TimeField({ seconds, onChange, disabled, step = 60 }: Props) {
  const set = (s: number) => onChange(Math.max(0, s));
  return (
    <div className={cn("flex items-center gap-3", disabled && "opacity-50")}>
      <button
        disabled={disabled}
        onClick={() => set(seconds - step)}
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-primary hover:border-system/40 disabled:cursor-not-allowed"
        aria-label="Diminuir tempo"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="tabular min-w-[96px] text-center font-mono text-3xl font-bold text-text-primary">
        {formatTime(seconds)}
      </div>
      <button
        disabled={disabled}
        onClick={() => set(seconds + step)}
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-primary hover:border-system/40 disabled:cursor-not-allowed"
        aria-label="Aumentar tempo"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="ml-2 flex gap-1.5">
        {[20, 30, 40].map((m) => (
          <button
            key={m}
            disabled={disabled}
            onClick={() => set(m * 60)}
            className={cn(
              "rounded-[var(--radius-sm)] border px-2.5 py-1 font-mono text-xs",
              seconds === m * 60
                ? "border-system/50 bg-system/15 text-system"
                : "border-hairline text-text-secondary hover:border-system/40",
            )}
          >
            {m}:00
          </button>
        ))}
      </div>
    </div>
  );
}
