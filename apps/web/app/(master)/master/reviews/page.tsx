"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MasterReviewsPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.masterDashboard.reviews}</h1>
      <div className="mt-8">
        <EmptyState
          title={t.emptyStates.noReviewsYet}
          description="Reviews from customers will appear here."
          actionLabel={t.emptyStates.backHome}
          actionHref="/"
          icon="reviews"
        />
      </div>
    </>
  );
}
