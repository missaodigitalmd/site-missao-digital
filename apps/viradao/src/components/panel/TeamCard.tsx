import { useState, type ReactNode } from "react";
import { Play, Pause, RotateCcw, Target } from "lucide-react";
import { usePanelStore, type PanelTeam, type TeamStatus } from "@/store/usePanelStore";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatTime, urgencyColor, urgencyFromSeconds } from "@/lib/helpers";
import { cn } from "@/lib/cn";

const STATUS_META: Record<TeamStatus, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "var(--color-text-secondary)" },
  rodando: { label: "Rodando", color: "var(--color-system)" },
  pausada: { label: "Pausada", color: "var(--color-amber)" },
  cumpriu: { label: "Cumpriu", color: "var(--color-success)" },
  falhou: { label: "Falhou", color: "var(--color-red)" },
  encerrada: { label: "Encerrada", color: "var(--color-text-muted)" },
};

export function TeamCard({ team }: { team: PanelTeam }) {
  const { startTeam, pauseTeam, addTime, resetTeam } = usePanelStore();
  const [confirm, setConfirm] = useState(false);

  const meta = STATUS_META[team.status];
  const isLive = team.status === "rodando";
  const urgency = isLive ? urgencyFromSeconds(team.remaining) : "frozen";
  const timeColor =
    team.status === "falhou"
      ? "var(--color-red)"
      : team.status === "cumpriu"
        ? "var(--color-success)"
        : urgencyColor(urgency);
  const nearZero = isLive && team.remaining <= 60;

  return (
    <div
      className={cn(
        "flex flex-col rounded-[var(--radius-md)] border bg-bg-surface p-4",
        team.status === "falhou"
          ? "border-red/50"
          : team.status === "cumpriu"
            ? "border-success/50"
            : nearZero
              ? "border-red/40 animate-pulse-soft"
              : "border-hairline",
      )}
    >
      {/* Cabecalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-sans text-[15px] font-semibold text-text-primary">
            {team.name}
          </div>
          <span
            className="mt-0.5 inline-block font-mono text-[11px] uppercase tracking-wide"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {/* Cronometro */}
      <div className="tabular my-3 font-mono text-5xl font-bold leading-none" style={{ color: timeColor }}>
        {formatTime(team.remaining)}
      </div>

      {/* Missao vigente */}
      <div className="mb-3 flex items-start gap-1.5 text-text-secondary">
        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-system" />
        <span className="font-sans text-[13px] leading-snug">{team.mission || "—"}</span>
      </div>

      {/* Progresso */}
      <div className="mb-3 rounded-[var(--radius-sm)] border border-hairline bg-bg-base p-2.5">
        <div className="mb-1.5 flex justify-between font-mono text-[11px] text-text-secondary">
          <span>principais {team.mainCount}/4</span>
          <span>secundárias {team.secCount}</span>
        </div>
        <div className="max-h-24 space-y-1 overflow-y-auto">
          {team.unlocks.length === 0 && (
            <div className="font-sans text-[12px] text-text-muted">Nada destravado ainda.</div>
          )}
          {team.unlocks.map((u, i) => (
            <div key={i} className="flex items-center justify-between font-mono text-[11px]">
              <span className="truncate text-text-primary">{u.title}</span>
              <span className="shrink-0 pl-2 text-text-muted">
                {u.time} {u.bonus !== "—" && <span className="text-success">{u.bonus}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="mt-auto grid grid-cols-2 gap-1.5">
        {team.status === "aguardando" ? (
          <Button variant="system" className="col-span-2" onClick={() => startTeam(team.id)}>
            <Play className="h-4 w-4" /> Start
          </Button>
        ) : (
          <Button variant="neutral" className="col-span-2" onClick={() => pauseTeam(team.id)}>
            <Pause className="h-4 w-4" /> {team.status === "pausada" ? "Despausar" : "Pausar"}
          </Button>
        )}
        {team.status !== "aguardando" && (
          <div className="col-span-2 grid grid-cols-4 gap-1">
            <MiniBtn onClick={() => addTime(team.id, -60)}>-1</MiniBtn>
            <MiniBtn onClick={() => addTime(team.id, -300)}>-5</MiniBtn>
            <MiniBtn onClick={() => addTime(team.id, 60)}>+1</MiniBtn>
            <MiniBtn onClick={() => addTime(team.id, 300)}>+5</MiniBtn>
          </div>
        )}
        <Button variant="ghost" className="col-span-2" onClick={() => setConfirm(true)}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <ConfirmDialog
        open={confirm}
        title={`Resetar ${team.name}?`}
        message="Recomeça do zero: apaga os destravamentos e volta ao tempo inicial (aguardando Start)."
        confirmLabel="Resetar"
        onConfirm={() => {
          resetTeam(team.id);
          setConfirm(false);
        }}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

function MiniBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-full min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-hairline bg-bg-surface-2 font-mono text-xs text-text-primary hover:border-system/40"
    >
      {children}
    </button>
  );
}
