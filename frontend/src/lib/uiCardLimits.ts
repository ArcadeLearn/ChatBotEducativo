/**
 * Límite de tarjetas visibles en componentes Rich UI del chat.
 * Configurable vía NEXT_PUBLIC_MAX_UI_CARDS (default 8).
 */

const DEFAULT_MAX_UI_CARDS = 8;
const MIN_MAX_UI_CARDS = 1;
const ABSOLUTE_MAX_UI_CARDS = 24;

/**
 * Devuelve cuántas tarjetas máximo muestra cada componente edu/ en el chat.
 */
export function getMaxUiCards(): number {
  const raw = process.env.NEXT_PUBLIC_MAX_UI_CARDS;
  if (!raw) return DEFAULT_MAX_UI_CARDS;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return DEFAULT_MAX_UI_CARDS;

  return Math.min(ABSOLUTE_MAX_UI_CARDS, Math.max(MIN_MAX_UI_CARDS, parsed));
}
