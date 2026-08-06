/**
 * Widget embebible — botón flotante + ventana de chat (para campusdemo Fase 7).
 */
"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAuthStore } from "@/stores/authStore";

export interface ChatBubbleProps {
  /** Posición del botón flotante */
  position?: "bottom-right" | "bottom-left";
  /** Abrir ventana al montar (útil en demo standalone) */
  defaultOpen?: boolean;
}

export function ChatBubble({
  position = "bottom-right",
  defaultOpen = false,
}: ChatBubbleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const positionClass =
    position === "bottom-left" ? "left-6 bottom-6" : "right-6 bottom-6";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${positionClass}`}>
      {open ? (
        <div className="mb-4 h-[min(640px,calc(100vh-6rem))] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
          <ProtectedRoute>
            <ChatWindow compact skipHistory={false} onClose={() => setOpen(false)} />
          </ProtectedRoute>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={open ? "Minimizar chat" : "Abrir chat educativo"}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full edu-gradient text-sm font-bold text-white shadow-xl shadow-sky-900/40 transition hover:scale-105 hover:brightness-110"
      >
        {open ? "✕" : "IA"}
      </button>
    </div>
  );
}
