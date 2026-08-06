/**
 * Grid resumido de cursos inscritos (solo para preguntas generales).
 * Sin detalle de módulos — eso va en CourseDetailCard.
 */
"use client";

import { formatPartialListLabel } from "@/lib/formatPartialListLabel";
import { getMaxUiCards } from "@/lib/uiCardLimits";
import type { EnrolledCourse } from "@/types/chat";
import { ProgressBar } from "./ProgressBar";

interface EnrolledCoursesCardProps {
  data: {
    courses?: EnrolledCourse[];
    total?: number;
    summary?: { total_courses?: number; average_progress?: number };
  };
}

function CourseCard({ course }: { course: EnrolledCourse }) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
      {course.thumbnail && (
        <div className="relative h-28 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          {course.level && (
            <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs text-sky-300">
              {course.level}
            </span>
          )}
        </div>
      )}
      <div className="space-y-2 p-3">
        <h4 className="line-clamp-2 text-sm font-semibold text-white">{course.title}</h4>
        {course.instructor && (
          <p className="text-xs text-slate-400">{course.instructor}</p>
        )}
        <ProgressBar value={course.progressPercentage} label="Progreso" />
      </div>
    </article>
  );
}

export function EnrolledCoursesCard({ data }: EnrolledCoursesCardProps) {
  const courses = data.courses ?? [];
  if (courses.length === 0) return null;

  const total = data.total ?? data.summary?.total_courses ?? courses.length;
  const visible = courses.slice(0, getMaxUiCards());
  const countLabel = formatPartialListLabel({
    total,
    shown: visible.length,
    noun: "curso",
    nounPlural: "cursos",
  });

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-slate-400">
        {countLabel}
        {data.summary?.average_progress !== undefined &&
          ` · promedio ${data.summary.average_progress}%`}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      {total > visible.length && (
        <p className="pt-1 text-center text-xs text-slate-500">
          + {total - visible.length} cursos más inscritos
        </p>
      )}
    </div>
  );
}
