/**
 * Formateo de fechas en zona horaria Ciudad de México.
 */
export const TIMEZONE_MEXICO = "America/Mexico_City";

const MEXICO_OPTS = { timeZone: TIMEZONE_MEXICO } as const;

/** Partes YYYY-MM-DD en Ciudad de México para comparar días. */
export function getMexicoDateString(date: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_MEXICO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

/** Etiqueta de grupo por día: "Hoy", "Ayer" o "15 feb". */
export function getDateGroupLabelInMexico(ts: string): string {
  const d = new Date(ts);
  const today = getMexicoDateString(new Date());
  const yesterday = getMexicoDateString(new Date(Date.now() - 86_400_000));
  const dateStr = getMexicoDateString(d);
  if (dateStr === today) return "Hoy";
  if (dateStr === yesterday) return "Ayer";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", ...MEXICO_OPTS });
}
