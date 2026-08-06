/**
 * Mapa Leaflet de planteles IECA en Guanajuato (pins lat/lng).
 * Adaptado de campusdemo — uso imperativo sin SSR.
 */
"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { PlantelMapItem } from "@/types/chat";

interface PlantelesMapProps {
  planteles: PlantelMapItem[];
  selectedPlantelId: string | null;
  onSelectPlantel: (plantel: PlantelMapItem) => void;
}

export function PlantelesMap({
  planteles,
  selectedPlantelId,
  onSelectPlantel,
}: PlantelesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!mapContainerRef.current || planteles.length === 0) return;

    const createCustomIcon = (isSelected: boolean) => {
      const color = isSelected ? "#0284c7" : "#059669";
      const size = isSelected ? 32 : 24;
      return L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            cursor: pointer;
          ">📍</div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.7, -101.2],
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    planteles.forEach((plantel) => {
      if (plantel.lat == null || plantel.lng == null) return;

      bounds.extend([plantel.lat, plantel.lng]);
      const isSelected = plantel.id === selectedPlantelId;
      const marker = L.marker([plantel.lat, plantel.lng], {
        icon: createCustomIcon(isSelected),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; color: #1e293b; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: #0369a1;">${plantel.nombre ?? ""}</div>
          <div style="font-size: 11px; font-weight: 700; color: #047857; margin-top: 2px;">📍 ${plantel.municipio ?? ""}</div>
          ${plantel.direccion ? `<div style="font-size: 10px; color: #475569; margin-top: 4px;">${plantel.direccion}</div>` : ""}
          ${plantel.telefono ? `<div style="font-size: 11px; font-weight: 700; margin-top: 6px;">📞 ${plantel.telefono}</div>` : ""}
        </div>
      `);

      marker.on("click", () => onSelectPlantel(plantel));
      markersRef.current[plantel.id] = marker;
    });

    if (isInitialMount.current && planteles.length > 0) {
      map.fitBounds(bounds, { padding: [28, 28] });
      isInitialMount.current = false;
    } else if (selectedPlantelId) {
      const target = planteles.find((p) => p.id === selectedPlantelId);
      if (target?.lat != null && target.lng != null) {
        map.flyTo([target.lat, target.lng], 12, { duration: 0.8 });
        markersRef.current[target.id]?.openPopup();
      }
    }
  }, [planteles, selectedPlantelId, onSelectPlantel]);

  return (
    <div
      ref={mapContainerRef}
      className="h-[340px] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-lg"
    />
  );
}
