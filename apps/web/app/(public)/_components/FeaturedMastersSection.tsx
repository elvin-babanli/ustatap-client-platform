"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export function FeaturedMastersSection({ masters }: { masters: MasterSummary[] }) {
  const { t } = useI18n();

  if (masters.length === 0) return null;

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
          {masters.slice(0, 6).map((m) => {
            const firstSvc = m.masterServices?.[0] as { basePrice: number; currency: string } | undefined;
            return (
              <Link
                key={m.id}
                href={`/masters/${m.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {m.avatarUrl ? (
                      <Image
                        src={m.avatarUrl}
                        alt={m.displayName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl text-gray-400">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {m.displayName}
                      </h3>
                      {m.verificationStatus === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          ✓ {t.masters.verified}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span className="text-amber-500">★</span>
                      <span>{Number(m.averageRating).toFixed(1)}</span>
                      <span>({m.totalReviews} {t.masters.reviews})</span>
                    </div>
                    <p className="text-primary-600 font-medium mt-2">
                      {t.masters.from} {firstSvc?.basePrice ?? 0} {firstSvc?.currency ?? "AZN"}
                    </p>
                    <p className={m.isAvailable ? "text-emerald-600 text-xs mt-1" : "text-gray-500 text-xs mt-1"}>
                      {m.isAvailable ? t.masters.available : t.masters.unavailable}
                    </p>
                    {m.totalReviews > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">{t.trust.reviewedByCustomers}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
