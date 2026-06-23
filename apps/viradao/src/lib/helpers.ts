// Helpers puros, sem dependencia de UI.

/** Formata segundos restantes em mm:ss (nunca negativo). */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * Normaliza o codigo digitado igual ao Design System secao 9:
 * remove acento, forca maiuscula e descarta tudo que nao for A-Z ou 0-9.
 * "Estádio" / "estadio" / "ESTÁDIO" -> "ESTADIO".
 */
export function normalizeCode(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export type Urgency = "normal" | "amber" | "critical" | "max" | "zero" | "frozen";

/** Estado de urgencia derivado do tempo restante (Design System secao 4). */
export function urgencyFromSeconds(remaining: number): Urgency {
  if (remaining <= 0) return "zero";
  if (remaining <= 30) return "max";
  if (remaining <= 60) return "critical";
  if (remaining <= 120) return "amber";
  return "normal";
}

/** Cor principal do cronometro por estado de urgencia. */
export function urgencyColor(u: Urgency): string {
  switch (u) {
    case "amber":
      return "var(--color-amber)";
    case "critical":
    case "max":
    case "zero":
      return "var(--color-red)";
    case "frozen":
      return "var(--color-text-secondary)";
    default:
      return "var(--color-system)";
  }
}

/** Converte "mm:ss" em segundos (para os bonus da tabela de conteudo). */
export function parseClock(mmss: string): number {
  const [m, s] = mmss.split(":").map((n) => parseInt(n, 10));
  return (m || 0) * 60 + (s || 0);
}

/**
 * URL absoluta do link da equipe, resolvida a partir da URL atual. Em dev vira
 * http://localhost:5173/viradao/#/equipe/team-1; no deploy, herda o host do site
 * pai (ex.: https://missaodigitalmd.com/viradao/#/equipe/team-1). Mesma logica do
 * QR Code, para o link mostrado e o QR apontarem exatamente para o mesmo lugar.
 */
export function teamUrl(token: string): string {
  return new URL(`#/equipe/${token}`, window.location.href).href;
}

/** Copia texto para a area de transferencia (best-effort, com fallback legado). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* cai no fallback */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** True se o usuario pediu movimento reduzido (Design System 3.4). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
