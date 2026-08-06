/**
 * Demo standalone del widget ChatBubble (sin layout de chat completo).
 */
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatBubble } from "@/components/widget/ChatBubble";

export default function WidgetDemoPage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white">Demo ChatBubble</h1>
          <p className="mt-2 text-sm text-slate-400">
            Usa el botón flotante para abrir el asistente. Este componente se integrará en
            campusdemo en la Fase 7.
          </p>
        </div>
        <ChatBubble defaultOpen />
      </main>
    </ProtectedRoute>
  );
}
