/**
 * Página raíz — redirige según estado de autenticación.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthHydration } from "@/hooks/useAuthHydration";
import { useAuthStore } from "@/stores/authStore";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(isAuthenticated ? "/chat" : "/login");
  }, [hydrated, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      Redirigiendo...
    </div>
  );
}
