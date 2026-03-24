"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MasterOrdersPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.masterDashboard.orders}</h1>
      <div className="mt-6 flex gap-2 border-b border-gray-200">
        {["new", "accepted", "onTheWay", "inProgress", "completed", "cancelled"].map((tab) => (
          <button key={tab} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <EmptyState
          title={t.masterDashboard.noBookings}
          description="New booking requests will appear here."
          actionLabel={t.emptyStates.backHome}
          actionHref="/"
          icon="bookings"
        />
      </div>
    </>
  );
}
