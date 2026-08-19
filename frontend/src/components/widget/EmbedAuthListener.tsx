/**
 * Escucha postMessage del host (campusdemo) para inyectar JWT en el iframe /embed.
 */
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/types/auth";

const MESSAGE_SET_AUTH = "SET_EDU_CHAT_AUTH";
const MESSAGE_EMBED_READY = "EDU_CHAT_EMBED_READY";

interface EmbedAuthPayload {
  token: string;
  user: AuthUser;
}

function isAllowedOrigin(origin: string): boolean {
  if (typeof window === "undefined") return false;
  if (origin === window.location.origin) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return origin === "https://iecacampus.arcadevs.cloud";
}

interface EmbedAuthListenerProps {
  children: React.ReactNode;
}

export function EmbedAuthListener({ children }: EmbedAuthListenerProps) {
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [authFromHost, setAuthFromHost] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const notifyReady = () => {
      if (window.parent === window) return;
      window.parent.postMessage({ type: MESSAGE_EMBED_READY }, "*");
    };

    notifyReady();
    const readyInterval = window.setInterval(notifyReady, 1500);

    const handleMessage = (event: MessageEvent) => {
      if (!isAllowedOrigin(event.origin)) return;
      const data = event.data as { type?: string; payload?: EmbedAuthPayload };
      if (data?.type !== MESSAGE_SET_AUTH || !data.payload?.token) return;

      login(data.payload.user, data.payload.token);
      setAuthFromHost(true);
      window.clearInterval(readyInterval);
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(readyInterval);
    };
  }, [login]);

  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Cargando asistente…
      </div>
    );
  }

  if (!isAuthenticated && !authFromHost) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center text-sm text-slate-400">
        <p>Esperando sesión desde Campus IECA…</p>
        <p className="text-xs text-slate-500">Si persiste, vuelve a iniciar sesión en el campus.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export { MESSAGE_EMBED_READY, MESSAGE_SET_AUTH };
