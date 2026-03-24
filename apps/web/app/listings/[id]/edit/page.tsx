"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { getUserListing } from "@/lib/listings/catalog";
import type { UserListing } from "@/lib/listings/user-listing.types";
import { ListingForm } from "../../ListingForm";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [row, setRow] = useState<UserListing | null | undefined>(undefined);

  useEffect(() => {
    if (!isReady) return;
    if (!user?.id) {
      router.replace("/");
      return;
    }
    if (!id) return;
    const found = getUserListing(user.id, id);
    setRow(found ?? null);
    if (!found) router.replace("/listings");
  }, [isReady, user?.id, id, router]);

  if (!isReady || row === undefined) {
    return <div className="py-12 text-center text-gray-500 text-sm">{t.common.loading}</div>;
  }
  if (!row) return null;

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-semibold text-gray-900 py-6">{t.listingFlow.editTitle}</h1>
      <ListingForm initial={row} />
    </div>
  );
}
