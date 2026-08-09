/**
 * Tarjeta de perfil del alumno — avatar, badges y métricas visuales.
 * Estilos con variantes dark: para legibilidad en modo claro y oscuro.
 */
"use client";

import type { StudentProfileData } from "@/types/chat";

interface StudentProfileCardProps {
  data: StudentProfileData;
}

const ROLE_CONFIG: Record<string, { gradient: string; icon: string; label: string }> = {
  estudiante: { gradient: "from-sky-500 to-cyan-600", icon: "🎓", label: "Estudiante" },
  instructor: { gradient: "from-violet-500 to-purple-600", icon: "👨‍🏫", label: "Instructor" },
  admin: { gradient: "from-amber-500 to-orange-600", icon: "⭐", label: "Administrador" },
};

function resolveAvatar(data: StudentProfileData): string | null {
  return data.avatar ?? data.avatarUrl ?? null;
}

function RoleBadge({ role }: { role: string }) {
  const key = role.toLowerCase();
  const cfg = ROLE_CONFIG[key] ?? {
    gradient: "from-slate-500 to-slate-600",
    icon: "👤",
    label: role,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${cfg.gradient} px-2.5 py-1 text-[11px] font-semibold text-white shadow-md`}
    >
      <span aria-hidden>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function SpecialtyBadge({ specialty }: { specialty: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-800 dark:text-teal-200">
      <span aria-hidden>⚙️</span>
      {specialty}
    </span>
  );
}

function StatTile({
  icon,
  value,
  label,
  accent,
}: {
  icon: string;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center rounded-xl border px-2 py-3 ${
        accent
          ? "border-sky-500/30 bg-sky-500/10"
          : "border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-950/50"
      }`}
    >
      <span className="text-lg" aria-hidden>
        {icon}
      </span>
      <p
        className={`mt-1 text-xl font-bold ${
          accent ? "text-sky-700 dark:text-sky-300" : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

export function StudentProfileCard({ data }: StudentProfileCardProps) {
  const avatarUrl = resolveAvatar(data);
  const initials = data.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:shadow-lg dark:shadow-black/20">
      {/* Header con gradiente */}
      <div className="relative h-20 bg-gradient-to-r from-sky-400/50 via-teal-400/40 to-violet-400/40 dark:from-sky-600/40 dark:via-teal-600/30 dark:to-violet-600/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.2),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.15),_transparent_60%)]" />
      </div>

      <div className="relative px-4 pb-4">
        {/* Avatar superpuesto */}
        <div className="-mt-10 mb-3 flex items-end gap-3">
          <div className="relative shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={data.name ?? "Avatar"}
                className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-xl ring-2 ring-sky-500/50 dark:border-slate-900"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white edu-gradient text-2xl font-bold text-white shadow-xl ring-2 ring-sky-500/50 dark:border-slate-900">
                {initials ?? "A"}
              </div>
            )}
            {data.streakDays !== undefined && data.streakDays >= 7 && (
              <span
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm shadow-lg"
                title={`Racha de ${data.streakDays} días`}
              >
                🔥
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h4 className="truncate text-lg font-bold text-slate-900 dark:text-white">{data.name}</h4>
            {data.role && (
              <div className="mt-1.5">
                <RoleBadge role={data.role} />
              </div>
            )}
          </div>
        </div>

        {/* Badges matrícula + especialidad */}
        <div className="mb-3 flex flex-wrap gap-2">
          {data.matricula && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 font-mono text-xs text-sky-800 dark:text-sky-300">
              <span aria-hidden>🪪</span>
              {data.matricula}
            </span>
          )}
          {data.specialty && <SpecialtyBadge specialty={data.specialty} />}
        </div>

        {data.email && (
          <p className="mb-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span aria-hidden>✉️</span>
            {data.email}
          </p>
        )}

        {/* Métricas */}
        <div className="flex gap-2">
          {data.completedHours !== undefined && (
            <StatTile
              icon="⏱️"
              value={`${data.completedHours}h`}
              label="Horas"
              accent
            />
          )}
          {data.streakDays !== undefined && (
            <StatTile icon="🔥" value={`${data.streakDays}d`} label="Racha" />
          )}
          {data.certificatesCount !== undefined && (
            <StatTile icon="🏅" value={String(data.certificatesCount)} label="Certificados" />
          )}
        </div>
      </div>
    </article>
  );
}
