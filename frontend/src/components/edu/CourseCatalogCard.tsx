/**
 * Grid de cursos del catálogo con precio, rating e imagen.
 */
"use client";

import { getMaxUiCards } from "@/lib/uiCardLimits";
import { formatPartialListLabel } from "@/lib/formatPartialListLabel";
import type { CatalogCourse } from "@/types/chat";

interface CourseCatalogCardProps {
  data: { courses?: CatalogCourse[]; total?: number };
}

function formatPrice(value?: number): string {
  if (value === undefined) return "";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function StarRating({ rating }: { rating?: number }) {
  if (rating === undefined) return null;
  return (
    <span className="text-xs text-amber-400">
      {"★".repeat(Math.round(rating))}
      <span className="text-slate-600">{"★".repeat(5 - Math.round(rating))}</span>
      <span className="ml-1 text-slate-400">{rating.toFixed(1)}</span>
    </span>
  );
}

export function CourseCatalogCard({ data }: CourseCatalogCardProps) {
  const courses = data.courses ?? [];
  if (courses.length === 0) return null;

  const total = data.total ?? courses.length;
  const maxVisible = getMaxUiCards();
  const visible = courses.slice(0, maxVisible);
  const countLabel = formatPartialListLabel({
    total,
    shown: visible.length,
    noun: "curso",
    nounPlural: "cursos",
  });

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-slate-400">{countLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((course) => (
          <article
            key={course.id}
            className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60"
          >
            {course.thumbnail && (
              <div className="relative h-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                {course.badge && (
                  <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-slate-900">
                    {course.badge}
                  </span>
                )}
              </div>
            )}
            <div className="space-y-2 p-3">
              <h4 className="text-sm font-semibold text-white">{course.title}</h4>
              <p className="text-xs text-slate-400">{course.category}</p>
              <StarRating rating={course.rating} />
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-teal-400">
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice !== undefined &&
                  course.originalPrice > (course.price ?? 0) && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatPrice(course.originalPrice)}
                    </span>
                  )}
              </div>
              {course.level && (
                <span className="inline-block rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                  {course.level}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
