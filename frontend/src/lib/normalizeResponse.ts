/**
 * Normaliza la respuesta del backend (string o bloques tipo LangChain).
 */
export function normalizeAssistantResponse(raw: unknown): string {
  if (typeof raw === "string") {
    return raw.trim();
  }

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  if (raw && typeof raw === "object" && "text" in raw) {
    const text = (raw as { text?: unknown }).text;
    return typeof text === "string" ? text.trim() : "";
  }

  return String(raw ?? "").trim();
}
