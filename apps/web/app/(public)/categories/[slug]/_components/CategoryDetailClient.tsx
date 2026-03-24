"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import type { Category } from "@/lib/api/categories";

export function CategoryDetailClient({
  category,
  masters,
}: {
  category: Category;
  masters: MasterSummary[];
}) {
  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/categories" className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block">
        ← {t.common.back}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.nameEn}</h1>
      {masters.length === 0 ? (
        <p className="text-gray-500 py-8">{t.masters.noMasters}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {masters.map((m) => {
            const firstSvc = m.masterServices?.[0] as { basePrice: number; currency: string } | undefined;
            return (
              <Link
                key={m.id}
                href={`/masters/${m.id}`}
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-video bg-gray-100" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{m.displayName}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    ⭐ {Number(m.averageRating).toFixed(1)} · {m.totalReviews} {t.masters.reviews}
                  </div>
                  <p className="text-primary-600 font-medium mt-2">
                    {t.masters.from} {firstSvc?.basePrice ?? 0} {firstSvc?.currency ?? "AZN"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
