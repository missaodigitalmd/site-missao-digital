import { Star } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { CARD_BY_ID } from "@/content/story";
import { StoryCard } from "./StoryCard";

export function SecondaryMissions() {
  const ids = useGameStore((s) => s.secondaryUnlocked);
  if (ids.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-amber" />
        <span className="hud-label" style={{ color: "var(--color-amber)" }}>
          Missões Secundárias
        </span>
        <span className="font-mono text-xs text-text-muted">({ids.length})</span>
      </div>
      <div className="flex flex-col gap-3">
        {ids.map((id) => (
          <StoryCard key={id} card={CARD_BY_ID[id]} />
        ))}
      </div>
    </section>
  );
}
