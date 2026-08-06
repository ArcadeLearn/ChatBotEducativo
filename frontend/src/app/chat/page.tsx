/**
 * Página de chat standalone — interfaz completa de pruebas (Fase 5).
 */
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatBubble } from "@/components/widget/ChatBubble";
import { useAuthStore } from "@/stores/authStore";

export default function ChatPage() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <ProtectedRoute>
      <main className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-3">
          <ChatWindow onLogout={logout} />
        </div>

        <ChatBubble defaultOpen={false} />
      </main>
    </ProtectedRoute>
  );
}
