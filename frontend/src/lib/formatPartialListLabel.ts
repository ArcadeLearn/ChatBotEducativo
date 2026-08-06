/**
 * Texto de conteo cuando la UI muestra un subconjunto del total disponible.
 */

export interface PartialListLabelOptions {
  total: number;
  shown: number;
  /** Singular: "curso", "certificado" */
  noun: string;
  /** Plural opcional: "cursos" (default: noun + "s") */
  nounPlural?: string;
  /** Verbo: "presentamos" | "mostramos" */
  verb?: string;
}

/**
 * Genera etiqueta clara para listas parciales en tarjetas del chat.
 * Ej.: "7 cursos encontrados · presentamos 4"
 */
export function formatPartialListLabel({
  total,
  shown,
  noun,
  nounPlural,
  verb = "presentamos",
}: PartialListLabelOptions): string {
  const plural = nounPlural ?? `${noun}s`;
  const totalText = total === 1 ? `1 ${noun}` : `${total} ${plural}`;
  const found = total === 1 ? "encontrado" : "encontrados";

  if (shown >= total) {
    return `${totalText} ${found}`;
  }

  const shownText = shown === 1 ? `1 ${noun}` : `${shown} ${plural}`;
  return `${totalText} ${found} · ${verb} ${shownText}`;
}
