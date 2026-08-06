/**
 * Panel de estadísticas RPG: XP, streak y dimensiones con barras.
 */
"use client";

import type { StudentStatsData } from "@/types/chat";
import { ProgressBar } from "./ProgressBar";

interface StudentStatsCardProps {
  data: StudentStatsData;
}

const COLOR_MAP: Record<string, string> = {
  "text-blue-400": "bg-blue-500",
  "text-purple-400": "bg-purple-500",
  "text-green-400": "bg-green-500",
  "text-orange-400": "bg-orange-500",
  "text-red-400": "bg-red-500",
  "text-yellow-400": "bg-yellow-500",
};

function resolveBarColor(tailwindColor?: string): string {
  if (!tailwindColor) return "bg-sky-500";
  return COLOR_MAP[tailwindColor] ?? "bg-sky-500";
}

export function StudentStatsCard({ data }: StudentStatsCardProps) {
  const summary = data.summary;
  const dimensions = data.dimensions ?? [];

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.total_xp !== undefined && (
            <StatChip label="XP total" value={summary.total_xp.toLocaleString()} />
          )}
          {summary.streak_days !== undefined && (
            <StatChip label="Racha" value={`${summary.streak_days} días`} />
          )}
          {summary.total_completed_courses !== undefined && (
            <StatChip label="Acreditados" value={String(summary.total_completed_courses)} />
          )}
          {summary.certificates_count !== undefined && (
            <StatChip label="Certificados" value={String(summary.certificates_count)} />
          )}
        </div>
      )}
      {dimensions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Dimensiones de habilidad
          </p>
          {dimensions.map((dim) => {
            const max = dim.totalPoints ?? 100;
            const pct = max > 0 ? Math.round((dim.score / max) * 100) : dim.score;
            return (
              <div key={dim.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-300">{dim.name}</span>
                  <span className="text-slate-500">
                    {dim.score}/{max}
                  </span>
                </div>
                <ProgressBar
                  value={pct}
                  colorClass={resolveBarColor(dim.color)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
