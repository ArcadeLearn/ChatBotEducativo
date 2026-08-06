/**
 * Timestamp de burbuja: relativo reciente → hora exacta con segundos.
 * Ej.: "ahora" → "hace 1 min" → "10:25:12 p.m."
 */
import { TIMEZONE_MEXICO } from "./formatDateMexico";

const MEXICO_OPTS = { timeZone: TIMEZONE_MEXICO } as const;

/**
 * Formatea timestamp para mensajes de chat.
 * @param isoString - Fecha ISO del mensaje
 * @param now - Referencia actual (para tests y re-render periódico)
 */
export function formatChatTimestamp(isoString: string, now: Date = new Date()): string {
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) return "ahora";
  if (diffMin < 60) return diffMin === 1 ? "hace 1 min" : `hace ${diffMin} min`;

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...MEXICO_OPTS,
  });
}
