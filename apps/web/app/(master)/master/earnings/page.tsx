"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MasterEarningsPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.masterDashboard.earnings}</h1>
      <div className="mt-8">
        <EmptyState
          title="Earnings"
          description="Your earnings and payout history will appear here."
          actionLabel={t.emptyStates.backHome}
          actionHref="/"
        />
      </div>
    </>
  );
}
