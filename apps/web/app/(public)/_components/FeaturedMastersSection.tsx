"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { ProCard } from "@/components/ProCard";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export function FeaturedMastersSection({ masters = [] }: { masters?: MasterSummary[] }) {
  const { t } = useI18n();
  const safeMasters = Array.isArray(masters) ? masters : [];

  if (safeMasters.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <Container>
        <SectionHeading
          title={t.masters.title}
          subtitle={t.cta.subtitle}
        >
          <Link href="/search">
            <Button variant="outline" size="sm">
              {t.masters.viewAll}
            </Button>
          </Link>
        </SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMasters.slice(0, 6).map((m) => (
            <ProCard key={m.id} master={m} compact />
          ))}
        </div>
      </Container>
    </section>
  );
}
