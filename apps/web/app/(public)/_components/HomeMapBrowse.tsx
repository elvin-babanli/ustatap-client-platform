"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useI18n, getName } from "@/lib/i18n";
import { ProCard } from "@/components/ProCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { MasterSummary } from "@/lib/api/masters";
import { getPublicListingsAsMasters } from "@/lib/listings/catalog";
import { clsx } from "clsx";

const MastersMap = dynamic(() => import("./MastersMap").then((m) => m.MastersMap), { ssr: false });

const CATEGORY_SLUGS = [
  "",
  "electrician",
  "plumber",
  "ac-repair",
  "cleaning",
  "renovation",
  "painting",
];

type Cat = { slug: string; nameEn?: string; nameAz?: string; nameRu?: string };

export function HomeMapBrowse({
  initialMasters,
  categories = [],
}: {
  initialMasters: MasterSummary[];
  categories?: Cat[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [serviceQ, setServiceQ] = useState("");
  const [locationQ, setLocationQ] = useState("");
  const [category, setCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");
  const [pubVersion, setPubVersion] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bump = () => setPubVersion((v) => v + 1);
    window.addEventListener("ustatap-listings-public-ch", bump);
    return () => window.removeEventListener("ustatap-listings-public-ch", bump);
  }, []);

  const publicMasters = useMemo(() => {
    void pubVersion;
    return getPublicListingsAsMasters();
  }, [pubVersion]);

  const merged = useMemo(() => [...initialMasters, ...publicMasters], [initialMasters, publicMasters]);

  const filtered = useMemo(() => {
    const sq = serviceQ.trim().toLowerCase();
    const lq = locationQ.trim().toLowerCase();
    const catRow = category ? categories.find((c) => c.slug === category) : undefined;
    const needle = category
      ? (catRow
          ? getName(catRow as { nameEn?: string; nameAz?: string; nameRu?: string }, locale)
          : category.replace(/-/g, " ")
        ).toLowerCase()
      : "";
    return merged.filter((m) => {
      if (!m || typeof m !== "object") return false;
      const display = String(m.displayName ?? "").toLowerCase();
      if (verifiedOnly && m.verificationStatus !== "APPROVED") return false;
      if (category && needle) {
        const svc = m.masterServices?.[0];
        const sn = svc?.service
          ? getName(svc.service as { nameEn?: string; nameAz?: string; nameRu?: string }, locale).toLowerCase()
          : "";
        if (!sn.includes(needle) && !display.includes(needle)) return false;
      }
      if (sq) {
        const name = display;
        const svc = m.masterServices?.[0]?.service;
        const sn = svc
          ? getName(svc as { nameEn?: string; nameAz?: string; nameRu?: string }, locale).toLowerCase()
          : "";
        if (!name.includes(sq) && !sn.includes(sq)) return false;
      }
      if (lq) {
        const areas = m.serviceAreas ?? [];
        const blob = areas.map((a) => `${a.city} ${(a as { district?: string }).district ?? ""}`).join(" ").toLowerCase();
        if (!blob.includes(lq)) return false;
      }
      return true;
    });
  }, [merged, serviceQ, locationQ, category, verifiedOnly, categories, locale]);

  const scrollCardIntoView = useCallback((id: string) => {
    const el = listRef.current?.querySelector(`[data-master-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (serviceQ.trim()) router.push(`/search?q=${encodeURIComponent(serviceQ.trim())}`);
    else router.push("/search");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-white">
      <div className="border-b border-gray-200 bg-white z-30 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2 md:items-center md:gap-3">
            <Input
              value={serviceQ}
              onChange={(e) => setServiceQ(e.target.value)}
              placeholder={t.hero.searchPlaceholder}
              className="md:flex-1"
            />
            <Input
              value={locationQ}
              onChange={(e) => setLocationQ(e.target.value)}
              placeholder={t.hero.locationPlaceholder}
              className="md:w-48"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              {t.homeBrowse.search}
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full sm:w-44">
              <option value="">{t.search.allCategories}</option>
              {CATEGORY_SLUGS.filter(Boolean).map((slug) => {
                const c = categories.find((x) => x.slug === slug);
                const label = c
                  ? getName(c as { nameEn?: string; nameAz?: string; nameRu?: string }, locale)
                  : slug;
                return (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                );
              })}
            </Select>
            <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t.search.verifiedOnly}
            </label>
            <span className="text-sm text-gray-500 ml-auto">
              {filtered.length} {t.homeBrowse.resultsCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div
          className={clsx(
            "lg:w-[55%] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-gray-200 relative",
            mobileTab === "list" ? "hidden lg:block" : "block",
            "min-h-[280px] h-[42vh] lg:h-full lg:min-h-[520px]"
          )}
        >
          <MastersMap
            masters={filtered}
            height="100%"
            interactive
            selectedId={selectedId}
            onSelectMaster={(id) => {
              setSelectedId(id);
              scrollCardIntoView(id);
              if (window.innerWidth < 1024) setMobileTab("list");
            }}
          />
        </div>

        <div
          className={clsx(
            "lg:w-[45%] flex flex-col min-h-0 min-w-0 bg-white",
            mobileTab === "map" ? "hidden lg:flex" : "flex flex-1",
            "lg:max-w-xl xl:max-w-md"
          )}
        >
          <div className="lg:hidden shrink-0 flex border-b border-gray-100">
            <button
              type="button"
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium",
                mobileTab === "map" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"
              )}
              onClick={() => setMobileTab("map")}
            >
              {t.homeBrowse.showMap}
            </button>
            <button
              type="button"
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium",
                mobileTab === "list" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"
              )}
              onClick={() => setMobileTab("list")}
            >
              {t.homeBrowse.showList}
            </button>
          </div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4"
          >
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12">{t.masters.noMasters}</p>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.id}
                  data-master-id={m.id}
                  className={clsx(
                    "rounded-xl transition-shadow",
                    selectedId === m.id ? "ring-2 ring-gray-900 ring-offset-2" : ""
                  )}
                  onClick={() => setSelectedId(m.id)}
                  role="presentation"
                >
                  <ProCard master={m} compact />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
