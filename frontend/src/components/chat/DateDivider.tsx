/**
 * Separador visual de día en el historial del chat (Hoy / Ayer / fecha).
 */
interface DateDividerProps {
  label: string;
}

export function DateDivider({ label }: DateDividerProps) {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="rounded bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
        {label}
      </span>
      <hr className="flex-1 border-sky-500/20" />
    </div>
  );
}
