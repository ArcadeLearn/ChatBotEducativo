/**
 * Respuesta cuando no hay coincidencia: curso no inscrito, sede inexistente, etc.
 */
"use client";

import { EnrolledCoursesCard } from "@/components/edu/EnrolledCoursesCard";
import type { EnrolledCourse } from "@/types/chat";

interface NotFoundCardProps {
  data: {
    entity_type?: string;
    requested_title?: string;
    requested_label?: string;
    reason?: string;
    catalog_total?: number;
    courses?: EnrolledCourse[];
    total_enrolled?: number;
  };
}

export function NotFoundCard({ data }: NotFoundCardProps) {
  const entity = data.entity_type ?? "recurso";
  const label = data.requested_title ?? data.requested_label ?? "tu búsqueda";

  if (entity === "course" && data.courses?.length) {
    return (
      <div className="mt-3 space-y-3">
        <EnrolledCoursesCard
          data={{
            courses: data.courses,
            total: data.total_enrolled ?? data.courses.length,
          }}
        />
      </div>
    );
  }

  const messages: Record<string, { icon: string; detail: string }> = {
    plantel: {
      icon: "📍",
      detail: data.catalog_total
        ? `Ninguna de las ${data.catalog_total} sedes IECA coincide con tu búsqueda.`
        : "No hay sedes que coincidan con tu búsqueda.",
    },
    catalog: {
      icon: "🔍",
      detail: "No hay cursos en el catálogo con esos criterios.",
    },
  };
  const msg = messages[entity] ?? {
    icon: "ℹ️",
    detail: "No encontramos información para esta consulta.",
  };

  return (
    <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 px-6 py-6 text-center dark:border-amber-500/20">
      <span className="text-3xl" aria-hidden>
        {msg.icon}
      </span>
      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-white">
        Sin resultados para &quot;{label}&quot;
      </p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {msg.detail}
      </p>
    </div>
  );
}
