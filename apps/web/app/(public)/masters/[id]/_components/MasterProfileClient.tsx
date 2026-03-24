"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n, getName } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type MasterService = {
  id: string;
  basePrice: number;
  currency: string;
  service: { id: string; nameEn: string; nameAz?: string; nameRu?: string };
};

type ServiceArea = { city: string; district?: string };

type Review = {
  id: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
  customer?: { firstName?: string; lastName?: string };
};

export function MasterProfileClient({
  master,
  reviews,
}: {
  master: MasterSummary & {
    masterServices?: MasterService[];
    serviceAreas?: ServiceArea[];
  };
  reviews: Review[];
}) {
  const { t, locale } = useI18n();
  const services = master.masterServices ?? [];
  const areas = master.serviceAreas ?? [];

  return (
    <Container className="py-8">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden">
                  {master.avatarUrl ? (
                    <Image
                      src={master.avatarUrl}
                      alt={master.displayName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                      👤
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{master.displayName}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-amber-500">★</span>
                  <span className="font-medium">{Number(master.averageRating).toFixed(1)}</span>
                  <span className="text-gray-500">({master.totalReviews} {t.masters.reviews})</span>
                  {master.verificationStatus === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                      ✓ {t.masters.verified}
                    </span>
                  )}
                </div>
                <p className={master.isAvailable ? "text-emerald-600 mt-2 font-medium" : "text-gray-500 mt-2"}>
                  {master.isAvailable ? t.masters.available : t.masters.unavailable}
                </p>
                {master.experienceYears && (
                  <p className="text-gray-600 text-sm mt-1">
                    {master.experienceYears} {t.masters.experience}
                  </p>
                )}
                {areas.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {areas.map((a) => `${a.city}${a.district ? `, ${a.district}` : ""}`).join(" · ")}
                  </p>
                )}
                {master.totalReviews > 0 && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                    🛡️ {t.trust.platformProtected}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Bio */}
          {master.bio && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-2">{t.masters.services}</h2>
              <p className="text-gray-600">{master.bio}</p>
            </Card>
          )}

          {/* Price list */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">{t.masters.priceList}</h2>
            <div className="space-y-3">
              {services.map((ms) => (
                <div
                  key={ms.id}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-900">{getName(ms.service, locale)}</span>
                  <span className="font-semibold text-primary-600">
                    {ms.basePrice} {ms.currency}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">{t.review.title}</h2>
            {reviews.length === 0 ? (
              <EmptyState title={t.review.noReviews} icon="reviews" compact />
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">★ {r.rating}</span>
                      {r.customer && (
                        <span className="text-sm text-gray-600">
                          {r.customer.firstName} {r.customer.lastName}
                        </span>
                      )}
                    </div>
                    {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sticky booking card */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">{t.masters.bookNow}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {t.masters.from} {services[0]?.basePrice ?? 0} {services[0]?.currency ?? "AZN"}
              </p>
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                🔒 {t.trust.securePayment}
              </p>
              <Link href={`/booking?masterId=${master.id}`}>
                <Button variant="primary" size="lg" className="w-full">
                  {t.masters.bookNow}
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
