/**
 * Codifica/decodifica payload UI en header X-Chat-Payload (base64 UTF-8).
 *
 * Proxies (Traefik/Next) limitan tamaño de headers (~8KB total). Payloads Rich UI
 * de course_detail / enrolled_courses suelen superar eso → 500 intermitente.
 */
import type { EduPayload } from "@/types/chat";

/** Tope seguro para un solo header custom (deja margen a Session-Id, etc.). */
export const MAX_PAYLOAD_HEADER_CHARS = 4_000;

export function decodePayloadHeader(header: string): EduPayload | null {
  try {
    const binary = atob(header);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as EduPayload;
    if (parsed?.type && parsed.data !== undefined) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function encodePayloadHeader(payload: unknown): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf-8").toString("base64");
}

/**
 * Codifica el payload solo si cabe en header; si no, el cliente lo carga desde BD.
 */
export function encodePayloadHeaderIfFits(payload: unknown): string | null {
  const encoded = encodePayloadHeader(payload);
  if (encoded.length > MAX_PAYLOAD_HEADER_CHARS) return null;
  return encoded;
}
