/**
 * Tarjetas de facturas CFDI y historial de pagos del alumno.
 * Vista "payments": movimientos liquidados; vista "invoices": comprobantes fiscales.
 */
"use client";

import { getMaxUiCards } from "@/lib/uiCardLimits";
import { formatPartialListLabel } from "@/lib/formatPartialListLabel";
import type { InvoiceItem } from "@/types/chat";

interface InvoicesCardProps {
  data: {
    invoices?: InvoiceItem[];
    total?: number;
    catalog_total?: number;
    paid_total?: number;
    pending_total?: number;
    paid_count?: number;
    pending_count?: number;
    focus?: string;
    view_mode?: "payments" | "invoices";
    empty?: boolean;
  };
}

const STATUS_CONFIG: Record<
  string,
  { gradient: string; border: string; bg: string; icon: string; label: string }
> = {
  Pagado: {
    gradient: "from-emerald-500 to-teal-600",
    border: "border-emerald-500/40 dark:border-emerald-500/30",
    bg: "bg-emerald-50 dark:bg-emerald-500/5",
    icon: "✓",
    label: "Pagado",
  },
  Pendiente: {
    gradient: "from-amber-400 to-orange-500",
    border: "border-amber-500/40 dark:border-amber-500/30",
    bg: "bg-amber-50 dark:bg-amber-500/5",
    icon: "⏳",
    label: "Pendiente",
  },
  Vencido: {
    gradient: "from-rose-500 to-red-600",
    border: "border-rose-500/40 dark:border-rose-500/30",
    bg: "bg-rose-50 dark:bg-rose-500/5",
    icon: "⚠",
    label: "Vencido",
  },
};

function isPaidStatus(status?: string): boolean {
  return (status ?? "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "") === "pagado";
}

function deriveSummary(data: InvoicesCardProps["data"]) {
  const invoices = data.invoices ?? [];
  const paidItems = invoices.filter((item) => isPaidStatus(item.status));
  const pendingItems = invoices.filter((item) => !isPaidStatus(item.status));

  const paidFromItems = paidItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const pendingFromItems = pendingItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);

  const paidTotal = (data.paid_total ?? 0) > 0 ? data.paid_total! : paidFromItems;
  const pendingTotal =
    (data.pending_total ?? 0) > 0 ? data.pending_total! : pendingFromItems;
  const paidCount = (data.paid_count ?? 0) > 0 ? data.paid_count! : paidItems.length;
  const pendingCount =
    (data.pending_count ?? 0) > 0 ? data.pending_count! : pendingItems.length;

  return { paidTotal, pendingTotal, paidCount, pendingCount };
}

function formatMxn(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date?: string): string {
  if (!date) return "";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Mexico_City",
  });
}

