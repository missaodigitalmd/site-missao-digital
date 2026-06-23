import { Minus, Plus, Timer, Lock } from "lucide-react";
import { PRINCIPAIS, SECUNDARIAS, type StoryCard } from "@/content/story";
import { usePanelStore } from "@/store/usePanelStore";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/cn";

// Aba de tempos por estacao (Fase 6, Ponto 8). Edita o bonus de cada missao SO antes
// da partida (nenhuma equipe startou); vale para a proxima partida. Salva direto na
// tabela viradao.stations; a equipe le esses tempos no inicio do jogo.
const STEP = 30; // segundos por clique

export function StationTimes() {
  const stations = usePanelStore((s) => s.stations);
  const setStationBonus = usePanelStore((s) => s.setStationBonus);
  const teams = usePanelStore((s) => s.teams);
  const locked = teams.some((t) => t.status !== "aguardando");

  const bonusOf = (c: StoryCard) => stations[c.id] ?? c.bonusSeconds;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <label className="hud-label flex items-center gap-2">
          <Timer className="h-3.5 w-3.5" /> Tempos por estação
        </label>
        {locked && (
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-amber">
            <Lock className="h-3 w-3" /> Partida em andamento, travado
          </span>
        )}
      </div>
      <p className="mb-4 font-sans text-[13px] text-text-muted">
        Bônus de tempo que cada missão concede ao ser destravada. Ajuste antes do Start;
        vale para a próxima partida. {locked && "Reinicie as equipes para editar."}
      </p>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-2">
          <div className="hud-label" style={{ color: "var(--color-system)" }}>
            Principais
          </div>
          {PRINCIPAIS.map((c, i) => (
            <Stepper
              key={c.id}
              label={`${i + 1}. ${c.title}`}
              seconds={bonusOf(c)}
              disabled={locked}
              onChange={(s) => setStationBonus(c.id, s)}
            />
          ))}
        </div>
        <div className="space-y-2">
          <div className="hud-label" style={{ color: "var(--color-amber)" }}>
            Secundárias
          </div>
          {SECUNDARIAS.map((c) => (
            <Stepper
              key={c.id}
              label={c.title}
              seconds={bonusOf(c)}
              disabled={locked}
              onChange={(s) => setStationBonus(c.id, s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stepper({
  label,
  seconds,
  disabled,
  onChange,
}: {
  label: string;
  seconds: number;
  disabled?: boolean;
  onChange: (s: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-hairline bg-bg-surface px-3 py-2",
        disabled && "opacity-60",
      )}
    >
      <span className="min-w-0 truncate font-sans text-[14px] text-text-primary">{label}</span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          disabled={disabled}
          onClick={() => onChange(Math.max(0, seconds - STEP))}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-primary hover:border-system/40 disabled:cursor-not-allowed"
          aria-label="Diminuir"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="tabular min-w-[58px] text-center font-mono text-lg font-bold text-success">
          {formatTime(seconds)}
        </span>
        <button
          disabled={disabled}
          onClick={() => onChange(seconds + STEP)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-hairline text-text-primary hover:border-system/40 disabled:cursor-not-allowed"
          aria-label="Aumentar"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
