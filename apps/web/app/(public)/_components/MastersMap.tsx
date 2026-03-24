"use client";

import { useMemo, useState, memo, useEffect, useLayoutEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MasterSummary } from "@/lib/api/masters";

// Fix Leaflet default icon in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const OSM_TILE =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/** Deterministic offset from id — stable across renders, no Math.random() */
function getOffsetFromId(id: string, seed: number): number {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ((hash * seed) % 100) / 100 - 0.5;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type MarkerItem = { master: MasterSummary; position: [number, number] };

type LeafletMapViewProps = {
  markers: MarkerItem[];
  height: string;
  interactive: boolean;
  selectedId: string | null;
  onSelectMaster?: (id: string) => void;
};

/**
 * Imperative Leaflet (no react-leaflet MapContainer). React 19 Strict Mode
 * double-invokes ref callbacks before MapContainer's internal `context` state
 * updates, so `new L.Map(sameNode)` can run twice — "already initialized".
 * useLayoutEffect runs mount → cleanup → remount synchronously; map.remove()
 * always runs before a second L.map on the same container.
 */
const MastersMapLeafletView = memo(function MastersMapLeafletView({
  markers,
  height,
  interactive,
  selectedId,
  onSelectMaster,
}: LeafletMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
    });
    L.tileLayer(OSM_TILE, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.setView([40.4093, 49.8671], 12);

    mapRef.current = map;
    const group = L.layerGroup().addTo(map);
    markersLayerRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    for (const { master, position } of markers) {
      const marker = L.marker(position);
      const dimmed = Boolean(selectedId && master.id !== selectedId);
      marker.setOpacity(dimmed ? 0.55 : 1);
      marker.on("click", () => {
        onSelectMaster?.(master.id);
      });
      const name = escapeHtml(String(master.displayName ?? ""));
      const rating = Number(master.averageRating ?? 0).toFixed(1);
      const reviews = master.totalReviews ?? 0;
      marker.bindPopup(
        `<a href="/masters/${master.id}" style="font-weight:600;color:#2563eb;text-decoration:none">${name}</a>` +
          `<p style="margin:8px 0 0;font-size:14px;color:#4b5563">⭐ ${rating} (${reviews} reviews)</p>`,
      );
      marker.addTo(group);
    }

    return () => {
      group.clearLayers();
    };
  }, [markers, selectedId, onSelectMaster]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full isolate [contain:layout] z-0"
      data-masters-map-root
    />
  );
});

export function MastersMap({
  masters,
  height = "400px",
  interactive = true,
  selectedId = null,
  onSelectMaster,
}: {
  masters: MasterSummary[];
  height?: string;
  interactive?: boolean;
  selectedId?: string | null;
  onSelectMaster?: (id: string) => void;
}) {
  /** Defer showing the map subtree until after commit (avoids SSR/hydration noise). */
  const [mapActive, setMapActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) setMapActive(true);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      setMapActive(false);
    };
  }, []);

  const markers = useMemo(() => {
    const result: MarkerItem[] = masters.map((m) => {
      const area = m.serviceAreas?.[0] as { latitude?: number; longitude?: number } | undefined;
      const offsetLat = getOffsetFromId(m.id, 17) * 0.05;
      const offsetLng = getOffsetFromId(m.id, 31) * 0.05;
      const lat = area?.latitude != null ? Number(area.latitude) : 40.4093 + offsetLat;
      const lng = area?.longitude != null ? Number(area.longitude) : 49.8671 + offsetLng;
      return { master: m, position: [lat, lng] as [number, number] };
    });
    if (result.length === 0 && masters.length > 0) {
      result.push({ master: masters[0] as MasterSummary, position: [40.4093, 49.8671] });
    }
    return result;
  }, [masters]);

  if (!mapActive) {
    return <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />;
  }

  return (
    <MastersMapLeafletView
      markers={markers}
      height={height}
      interactive={interactive}
      selectedId={selectedId ?? null}
      onSelectMaster={onSelectMaster}
    />
  );
}
