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
  promocion: "border-amber-500/30 bg-amber-500/5",
  evento: "border-sky-500/30 bg-sky-500/5",
  noticia: "border-teal-500/30 bg-teal-500/5",
};

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
            TYPE_STYLES[item.type ?? ""] ?? "border-white/10"
          }`}
        >
          {item.imageUrl && (
            <div className="h-32 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-2">
              {item.badgeText && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-sky-300">
                  {item.badgeText}
                </span>
              )}
              {item.date && <span className="text-xs text-slate-500">{item.date}</span>}
            </div>
            <h4 className="font-semibold text-white">{item.title}</h4>
            {item.summary && <p className="text-sm text-slate-400">{item.summary}</p>}
            {item.actionText && (
              <span className="inline-block text-xs font-medium text-sky-400">
                {item.actionText} →
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
