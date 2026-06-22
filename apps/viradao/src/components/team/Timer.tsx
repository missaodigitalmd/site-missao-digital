import { useGameStore } from "@/store/useGameStore";
import { formatTime, urgencyColor, urgencyFromSeconds, type Urgency } from "@/lib/helpers";
import { cn } from "@/lib/cn";

export function Timer() {
  const phase = useGameStore((s) => s.phase);
  const remaining = useGameStore((s) => s.remaining);
  const finalKind = useGameStore((s) => s.finalKind);

  let urgency: Urgency = urgencyFromSeconds(remaining);
  let selo: string | null = null;

  if (phase === "success") {
    urgency = "frozen";
    selo = "MISSÃO CUMPRIDA";
  } else if (phase === "paused") {
    urgency = "frozen";
    selo = "PAUSADO";
  } else if (phase === "failed" || finalKind === "fracasso") {
    urgency = "zero";
  }

  const color = urgencyColor(urgency);
  const pulse =
    phase === "running" && urgency === "critical"
      ? "animate-pulse-soft"
      : phase === "running" && urgency === "max"
        ? "animate-pulse-soft"
        : "";

  return (
    <div className="flex flex-col items-center">
      <div className="hud-label mb-1">Tempo</div>
      <div
        className={cn(
          "tabular font-mono font-bold leading-none transition-all duration-300",
          urgency === "max" ? "text-7xl" : "text-6xl",
          pulse,
          urgency === "frozen" && "opacity-60",
        )}
        style={{ color }}
      >
        {formatTime(remaining)}
      </div>
      {selo && (
        <div
          className="mt-2 rounded-[var(--radius-sm)] border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest"
          style={{ color, borderColor: color }}
        >
          {selo}
        </div>
      )}
    </div>
  );
}