function StatusBadge({ status }: { status?: string }) {
  const cfg = STATUS_CONFIG[status ?? ""] ?? {
    gradient: "from-slate-500 to-slate-600",
    border: "border-white/10",
    bg: "bg-slate-800/60",
    icon: "•",
    label: status ?? "Registrado",
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

function SummaryBanner({
  paidTotal,
  pendingTotal,
  paidCount,
  pendingCount,
  focus,
  viewMode,
}: {
  paidTotal: number;
  pendingTotal: number;
  paidCount: number;
  pendingCount: number;
  focus?: string;
  viewMode: "payments" | "invoices";
}) {
  if (focus === "pending" && pendingCount === 0) return null;

  if (viewMode === "payments") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-500/25 dark:from-emerald-500/15 dark:to-teal-500/5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:font-medium dark:text-emerald-300/80">
          Resumen de pagos
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-950 dark:text-white">
          {formatMxn(paidTotal)}
        </p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          {paidCount} pago{paidCount === 1 ? "" : "s"} registrado{paidCount === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 dark:border-emerald-500/25 dark:from-emerald-500/10 dark:to-teal-500/5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:font-medium dark:text-emerald-300/80">
          Total pagado
        </p>
        <p className="mt-1 text-xl font-bold text-emerald-950 dark:text-white">
          {formatMxn(paidTotal)}
        </p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          {paidCount} comprobante{paidCount === 1 ? "" : "s"} liquidado{paidCount === 1 ? "" : "s"}
        </p>
      </div>
      {(pendingCount > 0 || focus === "pending") && (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:border-amber-500/25 dark:from-amber-500/10 dark:to-orange-500/5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:font-medium dark:text-amber-300/80">
            Pendiente de pago
          </p>
          <p className="mt-1 text-xl font-bold text-amber-950 dark:text-white">
            {formatMxn(pendingTotal)}
          </p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            {pendingCount} factura{pendingCount === 1 ? "" : "s"} por liquidar
          </p>
        </div>
      )}
    </div>
  );
}

function PaymentRow({ invoice }: { invoice: InvoiceItem }) {
  return (
    <article className="relative flex gap-3 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-transparent p-3 pl-4 dark:border-emerald-500/20 dark:from-emerald-500/5">
      <div
        className="absolute bottom-0 left-[1.15rem] top-10 w-px bg-emerald-500/30 dark:bg-emerald-500/20"
        aria-hidden
      />
      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md">
        ✓
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Pago · {formatDate(invoice.date)}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
              {invoice.concept}
            </p>
          </div>
          <p className="shrink-0 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatMxn(invoice.amount ?? 0)}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Comprobante asociado · {invoice.folio ?? invoice.id}
        </p>
      </div>
    </article>
  );
}

function InvoiceRow({ invoice }: { invoice: InvoiceItem }) {
  const statusCfg = STATUS_CONFIG[invoice.status ?? ""] ?? STATUS_CONFIG.Pagado;
  return (
    <article
      className={`overflow-hidden rounded-xl border ${statusCfg.border} ${statusCfg.bg} shadow-sm dark:shadow-lg dark:shadow-black/10`}
    >
      <div className="flex gap-3 p-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${statusCfg.gradient} text-lg shadow-md`}
        >
          📄
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
              {invoice.concept}
            </p>
            <p className="shrink-0 text-base font-bold text-sky-700 dark:text-sky-300">
              {formatMxn(invoice.amount ?? 0)}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {invoice.status && <StatusBadge status={invoice.status} />}
            {invoice.folio && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400">
                {invoice.folio}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {invoice.date && (
              <span className="flex items-center gap-1">
                <span aria-hidden>📅</span>
                {formatDate(invoice.date)}
              </span>
            )}
            {invoice.rfc && <span>RFC: {invoice.rfc}</span>}
          </div>
          {(invoice.pdfUrl || invoice.xmlUrl) && (
            <div className="mt-2 flex flex-wrap gap-3">
              {invoice.pdfUrl && invoice.pdfUrl !== "#" && (
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  PDF CFDI →
                </a>
              )}
              {invoice.xmlUrl && invoice.xmlUrl !== "#" && (
                <a
                  href={invoice.xmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  XML CFDI →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ focus }: { focus?: string }) {
  const messages: Record<string, { icon: string; title: string; detail: string }> = {
    payment_history: {
      icon: "📭",
      title: "Sin pagos registrados",
      detail: "Aún no hay movimientos de pago en tu historial del campus.",
    },
    pending: {
      icon: "✅",
      title: "Sin facturas pendientes",
      detail: "No tienes pagos pendientes en este momento. Tu cuenta está al corriente.",
    },
    default: {
      icon: "📭",
      title: "Sin facturas ni pagos",
      detail: "No hay comprobantes fiscales registrados en tu cuenta del campus IECA.",
    },
  };
  const msg = messages[focus ?? ""] ?? messages.default;

  return (
    <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center dark:border-white/15 dark:bg-slate-900/40">
      <span className="text-3xl" aria-hidden>
        {msg.icon}
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{msg.title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {msg.detail}
      </p>
    </div>
  );
}

export function InvoicesCard({ data }: InvoicesCardProps) {
  const invoices = data.invoices ?? [];
  const total = data.total ?? invoices.length;
  const focus = data.focus ?? "all";
  const viewMode = data.view_mode ?? (focus === "payment_history" ? "payments" : "invoices");
  const isEmpty = data.empty ?? total === 0;
  const summary = deriveSummary(data);

  if (isEmpty) {
    const showPaidSummary = focus === "pending" && summary.paidCount > 0;
    return (
      <div className="mt-3 space-y-3">
        {showPaidSummary && (
          <SummaryBanner {...summary} focus={focus} viewMode={viewMode} />
        )}
        <EmptyState focus={focus} />
      </div>
    );
  }

  const visible = invoices.slice(0, getMaxUiCards());
  const countLabel = formatPartialListLabel({
    total,
    shown: visible.length,
    noun: viewMode === "payments" ? "pago" : "factura",
    nounPlural: viewMode === "payments" ? "pagos" : "facturas",
  });

  return (
    <div className="mt-3 space-y-3">
      <SummaryBanner {...summary} focus={focus} viewMode={viewMode} />

      {visible.length < total && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{countLabel}</p>
      )}

      {viewMode === "payments"
        ? visible.map((invoice) => <PaymentRow key={invoice.id} invoice={invoice} />)
        : visible.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} />)}

      {total > visible.length && (
        <p className="pt-1 text-center text-xs text-slate-500">
          + {total - visible.length}{" "}
          {viewMode === "payments" ? "pagos" : "facturas"} más en tu historial
        </p>
      )}
    </div>
  );
}
