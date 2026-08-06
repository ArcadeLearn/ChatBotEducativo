/**
 * Switch claro/oscuro para chat standalone y widget embebido.
 */
"use client";

import { useThemeStore } from "@/stores/themeStore";

interface ThemeToggleProps {
  /** Variante compacta para header del widget */
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
      title={isLight ? "Modo claro" : "Modo oscuro"}
      onClick={toggleTheme}
      className={`group inline-flex items-center gap-2 rounded-lg border transition ${
        compact
          ? "border-white/10 px-2 py-1.5 hover:bg-white/5 dark:border-white/10"
          : "border-slate-200 bg-white px-2.5 py-1.5 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
      }`}
    >
      {!compact && (
        <span className="hidden text-xs font-medium text-slate-600 dark:text-slate-300 sm:inline">
          {isLight ? "Claro" : "Oscuro"}
        </span>
      )}
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          isLight ? "bg-sky-200" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white text-[10px] shadow transition ${
            isLight ? "translate-x-5" : "translate-x-0.5"
          }`}
        >
          {isLight ? "☀️" : "🌙"}
        </span>
      </span>
    </button>
  );
}

/** Script inline para evitar flash de tema incorrecto antes de hidratar React. */
export const THEME_INIT_SCRIPT = `(function(){try{var raw=localStorage.getItem("edu-chat-theme");var theme=raw?JSON.parse(raw).state?.theme:null;if(theme==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");document.documentElement.style.colorScheme="light";}else{document.documentElement.classList.add("dark");document.documentElement.classList.remove("light");document.documentElement.style.colorScheme="dark";}}catch(e){document.documentElement.classList.add("dark");}})();`;
