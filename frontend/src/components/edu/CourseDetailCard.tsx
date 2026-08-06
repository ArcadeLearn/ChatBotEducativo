/**
 * Tarjeta de detalle de un curso: hero, stats, módulos con barras y actividades.
 */
"use client";

import type { EnrolledCourse } from "@/types/chat";
import { computeCourseStats, estimateProgressGrade } from "@/lib/courseStats";
import { ProgressBar } from "./ProgressBar";

interface CourseDetailCardProps {
  data: EnrolledCourse;
}

export function CourseDetailCard({ data }: CourseDetailCardProps) {
  const stats = computeCourseStats(data);
  const grade = estimateProgressGrade(data.progressPercentage);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
      {/* Hero */}
      <div className="relative">
        {data.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.thumbnail}
            alt={data.title}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-40 w-full edu-gradient" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {data.level && (
            <span className="mb-2 inline-block rounded-full bg-sky-500/90 px-2 py-0.5 text-xs font-semibold text-white">
              {data.level}
            </span>
          )}
          <h4 className="text-base font-bold text-white">{data.title}</h4>
          {data.instructor && (
            <p className="text-xs text-slate-300">{data.instructor}</p>
          )}
        </div>
        <div className="absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border-4 border-sky-400/80 bg-slate-950/90">
          <span className="text-lg font-bold text-sky-300">{data.progressPercentage}%</span>
          <span className="text-[9px] text-slate-400">avance</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 border-b border-white/5 p-4">
        <StatBox label="Actividades" value={`${stats.completedLessons}/${stats.totalLessons}`} />
        <StatBox label="Módulos" value={`${stats.completedModules}/${stats.totalModules}`} />
        <StatBox label="Calif. est." value={`${grade}`} accent />
      </div>

      <div className="px-4 pt-3">
        <ProgressBar value={data.progressPercentage} label="Progreso general del curso" />
      </div>

      {stats.pendingLessonTitle && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <p className="text-xs font-medium text-amber-300">Siguiente actividad pendiente</p>
          <p className="mt-0.5 text-xs text-amber-100/80">{stats.pendingLessonTitle}</p>
        </div>
      )}

      {/* Módulos */}
      <div className="space-y-3 p-4">
        {data.modules?.map((mod, index) => {
          const lessons = mod.lessons ?? [];
          const done = lessons.filter((l) => l.completed).length;
          const total = lessons.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isComplete = total > 0 && done === total;
          const isPending = done === 0;

          return (
            <div
              key={mod.id}
              className={`rounded-xl border p-3 ${
                isComplete
                  ? "border-teal-500/30 bg-teal-500/5"
                  : isPending
                    ? "border-slate-700 bg-slate-950/40"
                    : "border-sky-500/30 bg-sky-500/5"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isComplete
                        ? "bg-teal-500 text-white"
                        : pct > 0
                          ? "bg-sky-500 text-white"
                          : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-200">{mod.title}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {done}/{total} act.
                </span>
              </div>
              <ProgressBar
                value={pct}
                colorClass={isComplete ? "bg-teal-500" : "bg-sky-500"}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {lessons.map((lesson) => (
                  <span
                    key={lesson.id}
                    title={lesson.title}
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      lesson.completed
                        ? "bg-teal-500/20 text-teal-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {lesson.completed ? "✓" : "○"} {lesson.duration ?? "—"}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-slate-950/50 py-2 text-center">
      <p className={`text-lg font-bold ${accent ? "text-teal-400" : "text-white"}`}>{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
