/**
 * Indicador visual de "escribiendo..." mientras llega la respuesta.
 */
"use client";

interface TypingIndicatorProps {
  label?: string;
}

export function TypingIndicator({ label = "Consultando Campus IECA..." }: TypingIndicatorProps) {
  return (
    <div className="mb-4 flex animate-fade-in items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full edu-gradient text-sm font-bold text-white">
        IA
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1.5 py-2">
          <span className="h-2 w-2 animate-typing-dot rounded-full bg-sky-400/80" />
          <span className="h-2 w-2 animate-typing-dot rounded-full bg-sky-400/80" />
          <span className="h-2 w-2 animate-typing-dot rounded-full bg-sky-400/80" />
        </div>
        <p className="text-xs italic text-sky-300/80">{label}</p>
      </div>
    </div>
  );
}
