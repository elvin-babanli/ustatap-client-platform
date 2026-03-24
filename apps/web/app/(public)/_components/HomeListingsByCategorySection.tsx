"use client";

import Link from "next/link";
import type { MasterSummary } from "@/lib/api/masters";
import { useI18n } from "@/lib/i18n";
import { ProCard } from "@/components/ProCard";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HomeListingsByCategorySection({
  byCategory,
}: {
  byCategory: { slug: string; labelKey: string; items: MasterSummary[] }[];
}) {
  const { t } = useI18n();
  const categories = t.categories as Record<string, string>;
  const hasAny = byCategory.some((b) => b.items.length > 0);
  if (!hasAny) return null;

  return (
    <section className="py-14 md:py-16 bg-white border-t border-gray-100">
      <Container>
        <SectionHeading
          title={t.home.listingsPreviewTitle}
          subtitle={t.home.listingsPreviewSubtitle}
        />
        <div className="space-y-14">
          {byCategory.map((block) => {
            if (block.items.length === 0) return null;
            const label = categories[block.labelKey] ?? block.slug;
            return (
              <div key={block.slug}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                  <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                  <Link
                    href={`/search?categorySlug=${encodeURIComponent(block.slug)}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    {t.home.browseMasters} →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {block.items.slice(0, 4).map((m) => (
                    <ProCard key={m.id} master={m} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
