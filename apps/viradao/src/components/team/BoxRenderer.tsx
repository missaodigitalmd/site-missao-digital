import { Target, MessageSquare, Smartphone } from "lucide-react";
import type { Box } from "@/content/story";

export function BoxRenderer({ box }: { box: Box }) {
  switch (box.kind) {
    case "narrator":
      return (
        <div className="border-l-2 border-system/50 pl-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-text-secondary">
            <span className="text-sm">🎙️</span>
            <span className="font-mono text-[11px] uppercase tracking-wider">Narrador</span>
          </div>
          <p className="font-sans text-[17px] leading-relaxed text-text-primary/95">{box.text}</p>
        </div>
      );

    case "character":
      return (
        <div className="flex gap-3 rounded-[var(--radius-md)] border border-hairline bg-bg-surface-2 p-3">
          <img
            src={box.portrait}
            alt={box.name}
            className="h-12 w-12 shrink-0 rounded-[var(--radius-sm)] border border-hairline object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3 text-system" />
              <span className="font-sans text-[14px] font-semibold text-system">
                {box.name}
                <span className="font-normal text-text-secondary">, {box.role}</span>
              </span>
            </div>
            <p className="font-sans text-[16px] leading-relaxed text-text-primary">{box.text}</p>
          </div>
        </div>
      );

    case "phone":
      return (
        <div className="rounded-[var(--radius-md)] rounded-bl-sm border border-hairline bg-[#1f3a2a]/40 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-success">
            <Smartphone className="h-3 w-3" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Mensagem de {box.from}
            </span>
          </div>
          <p className="font-sans text-[16px] leading-relaxed text-text-primary">{box.text}</p>
        </div>
      );

    case "mission":
      return (
        <div className="rounded-[var(--radius-md)] border border-system/40 bg-system/10 p-3.5">
          <div className="mb-1 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-system" />
            <span className="hud-label">Sua missão</span>
          </div>
          <p className="font-sans text-[16px] font-medium leading-snug text-text-primary">
            {box.text}
          </p>
        </div>
      );

    case "image":
      return <SceneImage src={box.src} alt={box.alt} />;
  }
}

function SceneImage({ src, alt }: { src: string; alt: string }) {
  // Placeholder fica atras (mesma area) ate a imagem carregar, sem somar/remover
  // altura (evita pulo de layout). Sem loading="lazy" para nao adiar imagem oculta.
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-hairline bg-bg-surface-2">
      <img
        src={src}
        alt={alt}
        decoding="async"
        className="block h-auto w-full object-cover"
      />
    </div>
  );
}
