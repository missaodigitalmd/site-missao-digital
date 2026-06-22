// Hora do servidor (relogio confiavel). O cronometro nao pode depender do
// relogio (talvez errado) do celular. Pegamos a hora do Supabase uma vez,
// calculamos o offset em relacao ao Date.now() local e usamos esse offset em
// todo o jogo. O offset fica cacheado para sobreviver a recargas offline.
import { supabase } from "./supabase";

const KEY = "viradao_offset";
const MAX = 6 * 60 * 60 * 1000; // guarda contra offset cacheado absurdo (poison)
let offset = clamp(Number(localStorage.getItem(KEY) || "0") || 0);

function clamp(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(-MAX, Math.min(MAX, v));
}

/** Agora, em ms, corrigido para a hora do servidor. */
export function serverNow(): number {
  return Date.now() + offset;
}

/** Busca a hora do servidor e ajusta o offset (best-effort; ignora se offline). */
export async function initServerTime(): Promise<void> {
  try {
    const t0 = Date.now();
    const { data, error } = await supabase.rpc("server_now");
    const t1 = Date.now();
    if (error || !data) return;
    const serverMs = new Date(data as unknown as string).getTime();
    if (!Number.isFinite(serverMs)) return;
    const rtt = (t1 - t0) / 2; // metade do round-trip aproxima a latencia
    offset = clamp(Math.round(serverMs - (t1 - rtt)));
    localStorage.setItem(KEY, String(offset));
  } catch {
    /* offline: segue com o offset cacheado */
  }
}
