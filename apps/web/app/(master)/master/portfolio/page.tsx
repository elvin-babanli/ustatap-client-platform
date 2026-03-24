"use client";

import { useI18n } from "@/lib/i18n";

export default function MasterPortfolioPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.masterDashboard.portfolio}</h1>
      <p className="mt-4 text-gray-600">Work photos and before/after ({t.common.comingSoon})</p>
    </>
  );
}
