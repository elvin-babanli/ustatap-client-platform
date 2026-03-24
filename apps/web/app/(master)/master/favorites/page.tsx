"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MasterFavoritesPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">{t.listings.favoritesProTitle}</h1>
      <p className="text-gray-600 text-sm mt-2 max-w-xl">{t.listings.favoritesProBody}</p>
      <div className="mt-8">
        <EmptyState
          title={t.emptyStates.noSavedPros}
          description={t.listings.favoritesProBody}
          actionLabel={t.emptyStates.exploreServices}
          actionHref="/search"
          icon="masters"
        />
      </div>
    </>
  );
}
