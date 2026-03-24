"use client";

import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomerBookingsPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.customerDashboard.myBookings}</h1>
          <div className="mt-6 flex gap-2 border-b border-gray-200">
            {["upcoming", "inProgress", "completed", "cancelled"].map((tab) => (
              <button key={tab} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-primary-500">
                {tab === "upcoming" ? "Upcoming" : tab === "inProgress" ? t.customerDashboard.inProgress : tab === "completed" ? t.customerDashboard.completed : t.customerDashboard.cancelled}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <EmptyState
              title={t.customerDashboard.noBookings}
              description={t.emptyStates.changeFilters}
              actionLabel={t.emptyStates.exploreServices}
              actionHref="/search"
              icon="bookings"
            />
          </div>
    </>
  );
}
