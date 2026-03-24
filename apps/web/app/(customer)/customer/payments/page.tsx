"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomerPaymentsPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.customerDashboard.payments}</h1>
      <div className="mt-8">
        <EmptyState
          title="No payment history"
          description="Your payment history will appear here after bookings."
          actionLabel={t.emptyStates.backHome}
          actionHref="/"
        />
      </div>
    </>
  );
}
