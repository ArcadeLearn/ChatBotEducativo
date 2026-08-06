/**
 * Contenedor principal del chat educativo (mensajes + input + sugerencias).
 */
"use client";

import { useEffect, useMemo, useRef } from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/constants";
import { getDateGroupLabelInMexico } from "@/lib/formatDateMexico";
import { useEduChat } from "@/hooks/useChat";
import { useRelativeTimeTick } from "@/hooks/useRelativeTimeTick";
import { ChatInput } from "./ChatInput";
import { DateDivider } from "./DateDivider";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  /** Modo compacto para el widget flotante */
  compact?: boolean;
  /** Omitir carga de historial al abrir (widget nuevo) */
  skipHistory?: boolean;
  /** Callback al cerrar (widget) */
  onClose?: () => void;
}

export function ChatWindow({ compact = false, skipHistory = false, onClose }: ChatWindowProps) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    isLoadingHistory,
    error,
    startNewSession,
    sendSuggested,
    payloadByMessageId,
    feedbackByMessageId,
    timestampByMessageId,
    handleFeedback,
  } = useEduChat({ skipHistory });

  const now = useRelativeTimeTick();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messageRows = useMemo(() => {
    type Row =
      | { type: "date"; key: string; label: string }
      | { type: "message"; key: string; message: (typeof messages)[number] };

    const rows: Row[] = [];
    let lastDateGroup = "";

    for (const message of messages) {
      const ts =
        timestampByMessageId[message.id] ??
        message.createdAt?.toISOString() ??
        new Date().toISOString();
      const group = getDateGroupLabelInMexico(ts);
      if (group !== lastDateGroup) {
        lastDateGroup = group;
        rows.push({ type: "date", key: `date-${group}-${ts}`, label: group });
      }
      rows.push({ type: "message", key: message.id, message });
    }

    return rows;
  }, [messages, timestampByMessageId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const onFormSubmit = () => {
    if (!input.trim() || isLoading) return;
    void handleSubmit();
  };

  return (
    <div
      className={`flex flex-col overflow-hidden bg-slate-950 ${
        compact ? "h-full" : "min-h-[70vh] rounded-2xl border border-white/10 shadow-2xl"
      }`}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {compact ? "Asistente Campus IECA" : "Chat Educativo IECA"}
          </h2>
          <p className="text-xs text-slate-400">Cursos, avance, certificados y eventos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startNewSession}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
          >
            Nueva sesión
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar chat"
              className="rounded-lg border border-white/10 px-2 py-1 text-slate-300 hover:bg-white/5"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoadingHistory && (
          <p className="text-center text-sm text-slate-400">Cargando historial...</p>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <div className="mx-auto max-w-lg space-y-4 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl edu-gradient text-2xl font-bold text-white">
              IA
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">¿En qué te ayudo hoy?</h3>
              <p className="mt-1 text-sm text-slate-400">
                Pregunta en lenguaje natural sobre tu avance académico en Campus IECA.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendSuggested(question)}
                  className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200 hover:bg-sky-500/20"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messageRows.map((row) => {
          if (row.type === "date") {
            return <DateDivider key={row.key} label={row.label} />;
          }

          const message = row.message;
          return (
            <MessageBubble
              key={row.key}
              id={message.id}
              role={message.role}
              content={message.content}
              payload={payloadByMessageId[message.id]}
              timestamp={
                timestampByMessageId[message.id] ??
                message.createdAt?.toISOString()
              }
              now={now}
              feedback={feedbackByMessageId[message.id]}
              onFeedback={message.role === "assistant" ? handleFeedback : undefined}
            />
          );
        })}

        {isLoading && <TypingIndicator />}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={onFormSubmit}
        disabled={isLoading}
      />
    </div>
  );
}
