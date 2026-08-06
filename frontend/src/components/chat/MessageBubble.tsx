/**
 * Burbuja de mensaje (usuario o asistente) con Markdown, tarjetas UI, hora, copiar y feedback.
 */
"use client";

import { useCallback, useState } from "react";
import { formatChatTimestamp } from "@/lib/formatChatTimestamp";
import type { EduPayload } from "@/types/chat";
import { EduPayloadRenderer } from "./EduPayloadRenderer";
import { MarkdownContent } from "./MarkdownContent";

interface MessageBubbleProps {
  id?: string;
  role: string;
  content: string;
  payload?: EduPayload | null;
  timestamp?: string;
  /** Referencia "ahora" para timestamps relativos en vivo */
  now?: Date;
  feedback?: "positive" | "negative";
  onFeedback?: (messageId: string, rating: "positive" | "negative") => void;
}

function CopyIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function MessageActions({
  messageId,
  content,
  timestamp,
  now,
  feedback,
  onFeedback,
  align,
}: {
  messageId?: string;
  content: string;
  timestamp?: string;
  now?: Date;
  feedback?: "positive" | "negative";
  onFeedback?: (messageId: string, rating: "positive" | "negative") => void;
  align: "left" | "right";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  }, [content]);

  const isAssistant = align === "left";

  return (
    <div
      className={`mt-1 flex items-center gap-2 ${align === "right" ? "justify-end" : "justify-start pl-12"}`}
    >
      {timestamp && (
        <p className={`text-[11px] ${align === "right" ? "text-sky-600 dark:text-sky-200/70" : "text-slate-500"}`}>
          {formatChatTimestamp(timestamp, now)}
        </p>
      )}
      {isAssistant && (
        <span className="inline-flex items-center gap-1">
          {copied && (
            <span className="text-[11px] font-medium text-emerald-400">Copiado</span>
          )}
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded p-1 opacity-60 transition hover:bg-slate-200 hover:opacity-100 dark:hover:bg-white/5"
            aria-label="Copiar respuesta"
            title="Copiar respuesta"
          >
            <CopyIcon />
          </button>
          {onFeedback && messageId && (
            <span className="ml-0.5 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onFeedback(messageId, "positive")}
                className={`rounded-full p-1.5 transition-all ${
                  feedback === "positive"
                    ? "bg-sky-500/20 scale-110"
                    : "hover:bg-slate-200 text-slate-500 dark:hover:bg-white/5 dark:text-slate-400"
                }`}
                aria-label="Buena respuesta"
                title="Buena respuesta"
              >
                <span className={feedback === "positive" ? "brightness-110" : "grayscale"}>
                  👍
                </span>
              </button>
              <button
                type="button"
                onClick={() => onFeedback(messageId, "negative")}
                className={`rounded-full p-1.5 transition-all ${
                  feedback === "negative"
                    ? "bg-red-500/20 scale-110"
                    : "hover:bg-slate-200 text-slate-500 dark:hover:bg-white/5 dark:text-slate-400"
                }`}
                aria-label="Mala respuesta"
                title="Mala respuesta"
              >
                <span className={feedback === "negative" ? "brightness-110" : "grayscale"}>
                  👎
                </span>
              </button>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function MessageBubble({
  id,
  role,
  content,
  payload,
  timestamp,
  now,
  feedback,
  onFeedback,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="mb-4 animate-fade-in">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md edu-gradient px-4 py-3 text-sm text-white shadow-lg shadow-sky-900/20">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        </div>
        <MessageActions timestamp={timestamp} now={now} content={content} align="right" />
      </div>
    );
  }

  if (role === "assistant") {
    return (
      <div className="mb-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-slate-100 text-xs font-bold text-sky-600 dark:bg-slate-900 dark:text-sky-300">
            IA
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100">
            <MarkdownContent content={content} />
            <EduPayloadRenderer payload={payload} />
          </div>
        </div>
        <MessageActions
          messageId={id}
          content={content}
          timestamp={timestamp}
          now={now}
          feedback={feedback}
          onFeedback={onFeedback}
          align="left"
        />
      </div>
    );
  }

  return null;
}
