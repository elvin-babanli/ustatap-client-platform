"use client";

import Link from "next/link";
import { useI18n, getName } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const categoryIcons: Record<string, string> = {
  electrician: "⚡",
  plumber: "🔧",
  "ac-repair": "❄️",
  cleaning: "🧹",
  "home-services": "🏠",
  repair: "🔩",
};

const categoryLabelKeys: Record<string, string> = {
  electrician: "electrician",
  plumber: "plumber",
  "ac-repair": "acRepair",
  cleaning: "cleaning",
  "home-services": "homeServices",
  repair: "repair",
};

export function HomeCategoriesSection({
  categories,
}: {
  categories: { id: string; slug: string; nameEn: string; nameAz?: string; nameRu?: string }[];
}) {
  const { t, locale } = useI18n();

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <SectionHeading
          title={t.categories.title}
          subtitle={t.home.browseCategories}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const key = categoryLabelKeys[cat.slug] ?? cat.slug;
            const label = (t.categories as Record<string, string>)[key] ?? getName(cat, locale);
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <span className="text-4xl mb-2">
                  {categoryIcons[cat.slug] ?? "📌"}
                </span>
                <span className="font-medium text-gray-900 group-hover:text-primary-600 text-center">
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
