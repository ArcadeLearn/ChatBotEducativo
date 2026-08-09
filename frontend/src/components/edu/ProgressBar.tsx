/**
 * Barra de progreso reutilizable para cursos y dimensiones.
 */
interface ProgressBarProps {
  value: number;
  colorClass?: string;
  label?: string;
}

export function ProgressBar({
  value,
  colorClass = "bg-sky-500",
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
