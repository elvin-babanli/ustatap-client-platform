"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const SearchMap = dynamic(
  () => import("./SearchMap").then((m) => m.SearchMap),
  { ssr: false }
);

const CATEGORY_OPTIONS = [
  { value: "", labelKey: "allCategories" },
  { value: "electrician", labelKey: "electrician" },
  { value: "plumber", labelKey: "plumber" },
  { value: "ac-repair", labelKey: "acRepair" },
  { value: "cleaning", labelKey: "cleaning" },
];

export function SearchPageClient({
  initialQuery,
  initialCategory,
  initialCity,
  showMap,
  masters,
}: {
  initialQuery: string;
  initialCategory: string;
  initialCity: string;
  showMap: boolean;
  masters: MasterSummary[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [showMapView, setShowMapView] = useState(showMap);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (category) p.set("categorySlug", category);
    if (city) p.set("city", city);
    if (showMapView) p.set("map", "1");
    router.push(`/search?${p.toString()}`);
  }

  const filteredMasters = verifiedOnly
    ? masters.filter((m) => m.verificationStatus === "APPROVED")
    : masters;

  return (
    <Container className="py-8">
      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-3">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.hero.searchPlaceholder}
            className="flex-1 min-w-[200px]"
          />
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.search.city}
            className="w-36"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-40"
          >
            <option value="">{t.search.allCategories}</option>
            {CATEGORY_OPTIONS.slice(1).map((o) => (
              <option key={o.value} value={o.value}>
                {(t.categories as Record<string, string>)[o.labelKey] ?? o.value}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="primary">
            {t.hero.search}
          </Button>
          <Button
            type="button"
            variant={showMapView ? "secondary" : "outline"}
            onClick={() => setShowMapView(!showMapView)}
          >
            {showMapView ? t.search.listView : t.map.viewMap}
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          {t.search.verifiedOnly}
        </label>
      </form>

      {showMapView ? (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[500px]">
          <SearchMap masters={filteredMasters} />
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            {filteredMasters.length} {t.masters.title.toLowerCase()}
          </p>
          {filteredMasters.length === 0 ? (
            <EmptyState
              title={t.masters.noMasters}
              actionLabel={t.home.browseMasters}
              actionHref="/categories"
              icon="masters"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMasters.map((m) => {
                const firstSvc = m.masterServices?.[0] as { basePrice: number; currency: string } | undefined;
                return (
                  <Link key={m.id} href={`/masters/${m.id}`}>
                    <Card className="hover:shadow-md hover:border-primary-200 transition-all h-full">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {m.avatarUrl ? (
                            <Image
                              src={m.avatarUrl}
                              alt={m.displayName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-2xl text-gray-400">👤</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {m.displayName}
                            </h3>
                            {m.verificationStatus === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                ✓ {t.masters.verified}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <span className="text-amber-500">★</span>
                            <span>{Number(m.averageRating).toFixed(1)}</span>
                            <span>({m.totalReviews} {t.masters.reviews})</span>
                          </div>
                          <p className="text-primary-600 font-medium mt-2">
                            {t.masters.from} {firstSvc?.basePrice ?? 0} {firstSvc?.currency ?? "AZN"}
                          </p>
                          <p className={m.isAvailable ? "text-emerald-600 text-xs mt-1" : "text-gray-500 text-xs mt-1"}>
                            {m.isAvailable ? t.masters.available : t.masters.unavailable}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </Container>
  );
}
