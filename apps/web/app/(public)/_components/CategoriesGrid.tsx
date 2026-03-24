"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { getName } from "@/lib/i18n";

const categoryIcons: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  "ac-repair": "❄️",
  cleaning: "🧹",
  "home-services": "🏠",
  repair: "🔩",
};

export function CategoriesGrid({
  categories,
}: {
  categories: { id: string; slug: string; nameEn: string; nameAz?: string; nameRu?: string }[];
}) {
  const { t, locale } = useI18n();

  const categoryLabel: Record<string, string> = {
    electrician: t.categories.electrician,
    plumber: t.categories.plumber,
    "ac-repair": t.categories.acRepair,
    cleaning: t.categories.cleaning,
    "home-services": t.categories.homeServices,
    repair: t.categories.repair,
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.categories.title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <span className="text-4xl mb-2">
              {categoryIcons[cat.slug] ?? "📌"}
            </span>
            <span className="font-medium text-gray-900 group-hover:text-primary-600">
              {categoryLabel[cat.slug] ?? getName(cat, locale)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
