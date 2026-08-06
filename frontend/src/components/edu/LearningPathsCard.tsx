/**
 * Grid de rutas de aprendizaje con progreso, duración y certificación.
 */
"use client";

import { getMaxUiCards } from "@/lib/uiCardLimits";
import { formatPartialListLabel } from "@/lib/formatPartialListLabel";
import type { LearningPathItem } from "@/types/chat";
import { ProgressBar } from "./ProgressBar";

interface LearningPathsCardProps {
  data: { paths?: LearningPathItem[]; total?: number };
}

function PathCard({ path }: { path: LearningPathItem }) {
  const gradient = path.colorGradient ?? "from-sky-600 to-teal-600";
  const progress = path.progressPercentage ?? 0;

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/20">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          {path.category && (
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-300">
              {path.category}
            </span>
          )}
          {path.isActive && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              Activa
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold leading-snug text-white">{path.title}</h4>
          {path.subtitle && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{path.subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          {path.totalHours !== undefined && (
            <span>⏱️ {path.totalHours}h</span>
          )}
          {path.estimatedDurationMonths !== undefined && (
            <span>📅 {path.estimatedDurationMonths} meses</span>
          )}
          {path.totalModules !== undefined && (
            <span>📚 {path.totalModules} módulos</span>
          )}
        </div>

        {progress > 0 && (
          <ProgressBar value={progress} label="Tu avance" colorClass="bg-teal-500" />
        )}

        {path.badge && (
          <p className="text-xs text-amber-300/90">{path.badge}</p>
        )}
        {path.certifiedBy && (
          <p className="text-[11px] text-slate-500">Certifica: {path.certifiedBy}</p>
        )}
      </div>
    </article>
  );
}

export function LearningPathsCard({ data }: LearningPathsCardProps) {
  const paths = data.paths ?? [];
  if (paths.length === 0) return null;

  const total = data.total ?? paths.length;
  const maxVisible = getMaxUiCards();
  const visible = paths.slice(0, maxVisible);
  const countLabel = formatPartialListLabel({
    total,
    shown: visible.length,
    noun: "ruta",
    nounPlural: "rutas",
  });

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-slate-400">{countLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((path) => (
          <PathCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  );
}
