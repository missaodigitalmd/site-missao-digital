import { useEffect } from "react";
import { usePanelStore } from "@/store/usePanelStore";
import { ConfigMode } from "./ConfigMode";
import { LiveMode } from "./LiveMode";

export function PanelScreen() {
  const systemActive = usePanelStore((s) => s.systemActive);
  const tick = usePanelStore((s) => s.tick);
  const load = usePanelStore((s) => s.load);
  const subscribe = usePanelStore((s) => s.subscribe);
  const loaded = usePanelStore((s) => s.loaded);

  // Carrega o estado real do Supabase e assina o realtime (progresso das equipes
  // e mudancas do proprio painel chegam ao vivo).
  useEffect(() => {
    void load();
    const unsub = subscribe();
    return unsub;
  }, [load, subscribe]);

  // Cronometro local (tempo do aparelho) para o relogio correr suave entre updates.
  useEffect(() => {
    const id = setInterval(() => tick(), 250);
    return () => clearInterval(id);
  }, [tick]);

  if (!loaded) {
    return (
      <div className="grid min-h-full place-items-center bg-bg-base font-mono text-sm text-text-muted">
        Carregando o painel…
      </div>
    );
  }

  return systemActive ? <LiveMode /> : <ConfigMode />;
}
