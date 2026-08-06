/**
 * Codifica/decodifica payload UI en header X-Chat-Payload (base64 UTF-8).
 */
import type { EduPayload } from "@/types/chat";

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
