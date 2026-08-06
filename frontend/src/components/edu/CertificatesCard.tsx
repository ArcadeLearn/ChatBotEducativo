/**
 * Lista de certificados con badges de tipo y calificación integrados al contenido.
 */
"use client";

import { getMaxUiCards } from "@/lib/uiCardLimits";
import { formatPartialListLabel } from "@/lib/formatPartialListLabel";
import type { CertificateItem } from "@/types/chat";

interface CertificatesCardProps {
  data: { certificates?: CertificateItem[]; total?: number };
}

const TYPE_CONFIG: Record<
  string,
  { gradient: string; glow: string; icon: string; label: string }
> = {
  Curso: {
    gradient: "from-sky-500 to-blue-600",
    glow: "shadow-sky-500/25",
    icon: "📘",
    label: "Curso",
  },
  Diplomado: {
    gradient: "from-violet-500 to-purple-700",
    glow: "shadow-purple-500/30",
    icon: "🎓",
    label: "Diplomado",
  },
  Certificación: {
    gradient: "from-amber-400 to-orange-600",
    glow: "shadow-amber-500/30",
    icon: "🏅",
    label: "Certificación",
  },
  "Taller Presencial": {
    gradient: "from-teal-500 to-emerald-600",
    glow: "shadow-teal-500/25",
    icon: "🔧",
    label: "Taller",
  },
};

function gradeStyle(grade: number): { gradient: string; label: string } {
  if (grade >= 95) return { gradient: "from-emerald-400 to-teal-500", label: "Excelente" };
  if (grade >= 85) return { gradient: "from-sky-400 to-cyan-500", label: "Muy bien" };
  return { gradient: "from-slate-400 to-slate-500", label: "Aprobado" };
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? {
    gradient: "from-slate-500 to-slate-600",
    glow: "shadow-slate-500/20",
    icon: "📜",
    label: type,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${cfg.gradient} px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg ${cfg.glow}`}
    >
      <span aria-hidden>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function GradeBadge({ grade }: { grade: number }) {
  const style = gradeStyle(grade);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${style.gradient} px-2.5 py-1 text-[11px] font-bold text-white shadow-md`}
      title={style.label}
    >
      <span className="text-[10px] font-normal opacity-90">Calif.</span>
      {grade}
    </span>
  );
}

export function CertificatesCard({ data }: CertificatesCardProps) {
  const certs = data.certificates ?? [];
  if (certs.length === 0) return null;

  const total = data.total ?? certs.length;
  const visible = certs.slice(0, getMaxUiCards());
  const countLabel = formatPartialListLabel({
    total,
    shown: visible.length,
    noun: "certificado",
    nounPlural: "certificados",
  });

  return (
    <div className="mt-3 space-y-3">
      {visible.length < total && (
        <p className="text-xs text-slate-400">{countLabel}</p>
      )}
      {visible.map((cert, idx) => {
        const typeCfg = TYPE_CONFIG[cert.course_type ?? ""] ?? TYPE_CONFIG.Curso;
        return (
          <article
            key={cert.certificate_id ?? idx}
            className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/20"
          >
            {/* Franja lateral decorativa — sin calificación aquí */}
            <div
              className={`w-1.5 shrink-0 bg-gradient-to-b ${typeCfg.gradient}`}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 gap-3 p-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${typeCfg.gradient} text-lg shadow-md ${typeCfg.glow}`}
              >
                {typeCfg.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                  {cert.course_title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {cert.course_type && <TypeBadge type={cert.course_type} />}
                  {cert.grade !== undefined && <GradeBadge grade={cert.grade} />}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                  {cert.accreditation_date && (
                    <span className="flex items-center gap-1">
                      <span aria-hidden>📅</span>
                      {cert.accreditation_date}
                    </span>
                  )}
                  {cert.certificate_id && (
                    <span className="text-slate-600">Folio: {cert.certificate_id}</span>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
      {total > visible.length && (
        <p className="pt-1 text-center text-xs text-slate-500">
          + {total - visible.length} certificados más en tu historial
        </p>
      )}
    </div>
  );
}
