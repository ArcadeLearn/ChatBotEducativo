/**
 * Route handler — proxy streaming hacia POST /chat del backend NestJS.
 * Propaga payload UI rico vía header X-Chat-Payload.
 */
import { encodePayloadHeader } from "@/lib/payloadCodec";
import { normalizeAssistantResponse } from "@/lib/normalizeResponse";
import type { ChatApiResponse } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
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

  const backendRes = await fetch(`${API_URL}/chat`, {
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

  if (!backendRes.ok) {
    const detail = await backendRes.text();
    return new Response(detail || "Backend chat error", { status: backendRes.status });
  }

  const data = (await backendRes.json()) as ChatApiResponse;
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
  if (data.payload) headers["X-Chat-Payload"] = encodePayloadHeader(data.payload);

  return new Response(stream, { headers });
}
