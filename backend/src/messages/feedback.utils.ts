/**
 * Utilidades de mapeo feedback UI ↔ score numérico en BD (1 = bueno, 0 = malo).
 */
export type FeedbackRating = "positive" | "negative";
export type FeedbackScore = 0 | 1;

/** Convierte pulgar arriba/abajo a 1 o 0. */
export function ratingToScore(rating: FeedbackRating): FeedbackScore {
  return rating === "positive" ? 1 : 0;
}

/** Convierte score almacenado a valor de UI. */
export function scoreToRating(score: number | null | undefined): FeedbackRating | undefined {
  if (score === 1) return "positive";
  if (score === 0) return "negative";
  return undefined;
}
