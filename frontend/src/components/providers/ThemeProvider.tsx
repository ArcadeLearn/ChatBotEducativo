/**
 * Sincroniza el tema Zustand con la clase en <html> para Tailwind dark/light.
 */
"use client";

import { useEffect } from "react";
import { applyThemeToDocument, useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const hasHydrated = useThemeStore((s) => s.hasHydrated);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    if (hasHydrated) applyThemeToDocument(theme);
  }, [hasHydrated, theme]);

  return children;
}
