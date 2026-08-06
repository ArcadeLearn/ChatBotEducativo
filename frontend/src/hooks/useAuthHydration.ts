/**
 * Hook para esperar hidratación del store de auth desde localStorage.
 */
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuthHydration(): boolean {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(hasHydrated);
  }, [hasHydrated]);

  return ready;
}
