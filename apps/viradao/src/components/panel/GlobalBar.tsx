import { useState } from "react";
import { Play, Pause, Trash2, Settings2, BookOpen, KeyRound, Megaphone, MegaphoneOff, Flag } from "lucide-react";
import { usePanelStore } from "@/store/usePanelStore";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CodesReference } from "./CodesReference";
import { EndEventDialog } from "./EndEventDialog";
import { formatTime } from "@/lib/helpers";

export function GlobalBar() {
  const { eventName, globalInitialSeconds, teams, startAll, pauseAll, addTimeAll, resetAll, backToConfig } =
    usePanelStore();
  const presenceCounts = usePanelStore((s) => s.presenceCounts);
  const showCrossFeed = usePanelStore((s) => s.showCrossFeed);
  const setShowCrossFeed = usePanelStore((s) => s.setShowCrossFeed);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [endEvent, setEndEvent] = useState(false);

  const running = teams.filter((t) => t.active && t.status === "rodando").length;
  const paused = teams.filter((t) => t.active && t.status === "pausada").length;
  const waiting = teams.filter((t) => t.active && t.status === "aguardando").length;
  const done = teams.filter((t) => t.active && (t.status === "cumpriu" || t.status === "falhou")).length;
  const anyRunning = running > 0;
  // Total de celulares com o app aberto agora, somando todas as equipes (Pontos 2/3).
  const connected = Object.values(presenceCounts).reduce((a, b) => a + b, 0);

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-bg-base/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <div className="mr-auto">
          <div className="hud-label" style={{ fontSize: 10 }}>
            Evento
          </div>
          <div className="font-sans text-[15px] font-semibold text-text-primary">{eventName}</div>
          <div className="font-mono text-xs text-text-muted">
            inicial {formatTime(globalInitialSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <Pill label="rodando" value={running} color="var(--color-system)" />
          <Pill label="pausadas" value={paused} color="var(--color-amber)" />
          <Pill label="aguardando" value={waiting} color="var(--color-text-secondary)" />
          <Pill label="encerradas" value={done} color="var(--color-success)" />
          <Pill label="celulares" value={connected} color="var(--color-system)" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="system" onClick={startAll}>
            <Play className="h-4 w-4" /> Start geral
          </Button>
          <Button variant="neutral" onClick={() => addTimeAll(-60)}>
            -1
          </Button>
          <Button variant="neutral" onClick={() => addTimeAll(-300)}>
            -5
          </Button>
          <Button variant="neutral" onClick={() => addTimeAll(60)}>
            +1
          </Button>
          <Button variant="neutral" onClick={() => addTimeAll(300)}>
            +5
          </Button>
          <Button variant="neutral" onClick={pauseAll}>
            <Pause className="h-4 w-4" /> {anyRunning ? "Pausar" : "Despausar"}
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            <Trash2 className="h-4 w-4" /> Zerar tudo
          </Button>
          <Button variant="neutral" onClick={() => setEndEvent(true)} title="Encerrar evento e arquivar o resultado">
            <Flag className="h-4 w-4" /> Encerrar
          </Button>
          <Button variant="neutral" onClick={() => setShowCodes(true)} title="Ver todos os códigos">
            <KeyRound className="h-4 w-4" /> Códigos
          </Button>
          <Button
            variant={showCrossFeed ? "system" : "ghost"}
            onClick={() => setShowCrossFeed(!showCrossFeed)}
            title={
              showCrossFeed
                ? "Log de conclusões LIGADO nas telas das equipes (clique para desligar)"
                : "Log de conclusões DESLIGADO (clique para ligar)"
            }
          >
            {showCrossFeed ? <Megaphone className="h-4 w-4" /> : <MegaphoneOff className="h-4 w-4" />}
            Avisos
          </Button>
          <a
            href="#/conteudo"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver todo o conteúdo liberado (prévia)"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-hairline bg-transparent px-4 font-mono text-[13px] font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:border-system/40 hover:text-text-primary"
          >
            <BookOpen className="h-4 w-4" /> Conteúdo
          </a>
          <Button variant="ghost" onClick={backToConfig} title="Voltar à configuração">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Zerar tudo?"
        message="Isto apaga o progresso de todas as equipes e volta ao tempo inicial (aguardando Start). Não dá para desfazer."
        confirmLabel="Zerar tudo"
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />

      <CodesReference open={showCodes} onClose={() => setShowCodes(false)} />
      <EndEventDialog open={endEvent} onClose={() => setEndEvent(false)} />
    </header>
  );
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}
