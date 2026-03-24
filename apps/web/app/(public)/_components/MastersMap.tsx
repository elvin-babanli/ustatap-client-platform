"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { MasterSummary } from "@/lib/api/masters";

// Fix Leaflet default icon in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function MastersMap({
  masters,
  height = "400px",
  interactive = true,
}: {
  masters: MasterSummary[];
  height?: string;
  interactive?: boolean;
}) {
  const markers = useMemo(() => {
    const result = masters.map((m) => {
      const area = m.serviceAreas?.[0] as { latitude?: number; longitude?: number } | undefined;
      const lat = area?.latitude != null ? Number(area.latitude) : 40.4093 + (Math.random() - 0.5) * 0.05;
      const lng = area?.longitude != null ? Number(area.longitude) : 49.8671 + (Math.random() - 0.5) * 0.05;
      return { master: m, position: [lat, lng] as [number, number] };
    });
    if (result.length === 0 && masters.length > 0) {
      result.push({ master: masters[0] as MasterSummary, position: [40.4093, 49.8671] });
    }
    return result;
  }, [masters]);

  return (
    <div style={{ height }} className="w-full">
      <MapContainer
        center={[40.4093, 49.8671]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ master, position }) => (
          <Marker key={master.id} position={position}>
            <Popup>
              <Link
                href={`/masters/${master.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {master.displayName}
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                ⭐ {Number(master.averageRating).toFixed(1)} ({master.totalReviews} reviews)
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
