import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Backpack, Footprints, Star, Flag, Play, Pause, ChevronDown } from "lucide-react";
import type { StoryCard as Card, Box } from "@/content/story";
import { cardAudioSrc } from "@/content/story";
import { useGameStore } from "@/store/useGameStore";
import { useAudioStore } from "@/store/useAudioStore";
import * as narration from "@/lib/narration";
import { prefersReducedMotion } from "@/lib/helpers";
import { cn } from "@/lib/cn";
import { BoxRenderer } from "./BoxRenderer";

// Tempo estimado de cada caixa (ms), usado so para o "tempo sintetico" do
// fallback quando ainda nao ha o arquivo de audio do card.
function segMs(box: Box): number {
  if (box.kind === "image") return 1500;
  if (box.kind === "mission") return 3000;
  const len = "text" in box ? box.text.length : 200;
  return Math.min(9000, Math.max(1800, Math.round(len * 42)));
}

function durationHint(card: Card): number {
  return card.boxes.reduce((sum, b) => sum + segMs(b), 0) / 1000; // segundos
}

function CardIcon({ card }: { card: Card }) {
  const cls = "h-4 w-4";
  if (card.tag === "abertura") return <Backpack className={cls} />;
  if (card.tag === "secundaria") return <Star className={cls} />;
  if (card.tag === "final") return <Flag className={cls} />;
  return <Footprints className={cls} />;
}

// Tratamento cinematografico dos finais (Design System 10): o final ganha
// destaque e a cor acompanha o desfecho.
function finalTone(card: Card): string {
  if (card.finalKind === "fracasso") return "border-red/40 bg-[#170d10]";
  if (card.finalKind === "v2") return "border-system/50 bg-[#0b1a1a]";
  if (card.finalKind === "v1") return "border-amber/30 bg-bg-surface";
  return "border-hairline bg-bg-surface";
}

export function StoryCard({ card }: { card: Card }) {
  const lastUnlockTick = useGameStore((s) => s.lastUnlockTick);
  const lastUnlockId = useGameStore((s) => s.lastUnlockId);
  const activeAudio = useAudioStore((s) => s.activeId);
  const setActiveAudio = useAudioStore((s) => s.setActive);

  const total = card.boxes.length;
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(0); // caixas visiveis no corpo
  const [fraction, setFraction] = useState(0); // posicao da narracao 0..1 (timeline)
  const [playing, setPlaying] = useState(false);
  const seenFull = useRef(false); // ja entregue por completo? (entao nunca mais revela progressivo)
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const isFinal = card.tag === "final";
  const reduced = prefersReducedMotion();

  // Entrega o conteudo completo, de forma definitiva. Fechar ou pausar no meio
  // da primeira narracao ja revela tudo, e fica revelado para sempre.
  function completeReveal() {
    setRevealed(total);
    seenFull.current = true;
  }

  function startSession(fromFraction: number) {
    narration.play({
      cardId: card.id,
      src: cardAudioSrc(card),
      total,
      durationHint: durationHint(card),
      startFraction: fromFraction,
      onProgress: (frac, revealCount) => {
        setFraction(frac);
        if (!seenFull.current) setRevealed((r) => Math.max(r, revealCount));
      },
      onDone: () => {
        setPlaying(false);
        seenFull.current = true;
      },
    });
    setPlaying(true);
  }

  // Novo destravamento: o card recem-destravado abre sozinho e narra (so na 1a vez);
  // os demais recolhem (Design System 6.1). Um card interrompido ao recolher e
  // entregue por completo.
  useEffect(() => {
    if (lastUnlockId === card.id) {
      setOpen(true);
      if (!seenFull.current) {
        // Movimento reduzido: tudo aparece de uma vez, mas o audio ainda toca.
        setRevealed(reduced ? total : 0);
        setFraction(0);
        startSession(0);
      }
      // Rola ate o card recem-aberto (auto-scroll do diario).
      requestAnimationFrame(() => {
        rootRef.current?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      });
    } else if (lastUnlockId) {
      // Outro card assumiu: se este estava no meio da primeira narracao, completa.
      if (open && !seenFull.current) completeReveal();
      setOpen(false);
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUnlockTick]);

  // Um audio por vez: se outro card assumiu, este deixa de "tocar".
  useEffect(() => {
    if (playing && activeAudio !== card.id) setPlaying(false);
  }, [activeAudio, playing, card.id]);

  function toggleOpen() {
    if (open) {
      // Fechar a caixa: para o som na hora e entrega o conteudo completo.
      setOpen(false);
      if (narration.isActive(card.id)) narration.stop(card.id);
      setPlaying(false);
      completeReveal();
    } else {
      // Reabrir: sempre mostra tudo (o autoplay so existe na 1a abertura).
      setOpen(true);
      completeReveal();
    }
  }

  function togglePlay() {
    if (playing) {
      // Pausar no meio tambem entrega o conteudo completo, para sempre.
      narration.pause();
      setPlaying(false);
      completeReveal();
      return;
    }
    setActiveAudio(card.id);
    if (narration.isActive(card.id)) {
      narration.resume();
      setPlaying(true);
    } else {
      startSession(0); // re-narrar do inicio
    }
  }

  // Clique na timeline: salta para aquele ponto do audio (frente ou tras).
  function seekFromEvent(clientX: number) {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setActiveAudio(card.id);
    setFraction(f);
    if (narration.isActive(card.id)) {
      narration.seek(card.id, f);
      setPlaying(true);
    } else {
      startSession(f);
    }
  }

  const isNewest = lastUnlockId === card.id;
  const playFill = Math.round(fraction * 100);

  return (
    <div
      ref={rootRef}
      className={cn(
        "overflow-hidden border bg-bg-surface scroll-mt-2",
        isFinal
          ? cn("rounded-[var(--radius-lg)]", finalTone(card))
          : "rounded-[var(--radius-md)] border-hairline",
        isNewest && open && !isFinal && "shadow-[0_0_28px_-10px_var(--color-system)]",
        isFinal && open && "shadow-[0_0_36px_-12px_var(--color-system)]",
      )}
    >
      {/* Barra de titulo */}
      <button
        onClick={toggleOpen}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
      >
        <span className={isFinal ? "text-text-secondary" : "text-system"}>
          <CardIcon card={card} />
        </span>
        <span className="flex-1 font-sans text-[15px] font-semibold text-text-primary">
          {isFinal && (
            <span className="mr-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Desfecho
            </span>
          )}
          {card.title}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-text-secondary transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <div className="px-4 pb-4">
              {/* Player de narracao: play/pause + timeline clicavel */}
              <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-sm)] border border-hairline bg-bg-base px-3 py-2">
                <button
                  onClick={togglePlay}
                  aria-label={playing ? "Pausar narração" : "Tocar narração"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-system/40 bg-system/15 text-system"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Narração {playing ? "(tocando)" : ""}
                  </div>
                  <div
                    ref={barRef}
                    role="slider"
                    aria-label="Linha do tempo da narração"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={playFill}
                    onClick={(e) => seekFromEvent(e.clientX)}
                    className="-my-1.5 cursor-pointer py-1.5"
                  >
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-surface-2">
                      <div
                        className="h-full bg-system transition-all duration-200"
                        style={{ width: `${playFill}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Corpo: caixas reveladas em sequencia */}
              <div className="flex flex-col gap-3">
                {card.boxes.slice(0, Math.max(revealed, 0)).map((box, i) => (
                  <motion.div
                    key={i}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.3 }}
                  >
                    <BoxRenderer box={box} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
