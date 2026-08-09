/**
 * Tarjetas de avisos, eventos y promociones del campus.
 */
"use client";

import { getMaxUiCards } from "@/lib/uiCardLimits";
import { formatPartialListLabel } from "@/lib/formatPartialListLabel";
import type { AnnouncementItem } from "@/types/chat";

interface AnnouncementsCardProps {
  data: { announcements?: AnnouncementItem[]; total?: number };
}

const TYPE_STYLES: Record<string, string> = {
  promocion:
    "border-amber-500/40 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/5",
  evento: "border-sky-500/40 bg-white dark:border-sky-500/30 dark:bg-sky-500/5",
  noticia: "border-teal-500/40 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/5",
};

const BADGE_STYLES: Record<string, string> = {
  promocion:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-transparent dark:bg-slate-800 dark:text-amber-300",
  evento:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-transparent dark:bg-slate-800 dark:text-sky-300",
  noticia:
    "border-teal-200 bg-teal-100 text-teal-800 dark:border-transparent dark:bg-slate-800 dark:text-teal-300",
};

const DEFAULT_BADGE_STYLE =
  "border-slate-200 bg-slate-100 text-slate-700 dark:border-transparent dark:bg-slate-800 dark:text-sky-300";

export function AnnouncementsCard({ data }: AnnouncementsCardProps) {
  const items = data.announcements ?? [];
  if (items.length === 0) return null;

  const total = data.total ?? items.length;
  const visible = items.slice(0, getMaxUiCards());
  const countLabel = formatPartialListLabel({
    total,
    shown: visible.length,
    noun: "aviso",
    nounPlural: "avisos",
  });

  return (
    <div className="mt-3 space-y-3">
      {visible.length < total && (
        <p className="text-xs text-slate-400">{countLabel}</p>
      )}
      {visible.map((item) => (
        <article
          key={item.id}
          className={`overflow-hidden rounded-xl border ${
            TYPE_STYLES[item.type ?? ""] ?? "border-slate-200 bg-white dark:border-white/10"
          }`}
        >
          {item.imageUrl && (
            <div className="h-32 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {item.badgeText && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    BADGE_STYLES[item.type ?? ""] ?? DEFAULT_BADGE_STYLE
                  }`}
                >
                  {item.badgeText}
                </span>
              )}
              {item.date && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.date}</span>
              )}
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
            {item.summary && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.summary}</p>
            )}
            {item.actionText && (
              <span className="inline-block text-xs font-medium text-sky-600 dark:text-sky-400">
                {item.actionText} →
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
