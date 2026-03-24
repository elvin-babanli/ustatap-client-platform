"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomerReviewsPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.review.title}</h1>
      <div className="mt-8">
        <EmptyState
          title={t.emptyStates.noReviewsYet}
          description="Leave reviews after completed bookings."
          actionLabel={t.customerDashboard.myBookings}
          actionHref="/customer/bookings"
          icon="reviews"
        />
      </div>
    </>
  );
}
