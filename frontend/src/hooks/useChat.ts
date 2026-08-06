/**
 * Hook de chat educativo — TanStack Query (historial) + Vercel AI SDK (streaming).
 * Persiste y restaura payload UI rico y feedback desde PostgreSQL al recargar.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat as useAiChat, type Message } from "ai/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { decodePayloadHeader } from "@/lib/payloadCodec";
import { SESSION_STORAGE_KEY } from "@/lib/constants";
import { normalizeAssistantResponse } from "@/lib/normalizeResponse";
import { useAuthStore } from "@/stores/authStore";
import type { BackendMessage, EduPayload } from "@/types/chat";
import { scoreToRating } from "@/lib/feedback";

function readStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function writeStoredSessionId(sessionId: string | null): void {
  if (typeof window === "undefined") return;
  if (sessionId) localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  else localStorage.removeItem(SESSION_STORAGE_KEY);
}

function extractPayloadsFromHistory(rows: BackendMessage[]): Record<string, EduPayload> {
  const map: Record<string, EduPayload> = {};
  for (const row of rows) {
    if (row.payload?.type && row.payload.data !== undefined) {
      map[row.id] = row.payload;
    }
  }
  return map;
}

function extractFeedbackFromHistory(
  rows: BackendMessage[],
): Record<string, "positive" | "negative"> {
  const map: Record<string, "positive" | "negative"> = {};
  for (const row of rows) {
    const rating = scoreToRating(row.feedback);
    if (rating) map[row.id] = rating;
  }
  return map;
}

function extractTimestampsFromHistory(rows: BackendMessage[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.createdAt) map[row.id] = row.createdAt;
  }
  return map;
}

export interface UseEduChatOptions {
  /** Si true, no carga historial al montar (modo widget vacío). */
  skipHistory?: boolean;
}

/**
 * Orquesta sesión persistida, historial vía TanStack Query y envío con useChat.
 */
