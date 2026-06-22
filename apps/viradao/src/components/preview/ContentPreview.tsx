import { Footprints, Star, Flag, BookOpen, ArrowLeft } from "lucide-react";
import { ABERTURA, PRINCIPAIS, SECUNDARIAS, FINAIS, DEFAULT_INITIAL_SECONDS } from "@/content/story";
import { formatTime } from "@/lib/helpers";
import { StoryCard } from "@/components/team/StoryCard";

// Tela de conteudo liberado (previa do lider): mostra TODO o conteudo do app
// (abertura + principais + secundarias + os 3 finais), sem palavra-chave e sem
// cronometro rodando. Nao toca o banco nem o game store de equipe: e so leitura.
export function ContentPreview() {
  return (
    <div className="relative min-h-full bg-bg-base">
      {/* 1a dobra (sticky): cronometro ILUSTRATIVO (nao interage) */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-bg-base/95 backdrop-blur">
        <div className="hud-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-md px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="hud-label opacity-60" style={{ fontSize: 10 }}>
                Modo
              </div>
              <div className="font-sans text-sm font-semibold text-text-secondary">
                Conteúdo liberado (prévia)
              </div>
            </div>
            <a
              href="#/painel"
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-hairline px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-text-muted hover:text-text-secondary"
            >
              <ArrowLeft className="h-3 w-3" /> Painel
            </a>
          </div>

          <div className="flex flex-col items-center pt-2">
            <div className="hud-label mb-1">Tempo</div>
            <div
              className="tabular font-mono text-6xl font-bold leading-none opacity-50"
              style={{ color: "var(--color-system)" }}
            >
              {formatTime(DEFAULT_INITIAL_SECONDS)}
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-text-muted">
              cronômetro ilustrativo · não corre nesta tela
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <p className="mb-6 font-sans text-[13px] leading-relaxed text-text-muted">
          Esta tela reúne todo o conteúdo do app já destravado, para o líder revisar antes da
          noite. Toque em qualquer card para ler e ouvir a narração. Nada aqui afeta as equipes.
        </p>

        {/* Historia principal */}
        <SectionTitle icon={<Footprints className="h-4 w-4" />} color="var(--color-system)">
          Abertura e história principal
        </SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          <StoryCard card={ABERTURA} />
          {PRINCIPAIS.map((card) => (
            <StoryCard key={card.id} card={card} />
          ))}
        </div>

        {/* Secundarias */}
        <section className="mt-8">
          <SectionTitle icon={<Star className="h-4 w-4" />} color="var(--color-amber)">
            Missões secundárias
          </SectionTitle>
          <div className="mt-3 flex flex-col gap-3">
            {SECUNDARIAS.map((card) => (
              <StoryCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* Finais */}
        <section className="mt-8">
          <SectionTitle icon={<Flag className="h-4 w-4" />} color="var(--color-text-secondary)">
            Os três finais
          </SectionTitle>
          <p className="mb-3 mt-1 font-sans text-[12px] text-text-muted">
            Mutuamente exclusivos: só um acontece por run. O de fracasso dispara sozinho ao zerar;
            os dois de sucesso vêm por palavra-chave própria.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {FINAIS.map((card) => (
              <StoryCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <div className="mt-10 flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <BookOpen className="h-3.5 w-3.5" /> fim do conteúdo
        </div>
      </main>
    </div>
  );
}

function SectionTitle({
  icon,
  color,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color }}>{icon}</span>
      <span className="hud-label" style={{ color }}>
        {children}
      </span>
    </div>
  );
}
