"use client";

import { useI18n } from "@/lib/i18n";

export default function MasterCalendarPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.masterDashboard.calendar}</h1>
      <p className="mt-4 text-gray-600">Availability calendar ({t.common.comingSoon})</p>
    </>
  );
}
