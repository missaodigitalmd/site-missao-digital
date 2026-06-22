import { PRESET_TEAMS } from "@/content/story";
import { Terminal, Users, MonitorCog, BookOpen } from "lucide-react";

// Tela de navegacao so para o teste interno da Fase 1 (nao existe no produto final:
// no jogo, cada equipe abre o link oculto dela e o lider abre o painel oculto).
export function DevHome() {
  return (
    <div className="relative min-h-full overflow-hidden bg-bg-base px-5 py-10">
      <div className="hud-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Terminal className="h-6 w-6 text-system" />
          <div>
            <div className="hud-label">Terminal de Missão</div>
            <h1 className="font-sans text-2xl font-bold">App da Missão</h1>
          </div>
        </div>

        <p className="mb-8 font-sans text-[15px] leading-relaxed text-text-secondary">
          Fase 1, layouts mock. Esta é uma tela de navegação só para o teste interno: no
          jogo real cada equipe abre o próprio link e o líder abre o painel oculto. Nada está
          conectado a banco ainda.
        </p>

        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-system" />
          <span className="hud-label">Tela da Equipe</span>
        </div>
        <div className="mb-8 grid gap-2">
          {PRESET_TEAMS.map((name, i) => (
            <a
              key={name}
              href={`#/equipe/team-${i + 1}`}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-hairline bg-bg-surface px-4 py-3 font-sans text-text-primary transition-colors hover:border-system/40"
            >
              <span>{name}</span>
              <span className="font-mono text-xs text-text-muted">team-{i + 1}</span>
            </a>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-2">
          <MonitorCog className="h-4 w-4 text-system" />
          <span className="hud-label">Painel de Gerenciamento</span>
        </div>
        <a
          href="#/painel"
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-system/40 bg-system/10 px-4 py-3 font-sans text-system transition-colors hover:bg-system/20"
        >
          <span>Abrir o painel do líder</span>
          <span className="font-mono text-xs opacity-70">link oculto</span>
        </a>

        <div className="mb-3 mt-8 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-system" />
          <span className="hud-label">Conteúdo liberado (prévia)</span>
        </div>
        <a
          href="#/conteudo"
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-hairline bg-bg-surface px-4 py-3 font-sans text-text-primary transition-colors hover:border-system/40"
        >
          <span>Ver toda a história, secundárias e finais</span>
          <span className="font-mono text-xs text-text-muted">cronômetro estático</span>
        </a>
      </div>
    </div>
  );
}
