"use client";

import Link from "next/link";
import { useI18n, getName } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const categoryIcons: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  "ac-repair": "❄️",
  renovation: "🏗️",
  painting: "🎨",
  furniture: "🪑",
  cleaning: "🧹",
  "camera-security": "📷",
  "water-filter": "💧",
  other: "📌",
  "home-services": "🏠",
  repair: "🔩",
};

const categoryLabelKeys: Record<string, string> = {
  electrician: "electrician",
  plumber: "plumber",
  "ac-repair": "acRepair",
  renovation: "renovation",
  painting: "painting",
  furniture: "furniture",
  cleaning: "cleaning",
  "camera-security": "cameraSecurity",
  "water-filter": "waterFilter",
  other: "other",
  "home-services": "homeServices",
  repair: "repair",
};

const DEFAULT_CATEGORIES = [
  { slug: "electrician", id: "electrician" },
  { slug: "plumber", id: "plumber" },
  { slug: "ac-repair", id: "ac-repair" },
  { slug: "renovation", id: "renovation" },
  { slug: "painting", id: "painting" },
  { slug: "furniture", id: "furniture" },
  { slug: "cleaning", id: "cleaning" },
  { slug: "camera-security", id: "camera-security" },
  { slug: "water-filter", id: "water-filter" },
  { slug: "other", id: "other" },
];

export function HomeCategoriesSection({
  categories = [],
}: {
  categories?: { id: string; slug: string; nameEn?: string; nameAz?: string; nameRu?: string }[];
}) {
  const { t, locale } = useI18n();
  const safeCategories = Array.isArray(categories) ? categories : [];
  const apiSlugs = new Set(safeCategories.map((c) => c?.slug).filter(Boolean));
  const displayCategories =
    safeCategories.length >= 6
      ? safeCategories
      : [
          ...safeCategories,
          ...DEFAULT_CATEGORIES.filter((c) => !apiSlugs.has(c.slug)).map((c) => ({
            id: c.id,
            slug: c.slug,
            nameEn: (t.categories as Record<string, string>)[categoryLabelKeys[c.slug] ?? c.slug] ?? c.slug,
          })),
        ];

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <SectionHeading
          title={t.home.popularCategories ?? t.categories.title}
          subtitle={t.home.browseCategories}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayCategories.map((cat) => {
            const key = categoryLabelKeys[cat.slug] ?? cat.slug;
            const label = (t.categories as Record<string, string>)[key] ?? getName(cat, locale) ?? cat.slug;
            const href = safeCategories.some((c) => c?.slug === cat.slug)
              ? `/categories/${cat.slug}`
              : `/search?q=${encodeURIComponent(label)}`;
            return (
              <Link
                key={cat.id}
                href={href}
                className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <span className="text-4xl mb-2">
                  {categoryIcons[cat.slug] ?? "📌"}
                </span>
                <span className="font-medium text-gray-900 group-hover:text-primary-600 text-center text-sm">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
