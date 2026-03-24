"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const MapComponent = dynamic(
  () => import("./MastersMap").then((m) => m.MastersMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

export function MapPreviewSection({ masters }: { masters: MasterSummary[] }) {
  const { t } = useI18n();
  const mastersWithCoords = masters.filter((m) => {
    const area = m.serviceAreas?.[0] as { latitude?: unknown; longitude?: unknown } | undefined;
    return area?.latitude != null && area?.longitude != null;
  });
  const displayMasters = mastersWithCoords.length > 0 ? mastersWithCoords : masters;

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <SectionHeading title={t.map.title} subtitle={t.home.viewMap}>
          <Link href="/search?map=1">
            <Button variant="outline" size="sm">
              {t.map.viewMap} →
            </Button>
          </Link>
        </SectionHeading>
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <MapComponent masters={displayMasters} height="320px" interactive />
        </div>
      </Container>
    </section>
  );
}
