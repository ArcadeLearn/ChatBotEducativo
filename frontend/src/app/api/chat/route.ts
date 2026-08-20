/**
 * Route handler — proxy streaming hacia POST /chat del backend NestJS.
 * Propaga payload UI rico vía header X-Chat-Payload.
 *
 * En el contenedor edu-app el fetch es server-side: debe ir a Nest en
 * localhost (:4001), no a la URL pública (hairpin/Traefik → 500).
 * El navegador sigue usando NEXT_PUBLIC_API_URL vía apiFetch.
 */
import { encodePayloadHeaderIfFits } from "@/lib/payloadCodec";
import { normalizeAssistantResponse } from "@/lib/normalizeResponse";
import type { ChatApiResponse } from "@/types/chat";

/** Backend Nest interno (runtime). Fallback al público solo en dev local. */
const API_URL = (
  process.env.API_URL_INTERNAL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4001"
).replace(/\/+$/, "");
const CHUNK_SIZE = 14;
const CHUNK_DELAY_MS = 12;

interface ChatRequestBody {
  messages?: Array<{ role: string; content: string }>;
  sessionId?: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return new Response("Missing user message", { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        message: lastUser.content.trim(),
        sessionId: body.sessionId ?? undefined,
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    return new Response(
      `No se pudo contactar al backend (${API_URL}/chat): ${reason}`,
      { status: 502 },
    );
  }

  if (!backendRes.ok) {
    const detail = await backendRes.text();
    return new Response(detail || "Backend chat error", { status: backendRes.status });
  }

  let data: ChatApiResponse;
  try {
    data = (await backendRes.json()) as ChatApiResponse;
  } catch {
    return new Response("Respuesta inválida del backend de chat", { status: 502 });
  }
  const text = normalizeAssistantResponse(data.response);

  const stream = new ReadableStream<string>({
    async start(controller) {
      for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        controller.enqueue(text.slice(i, i + CHUNK_SIZE));
        await sleep(CHUNK_DELAY_MS);
      }
      controller.close();
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
  };
  if (data.sessionId) headers["X-Session-Id"] = data.sessionId;
  if (data.messageId) headers["X-Assistant-Message-Id"] = data.messageId;
  if (data.payload) {
    const encoded = encodePayloadHeaderIfFits(data.payload);
    if (encoded) {
      headers["X-Chat-Payload"] = encoded;
    } else {
      // Payload grande (cursos/avance): evitar 500 por límite de headers
      headers["X-Chat-Payload-Deferred"] = "1";
    }
  }

  return new Response(stream, { headers });
}
