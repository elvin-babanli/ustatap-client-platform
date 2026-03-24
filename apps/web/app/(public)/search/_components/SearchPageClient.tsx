"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProCard } from "@/components/ProCard";
import dynamic from "next/dynamic";
import { useI18n, getName } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublicListingsAsMasters } from "@/lib/listings/catalog";

const SearchMap = dynamic(() => import("./SearchMap").then((m) => m.SearchMap), { ssr: false });

const CATEGORY_OPTIONS = [
  { value: "", labelKey: "allCategories" },
  { value: "electrician", labelKey: "electrician" },
  { value: "plumber", labelKey: "plumber" },
  { value: "ac-repair", labelKey: "acRepair" },
  { value: "cleaning", labelKey: "cleaning" },
];

const SORT_OPTIONS: { value: string; tf: "filters" | "search"; key: string }[] = [
  { value: "nearest", tf: "filters", key: "sortNearest" },
  { value: "ratingDesc", tf: "filters", key: "sortRatingHigh" },
  { value: "priceAsc", tf: "filters", key: "sortPriceLow" },
  { value: "createdAt", tf: "search", key: "newest" },
];

export function SearchPageClient({
  initialQuery,
  initialCategory,
  initialCity,
  showMap,
  initialVerifiedOnly,
  initialPriceMin,
  initialPriceMax,
  initialMinRating,
  initialSortBy,
  initialAvailabilityOnly = true,
  masters,
}: {
  initialQuery: string;
  initialCategory: string;
  initialCity: string;
  showMap: boolean;
  initialVerifiedOnly?: boolean;
  initialPriceMin?: string;
  initialPriceMax?: string;
  initialMinRating?: string;
  initialSortBy?: string;
  initialAvailabilityOnly?: boolean;
  masters: MasterSummary[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState("");
  const [showMapView, setShowMapView] = useState(showMap);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly ?? false);
  const [priceMin, setPriceMin] = useState(initialPriceMin ?? "");
  const [priceMax, setPriceMax] = useState(initialPriceMax ?? "");
  const [minRating, setMinRating] = useState(initialMinRating ?? "");
  const [sortBy, setSortBy] = useState(initialSortBy ?? "nearest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(initialAvailabilityOnly ?? true);
  const [pubVersion, setPubVersion] = useState(0);

  useEffect(() => {
    const bump = () => setPubVersion((v) => v + 1);
    window.addEventListener("ustatap-listings-public-ch", bump);
    return () => window.removeEventListener("ustatap-listings-public-ch", bump);
  }, []);

  const mergedSource = useMemo(() => {
    void pubVersion;
    return [...masters, ...getPublicListingsAsMasters()];
  }, [masters, pubVersion]);

  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
    setCity(initialCity);
    setSortBy(initialSortBy ?? "nearest");
    setAvailabilityOnly(initialAvailabilityOnly ?? true);
    setVerifiedOnly(initialVerifiedOnly ?? false);
    setPriceMin(initialPriceMin ?? "");
    setPriceMax(initialPriceMax ?? "");
    setMinRating(initialMinRating ?? "");
    setShowMapView(showMap);
  }, [
    initialQuery,
    initialCategory,
    initialCity,
    initialSortBy,
    initialAvailabilityOnly,
    initialVerifiedOnly,
    initialPriceMin,
    initialPriceMax,
    initialMinRating,
    showMap,
  ]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (category) p.set("categorySlug", category);
    if (city) p.set("city", city);
    if (showMapView) p.set("map", "1");
    if (verifiedOnly) p.set("verifiedOnly", "1");
    if (priceMin) p.set("priceMin", priceMin);
    if (priceMax) p.set("priceMax", priceMax);
    if (minRating) p.set("minRating", minRating);
    if (sortBy) p.set("sortBy", sortBy);
    if (!availabilityOnly) p.set("availableOnly", "0");
    router.push(`/search?${p.toString()}`);
  }

  const verifiedFiltered = useMemo(
    () =>
      verifiedOnly
        ? mergedSource.filter((m) => m.verificationStatus === "APPROVED")
        : mergedSource,
    [mergedSource, verifiedOnly]
  );

  const textFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return verifiedFiltered;
    return verifiedFiltered.filter((m) => {
      if (m.displayName.toLowerCase().includes(q)) return true;
      const svc = m.masterServices?.[0]?.service;
      if (!svc) return false;
      const name = getName(svc as { nameEn?: string; nameAz?: string; nameRu?: string }, locale);
      return name.toLowerCase().includes(q);
    });
  }, [verifiedFiltered, query, locale]);

  const availabilityFiltered = useMemo(
    () => (availabilityOnly ? textFiltered.filter((m) => m.isAvailable) : textFiltered),
    [textFiltered, availabilityOnly]
  );

  const displayMasters = availabilityFiltered;

  return (
    <Container className="py-6 md:py-8">
      <form
        onSubmit={handleSearch}
        className="sticky top-14 md:top-16 z-20 space-y-4 mb-6 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.hero.searchPlaceholder}
            className="sm:flex-1 sm:min-w-[180px]"
          />
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.search.city}
            className="sm:w-40"
          />
          <Input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder={t.search.district}
            disabled
            title={t.common.comingSoon}
            className="sm:w-36 opacity-60 cursor-not-allowed"
          />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-44">
            <option value="">{t.search.allCategories}</option>
            {CATEGORY_OPTIONS.slice(1).map((o) => (
              <option key={o.value} value={o.value}>
                {(t.categories as Record<string, string>)[o.labelKey] ?? o.value}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary">
              {t.hero.search}
            </Button>
            <Button type="button" variant={showMapView ? "secondary" : "outline"} onClick={() => setShowMapView(!showMapView)}>
              {showMapView ? t.search.listView : t.map.viewMap}
            </Button>
            <Button type="button" variant="outline" className="md:hidden" onClick={() => setMobileFiltersOpen(true)}>
              {t.search.filters}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">{t.search.resultSortNote}</p>
        <div className="hidden md:flex flex-wrap gap-4 items-end">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t.search.verifiedOnly}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => setAvailabilityOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t.searchFilters.availability}
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Min rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Any</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
              <option value="5">5 only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">{t.search.sortBy}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm min-w-[10rem]"
            >
              {SORT_OPTIONS.map((o) => {
                const dict = o.tf === "search" ? t.search : t.searchFilters;
                const label = (dict as Record<string, string>)[o.key];
                return (
                  <option key={o.value} value={o.value}>
                    {label ?? o.value}
                  </option>
                );
              })}
            </select>
          </div>
          <span className="text-xs text-gray-400 self-end py-1.5 max-w-[11rem] leading-snug">
            {t.searchFilters.sortNameSoon}
          </span>
        </div>
      </form>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="mx-auto mt-20 max-w-md rounded-xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-gray-900 mb-3">{t.search.filters}</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t.search.verifiedOnly}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={availabilityOnly}
                  onChange={(e) => setAvailabilityOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t.searchFilters.availability}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-1/2 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-1/2 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <p className="text-xs text-gray-400">{t.searchFilters.sortNameSoon}</p>
            </div>
            <Button className="w-full mt-4" onClick={() => setMobileFiltersOpen(false)}>
              {t.common.next}
            </Button>
          </div>
        </div>
      )}

      {showMapView ? (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[min(500px,70vh)]">
          <SearchMap masters={displayMasters} />
        </div>
      ) : (
        <>
          <p className="text-gray-800 mb-4 font-medium">
            {displayMasters.length} {t.masters.title.toLowerCase()} · {t.searchFilters.sortNearestHint}
          </p>
          {displayMasters.length === 0 ? (
            <EmptyState
              title={t.masters.noMasters}
              description={t.emptyStates.changeFilters}
              actionLabel={t.home.browseMasters}
              actionHref="/categories"
              icon="masters"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMasters.map((m) => (
                <ProCard key={m.id} master={m} compact />
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
}
