"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomerFavoritesPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.customerDashboard.favorites}</h1>
      <div className="mt-8">
        <EmptyState
          title={t.emptyStates.noSavedPros}
          description="Save pros you like to book them later."
          actionLabel={t.emptyStates.exploreServices}
          actionHref="/search"
          icon="masters"
        />
      </div>
    </>
  );
}
