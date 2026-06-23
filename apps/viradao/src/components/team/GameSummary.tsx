import { motion } from "motion/react";
import { Compass, Flag, Hourglass, Sparkles } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { PRINCIPAIS } from "@/content/story";
import { formatTime } from "@/lib/helpers";
import { cn } from "@/lib/cn";

// Resumo da partida (Ponto 11). Aparece depois do card de fechamento, quando o jogo
// termina (sucesso ou fracasso). REGRA DE OURO: espelha so o que ESTA equipe viveu;
// nunca revela conteudo nao desbloqueado (ex.: quantas secundarias existiam), nem
// dados de outras equipes, nem finais nao alcancados. So conta a jornada deles.
export function GameSummary() {
  const phase = useGameStore((s) => s.phase);
  const finalKind = useGameStore((s) => s.finalKind);
  const mainUnlocked = useGameStore((s) => s.mainUnlocked);
  const secondaryUnlocked = useGameStore((s) => s.secondaryUnlocked);
  const log = useGameStore((s) => s.log);
  const initialSeconds = useGameStore((s) => s.initialSeconds);
  const remaining = useGameStore((s) => s.remaining);

  if (phase !== "success" && phase !== "failed") return null;

  const success = phase === "success";

  // Etapas principais concluidas (de 4), sem contar abertura nem o final.
  const principalIds = new Set(PRINCIPAIS.map((p) => p.id));
  const mainsDone = mainUnlocked.filter((id) => principalIds.has(id)).length;
  const secsFound = secondaryUnlocked.length;

  // Tempo de jogo derivado do proprio orcamento da equipe (inicial + bonus que ELES
  // conquistaram) menos o que sobrou. Nada que eles nao saberiam.
  const bonusSum = log.reduce((acc, e) => acc + (e.bonus || 0), 0);
  const budget = initialSeconds + bonusSum;
  const elapsed = Math.max(0, Math.round(budget - remaining));
  const leftover = success ? Math.max(0, Math.round(remaining)) : 0;

  const accent = success ? "var(--color-success)" : "var(--color-red)";
  const title = success
    ? finalKind === "v2"
      ? "Vocês chegaram ao Wisly a tempo"
      : "Vocês encontraram o Wisly"
    : "O tempo se esgotou";
  const closing = success
    ? "A pressa de vocês foi por uma vida real. É disso que se trata: ninguém perdido longe demais para ser encontrado. Vamos conversar sobre o Wisly?"
    : "O relógio venceu desta vez, mas a corrida valeu. Por trás da brincadeira, há gente de verdade esperando ser encontrada. Vamos conversar sobre o Wisly?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="mt-4 rounded-[var(--radius-md)] border bg-bg-surface/95 p-4 backdrop-blur"
      style={{ borderColor: accent }}
    >
      <div className="mb-3 flex items-center gap-2" style={{ color: accent }}>
        <Sparkles className="h-4 w-4" />
        <span className="hud-label">Resumo da jornada</span>
      </div>

      <h3 className="mb-3 font-sans text-lg font-bold text-text-primary">{title}</h3>

      <div className="grid grid-cols-2 gap-2">
        <Stat icon={<Flag className="h-4 w-4" />} label="Etapas concluídas" value={`${mainsDone} de 4`} />
        <Stat
          icon={<Compass className="h-4 w-4" />}
          label="Missões secundárias"
          value={secsFound === 0 ? "nenhuma" : `${secsFound} descoberta${secsFound > 1 ? "s" : ""}`}
        />
        <Stat
          icon={<Hourglass className="h-4 w-4" />}
          label={success ? "Tempo de jogo" : "Tempo até o fim"}
          value={formatTime(elapsed)}
        />
        {success && (
          <Stat
            icon={<Hourglass className="h-4 w-4" />}
            label="Tempo que sobrou"
            value={formatTime(leftover)}
            highlight={accent}
          />
        )}
      </div>

      <p className="mt-4 font-sans text-[14px] leading-relaxed text-text-secondary">{closing}</p>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-hairline bg-bg-base p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-text-secondary">
        <span className="text-text-muted">{icon}</span>
        <span className="font-mono text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <div
        className={cn("font-mono text-lg font-bold")}
        style={{ color: highlight ?? "var(--color-text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}
