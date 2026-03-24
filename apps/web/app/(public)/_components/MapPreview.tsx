"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import type { MasterSummary } from "@/lib/api/masters";

const MapComponent = dynamic(
  () => import("./MastersMap").then((m) => m.MastersMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

export function MapPreview({ masters }: { masters: MasterSummary[] }) {
  const { t } = useI18n();
  const mastersWithCoords = masters.filter((m) => {
    const area = m.serviceAreas?.[0] as { latitude?: unknown; longitude?: unknown } | undefined;
    return area?.latitude != null && area?.longitude != null;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.map.title}</h2>
        <Link
          href="/search?map=1"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          {t.map.viewMap} →
        </Link>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <MapComponent
          masters={mastersWithCoords.length > 0 ? mastersWithCoords : masters}
          height="320px"
          interactive
        />
      </div>
    </div>
  );
}
