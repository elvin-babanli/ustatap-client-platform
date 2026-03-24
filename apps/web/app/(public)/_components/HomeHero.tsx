"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

type HomeHeroProps = {
  previewMasters?: MasterSummary[];
};

export function HomeHero({ previewMasters = [] }: HomeHeroProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [showLocationHint, setShowLocationHint] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    params.set("sortBy", "nearest");
    router.push(`/search?${params.toString()}`);
  }

  function handleUseLocationClick() {
    setShowLocationHint(true);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.04),transparent_55%)]" />
      <Container>
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl md:text-[2.75rem] font-semibold text-gray-900 tracking-tight leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-gray-600 mt-4 text-lg max-w-xl">{t.hero.subtitle}</p>

            <form onSubmit={handleSearch} className="mt-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t.hero.locationPlaceholder}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleUseLocationClick}
                    className="text-left text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t.location.useCurrent}
                  </button>
                  <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto shrink-0">
                    {t.hero.search}
                  </Button>
                </div>
                {showLocationHint && (
                  <p className="mt-2 text-xs text-gray-500">{t.location.autoSoon}</p>
                )}
              </div>
            </form>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href={`/search?sortBy=nearest`} className="inline-flex">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {t.entry?.browseAsGuest ?? "Browse as guest"}
                </Button>
              </Link>
              <Link href="/register" className="inline-flex">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-300">
                  {t.nav.signUp}
                </Button>
              </Link>
              <Link href="/login" className="inline-flex sm:ml-1">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto text-gray-700">
                  {t.nav.login}
                </Button>
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4 max-w-md">{t.entry?.createAccountToBook}</p>
          </div>

          <div className="relative hidden lg:block">
            <div className="space-y-4">
              {previewMasters.slice(0, 3).map((m, idx) => {
                const top = idx * 16;
                const firstSvc = m.masterServices?.[0] as
                  | { basePrice?: number; currency?: string; service?: { nameEn?: string } }
                  | undefined;
                return (
                  <div
                    key={m.id}
                    className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    style={{ transform: `translateY(${top}px)` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{m.displayName}</p>
                      {m.verificationStatus === "APPROVED" && (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{firstSvc?.service?.nameEn ?? "Service"}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      ★ {Number(m.averageRating).toFixed(1)} · {m.totalReviews}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {t.masters.from} {firstSvc?.basePrice ?? 0} {firstSvc?.currency ?? "AZN"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
