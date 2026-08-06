/**
 * Mapeo feedback UI ↔ score numérico del backend (1 = bueno, 0 = malo).
 */
export type FeedbackRating = "positive" | "negative";

export function scoreToRating(score: number | null | undefined): FeedbackRating | undefined {
  if (score === 1) return "positive";
  if (score === 0) return "negative";
  return undefined;
}

export function ratingToScore(rating: FeedbackRating): 0 | 1 {
  return rating === "positive" ? 1 : 0;
}