export function useEduChat(options: UseEduChatOptions = {}) {
  const { skipHistory = false } = options;
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(() => readStoredSessionId());
  const [payloadByMessageId, setPayloadByMessageId] = useState<Record<string, EduPayload>>({});
  const [feedbackByMessageId, setFeedbackByMessageId] = useState<
    Record<string, "positive" | "negative">
  >({});
  const [timestampByMessageId, setTimestampByMessageId] = useState<Record<string, string>>({});
  const pendingPayloadRef = useRef<{ messageId: string; payload: EduPayload } | null>(null);
  const historyHydratedRef = useRef(false);

  const historyQuery = useQuery({
    queryKey: ["session-messages", sessionId],
    enabled: Boolean(token && sessionId && !skipHistory),
    queryFn: () => apiFetch<BackendMessage[]>(`/sessions/${sessionId}/messages`),
    staleTime: 30_000,
  });

  const chat = useAiChat({
    api: "/api/chat",
    id: sessionId ?? "new-session",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: { sessionId },
    streamProtocol: "text",
    onResponse: (response) => {
      const nextSessionId = response.headers.get("X-Session-Id");
      if (nextSessionId) {
        setSessionId(nextSessionId);
        writeStoredSessionId(nextSessionId);
      }
      const payloadHeader = response.headers.get("X-Chat-Payload");
      const assistantMessageId = response.headers.get("X-Assistant-Message-Id");
      if (payloadHeader && assistantMessageId) {
        const payload = decodePayloadHeader(payloadHeader);
        if (payload) {
          pendingPayloadRef.current = { messageId: assistantMessageId, payload };
        }
      }
    },
    onFinish: (message: Message) => {
      const pending = pendingPayloadRef.current;
      const dbId = pending?.messageId;
      const now = new Date().toISOString();

      if (pending?.payload && dbId) {
        setPayloadByMessageId((prev) => ({ ...prev, [dbId]: pending.payload }));
        pendingPayloadRef.current = null;
        chat.setMessages((prev) =>
          prev.map((m) => (m.id === message.id && m.role === "assistant" ? { ...m, id: dbId } : m)),
        );
        setTimestampByMessageId((prev) => {
          const ts = prev[dbId] ?? prev[message.id] ?? now;
          const next = { ...prev, [dbId]: ts };
          if (message.id !== dbId) delete next[message.id];
          return next;
        });
        setFeedbackByMessageId((prev) => {
          const rating = prev[dbId] ?? prev[message.id];
          if (!rating) return prev;
          const next = { ...prev, [dbId]: rating };
          if (message.id !== dbId) delete next[message.id];
          return next;
        });
      } else if (message.id) {
        setTimestampByMessageId((prev) => ({ ...prev, [message.id]: now }));
      }

      if (sessionId) {
        void queryClient.invalidateQueries({ queryKey: ["session-messages", sessionId] });
      }
    },
  });

  /** Asigna timestamp a mensajes nuevos que aún no lo tienen. */
  useEffect(() => {
    setTimestampByMessageId((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const m of chat.messages) {
        if (!next[m.id]) {
          next[m.id] = m.createdAt?.toISOString() ?? new Date().toISOString();
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [chat.messages]);

  useEffect(() => {
    if (skipHistory) return;
    const stored = readStoredSessionId();
    if (stored) setSessionId(stored);
  }, [skipHistory]);

  /** Hidrata mensajes, payloads, feedback y timestamps desde BD al recargar. */
  useEffect(() => {
    if (!historyQuery.data || skipHistory) return;

    const payloads = extractPayloadsFromHistory(historyQuery.data);
    const feedback = extractFeedbackFromHistory(historyQuery.data);
    const timestamps = extractTimestampsFromHistory(historyQuery.data);

    setPayloadByMessageId((prev) => ({ ...prev, ...payloads }));
    setFeedbackByMessageId((prev) => ({ ...prev, ...feedback }));
    setTimestampByMessageId((prev) => ({ ...prev, ...timestamps }));

    if (!historyHydratedRef.current && historyQuery.data.length > 0) {
      chat.setMessages(
        historyQuery.data.map((row) => ({
          id: row.id,
          role: row.role,
          content: normalizeAssistantResponse(row.content),
          createdAt: new Date(row.createdAt),
        })),
      );
      historyHydratedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyQuery.data, skipHistory]);

  const startNewSession = useCallback(() => {
    writeStoredSessionId(null);
    setSessionId(null);
    setPayloadByMessageId({});
    setFeedbackByMessageId({});
    setTimestampByMessageId({});
    pendingPayloadRef.current = null;
    historyHydratedRef.current = false;
    chat.setMessages([]);
  }, [chat]);

  const sendSuggested = useCallback(
    (text: string) => {
      void chat.append({ role: "user", content: text, createdAt: new Date() });
    },
    [chat],
  );

  const handleFeedback = useCallback(
    async (messageId: string, rating: "positive" | "negative") => {
      setFeedbackByMessageId((prev) => ({ ...prev, [messageId]: rating }));
      if (!sessionId) return;

      const idx = chat.messages.findIndex((m) => m.id === messageId);
      const assistantMsg = chat.messages[idx];
      const prevMsg = idx > 0 ? chat.messages[idx - 1] : undefined;
      const userMessage = prevMsg?.role === "user" ? prevMsg.content : undefined;

      try {
        await apiFetch<{ ok: boolean }>(`/sessions/${sessionId}/feedback`, {
          method: "POST",
          body: JSON.stringify({
            messageId,
            rating,
            userMessage,
            assistantContent: assistantMsg?.content,
          }),
        });
      } catch {
        /* feedback opcional; UI ya refleja la selección local */
      }
    },
    [sessionId, chat.messages],
  );

  return {
    ...chat,
    sessionId,
    payloadByMessageId,
    feedbackByMessageId,
    timestampByMessageId,
    isLoadingHistory: historyQuery.isLoading,
    historyError: historyQuery.error,
    startNewSession,
    sendSuggested,
    handleFeedback,
  };
}
