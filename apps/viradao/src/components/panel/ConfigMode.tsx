import { Power, Link2, BookOpen } from "lucide-react";
import { usePanelStore } from "@/store/usePanelStore";
import { Button } from "@/components/ui/Button";
import { TimeField } from "@/components/ui/TimeField";
import { QrMock } from "@/components/ui/QrMock";
import { cn } from "@/lib/cn";

export function ConfigMode() {
  const {
    eventName,
    setEventName,
    globalInitialSeconds,
    setGlobalInitial,
    teams,
    toggleActive,
    activateSystem,
  } = usePanelStore();

  const activeCount = teams.filter((t) => t.active).length;

  return (
    <div className="relative min-h-full bg-bg-base">
      <div className="hud-grid pointer-events-none fixed inset-0" />
      <div className="relative mx-auto max-w-5xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="hud-label">Modo Configuração</span>
          <a
            href="#/conteudo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-text-secondary transition-colors hover:border-system/40 hover:text-text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" /> Ver conteúdo
          </a>
        </div>
        <h1 className="mb-8 font-sans text-2xl font-bold">Ativar o sistema</h1>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Evento + tempo global */}
          <div className="rounded-[var(--radius-md)] border border-hairline bg-bg-surface p-5">
            <label className="hud-label mb-2 block">Evento</label>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mb-6 w-full rounded-[var(--radius-sm)] border border-hairline bg-bg-base px-3 py-2.5 font-sans text-text-primary outline-none focus:border-system"
            />
            <label className="hud-label mb-3 block">Tempo inicial global</label>
            <TimeField seconds={globalInitialSeconds} onChange={setGlobalInitial} />
            <p className="mt-3 font-sans text-[13px] text-text-muted">
              Aplicado a todas as equipes antes do Start. Só pode ser ajustado enquanto ninguém
              startou.
            </p>
          </div>

          {/* Resumo */}
          <div className="rounded-[var(--radius-md)] border border-hairline bg-bg-surface p-5">
            <label className="hud-label mb-3 block">Equipes na sessão</label>
            <div className="mb-4 font-mono text-5xl font-bold text-system">
              {activeCount}
              <span className="text-2xl text-text-muted">/5</span>
            </div>
            <p className="font-sans text-[14px] leading-relaxed text-text-secondary">
              Ative de 3 a 5 equipes. Cada equipe ativa entra com o próprio link e QR Code,
              re-compartilhável se um aparelho falhar.
            </p>
            <Button
              variant="system"
              className="mt-5 w-full"
              onClick={activateSystem}
              disabled={activeCount < 1}
            >
              <Power className="h-4 w-4" /> Ativar sistema
            </Button>
          </div>
        </div>

        {/* Equipes pre-configuradas */}
        <label className="hud-label mb-3 block">Equipes pré-configuradas</label>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div
              key={t.id}
              className={cn(
                "rounded-[var(--radius-md)] border bg-bg-surface p-4 transition-colors",
                t.active ? "border-system/40" : "border-hairline opacity-70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-sans text-[15px] font-semibold text-text-primary">
                    {t.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
                    <Link2 className="h-3 w-3" />
                    /equipe/{t.token.slice(0, 10)}…
                  </div>
                </div>
                <QrMock token={t.token} size={64} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(t.id)}
                  className={cn(
                    "rounded-[var(--radius-sm)] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide",
                    t.active
                      ? "border-system/50 bg-system/15 text-system"
                      : "border-hairline text-text-muted",
                  )}
                >
                  {t.active ? "Ativa" : "Inativa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
