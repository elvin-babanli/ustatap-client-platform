"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n, getName } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import type { Category } from "@/lib/api/categories";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const categoryIcons: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  "ac-repair": "❄️",
  cleaning: "🧹",
  "home-services": "🏠",
  repair: "🔩",
};

export function CategoriesPageClient({
  categories,
  masters,
}: {
  categories: Category[];
  masters: MasterSummary[] | null;
}) {
  const { t, locale } = useI18n();

  if (masters) {
    return (
      <Container className="py-8">
        <SectionHeading title={t.masters.title} subtitle={t.home.browseMasters} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {masters.map((m) => {
            const firstSvc = m.masterServices?.[0] as { basePrice: number; currency: string } | undefined;
            return (
              <Link key={m.id} href={`/masters/${m.id}`}>
                <Card className="hover:shadow-md hover:border-primary-200 transition-all h-full">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {m.avatarUrl ? (
                        <Image
                          src={m.avatarUrl}
                          alt=""
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {m.displayName}
                        </h3>
                        {m.verificationStatus === "APPROVED" && (
                          <Badge variant="success">{t.masters.verified}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        ★ {Number(m.averageRating).toFixed(1)} · {m.totalReviews} {t.masters.reviews}
                      </div>
                      <p className="text-primary-600 font-medium mt-2">
                        {t.masters.from} {firstSvc?.basePrice ?? 0} {firstSvc?.currency ?? "AZN"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <SectionHeading title={t.categories.title} subtitle={t.home.browseCategories} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const desc = (locale === "az" && cat.descriptionAz) || (locale === "ru" && cat.descriptionRu) || cat.descriptionEn;
          return (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Card className="flex flex-col items-center text-center hover:shadow-md hover:border-primary-200 transition-all h-full">
                <span className="text-4xl mb-3">
                  {categoryIcons[cat.slug] ?? "📌"}
                </span>
                <h3 className="font-semibold text-gray-900">{getName(cat, locale)}</h3>
                {desc && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{desc}</p>
                )}
                <span className="mt-4 text-primary-600 font-medium text-sm">
                  {t.home.browseMasters} →
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <Link href="/categories?view=masters">
          <Button variant="outline">{t.masters.viewAll} →</Button>
        </Link>
      </div>
    </Container>
  );
}
