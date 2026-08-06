/**
 * Menú principal de opciones del asistente educativo (saludo / ayuda).
 */
"use client";

interface MenuOption {
  id: string;
  icon?: string;
  title: string;
  example: string;
}

interface MainMenuCardProps {
  data: {
    options?: MenuOption[];
    title?: string;
  };
  /** Envía la pregunta de ejemplo como mensaje del usuario */
  onOptionClick?: (question: string) => void;
  disabled?: boolean;
}

export function MainMenuCard({ data, onOptionClick, disabled = false }: MainMenuCardProps) {
  const options = data.options ?? [];

  return (
    <div className="mt-3 space-y-2">
      {data.title && (
        <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {data.title}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled || !onOptionClick}
            onClick={() => onOptionClick?.(option.example)}
            className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-left transition hover:border-sky-500/40 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500/10 dark:hover:bg-sky-500/15"
            aria-label={`Preguntar: ${option.example}`}
          >
            <div className="flex items-start gap-2">
              {option.icon && (
                <span className="text-lg" aria-hidden>
                  {option.icon}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {option.title}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Toca para preguntar: &quot;{option.example}&quot;
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
