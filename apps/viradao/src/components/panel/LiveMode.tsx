import { usePanelStore } from "@/store/usePanelStore";
import { GlobalBar } from "./GlobalBar";
import { TeamCard } from "./TeamCard";

export function LiveMode() {
  const teams = usePanelStore((s) => s.teams);
  const active = teams.filter((t) => t.active);

  return (
    <div className="min-h-full bg-bg-base">
      <GlobalBar />
      <div className="mx-auto max-w-7xl px-5 py-5">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(248px,1fr))]">
          {active.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
