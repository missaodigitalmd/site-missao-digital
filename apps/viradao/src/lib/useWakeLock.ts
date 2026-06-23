import { useEffect } from "react";

// Trava de "tela acesa" (Fase 6, extra C4). Enquanto o jogo corre, mantem a tela do
// celular ligada: a Screen Wake Lock API evita que a tela apague, o que desaceleraria
// o timer (timers throttled) e daria a impressao de "o app parou". Ajuda a mitigar os
// sintomas do bug do relogio (Ponto 7). Degrada com elegancia: navegador sem suporte
// ou que nega a permissao simplesmente nao trava, sem erro.
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        /* negado / nao suportado: silencioso */
      }
    };

    // O lock e liberado quando a aba vai para segundo plano; re-adquire ao voltar.
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}
