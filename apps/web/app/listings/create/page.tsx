"use client";

import { useI18n } from "@/lib/i18n";
import { ListingForm } from "../ListingForm";

export default function CreateListingPage() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-semibold text-gray-900 py-6">{t.listingFlow.createTitle}</h1>
      <ListingForm />
    </div>
  );
}
