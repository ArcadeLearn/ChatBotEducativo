/**
 * Página de chat standalone — interfaz completa de pruebas (Fase 5).
 */
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatBubble } from "@/components/widget/ChatBubble";
import { useAuthStore } from "@/stores/authStore";

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950">
        <header className="border-b border-white/10 bg-slate-950/90">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-sky-400">Campus IECA</p>
              <h1 className="text-lg font-semibold text-white">
                {user?.name ?? "Estudiante"}
              </h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6">
          <ChatWindow />
        </div>

        <ChatBubble defaultOpen={false} />
      </main>
    </ProtectedRoute>
  );
}
