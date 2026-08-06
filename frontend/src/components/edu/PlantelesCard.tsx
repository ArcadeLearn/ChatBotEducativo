/**
 * Tarjeta de planteles IECA: mapa de Guanajuato + lista de sedes.
 * Muestra todas las sedes en búsqueda general; solo coincidencias si hay filtro.
 */
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { PlantelItem, PlantelMapItem } from "@/types/chat";

const PlantelesMap = dynamic(
  () => import("./PlantelesMap").then((mod) => mod.PlantelesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[340px] w-full items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 text-xs text-slate-400">
        Cargando mapa de Guanajuato…
      </div>
    ),
  },
);

interface PlantelesCardProps {
  data: {
    planteles?: PlantelItem[];
    map_planteles?: PlantelMapItem[];
    total?: number;
    catalog_total?: number;
    filtered?: boolean;
    filter_label?: string | null;
    show_all?: boolean;
  };
}

function toMapItem(plantel: PlantelItem): PlantelMapItem | null {
  if (plantel.lat == null || plantel.lng == null) return null;
  return {
    id: plantel.id,
    nombre: plantel.nombre,
    municipio: plantel.municipio,
    direccion: plantel.direccion,
    telefono: plantel.telefono,
    email: plantel.email,
    lat: plantel.lat,
    lng: plantel.lng,
    especialidades: plantel.especialidades,
    equipamiento: plantel.equipamiento,
    horario: plantel.horario,
  };
}

export function PlantelesCard({ data }: PlantelesCardProps) {
  const listItems = data.planteles ?? [];
  const total = data.total ?? listItems.length;
  const catalogTotal = data.catalog_total ?? total;
  const isFiltered = data.filtered ?? total < catalogTotal;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mapItems = useMemo(() => {
    if (data.map_planteles?.length) return data.map_planteles;
    return listItems.map(toMapItem).filter((item): item is PlantelMapItem => item !== null);
  }, [data.map_planteles, listItems]);

  useEffect(() => {
    if (total === 1 && listItems[0]?.id) {
      setSelectedId(listItems[0].id);
    }
  }, [total, listItems]);

  if (listItems.length === 0 && mapItems.length === 0) return null;

  const selected =
    listItems.find((p) => p.id === selectedId) ??
    mapItems.find((p) => p.id === selectedId) ??
    null;

  const summaryLabel = isFiltered
    ? `${total} plantel${total === 1 ? "" : "es"} encontrados · red IECA: ${catalogTotal} sedes`
    : `${catalogTotal} planteles en la red IECA · mapa con ${mapItems.length} sedes geolocalizadas`;

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-slate-400">{summaryLabel}</p>

      {mapItems.length > 0 && (
        <PlantelesMap
          planteles={mapItems}
          selectedPlantelId={selectedId}
          onSelectPlantel={(plantel) => setSelectedId(plantel.id)}
        />
      )}

      {selected && (
        <article className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
          <h4 className="text-sm font-semibold text-white">{selected.nombre}</h4>
          <p className="mt-1 text-xs text-emerald-300">📍 {selected.municipio}</p>
          {selected.direccion && (
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{selected.direccion}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            {selected.telefono && <span>📞 {selected.telefono}</span>}
            {selected.email && <span>✉️ {selected.email}</span>}
            {selected.horario && <span>🕐 {selected.horario}</span>}
          </div>
          {selected.especialidades?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.especialidades.slice(0, 5).map((spec) => (
                <span
                  key={spec}
                  className="rounded-full border border-white/10 bg-slate-900/60 px-2 py-0.5 text-[10px] text-sky-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          ) : null}
          {selected.equipamiento && (
            <p className="mt-2 text-[11px] text-slate-500">🔧 {selected.equipamiento}</p>
          )}
          {selected.lat != null && selected.lng != null && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              Abrir en Google Maps →
            </a>
          )}
        </article>
      )}

      {total > 1 && (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Selecciona un plantel ({listItems.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {listItems.map((plantel) => {
              const isSelected = plantel.id === selectedId;
              return (
                <button
                  key={plantel.id}
                  type="button"
                  onClick={() => setSelectedId(plantel.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-sky-500/50 bg-sky-500/10"
                      : "border-white/10 bg-slate-900/60 hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{plantel.nombre}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{plantel.municipio}</p>
                  {plantel.direccion && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{plantel.direccion}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
