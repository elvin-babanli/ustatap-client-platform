"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { findPublishedListingById, userListingToMasterSummary } from "@/lib/listings/catalog";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FavoriteStarButton } from "@/components/FavoriteStarButton";

export default function PublicListingViewPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const listing = id ? findPublishedListingById(id) : null;

  if (!listing) {
    return (
      <Container className="py-16">
        <p className="text-gray-600">{t.listingFlow.notFound}</p>
        <Link href="/" className="mt-4 inline-block text-primary-600 text-sm font-medium">
          ← {t.emptyStates.backHome}
        </Link>
      </Container>
    );
  }

  const master = userListingToMasterSummary(listing);

  return (
    <Container className="py-8 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.listingFlow.localBadge}</span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{listing.title}</h1>
          <p className="text-gray-600 mt-2 whitespace-pre-wrap">{listing.description}</p>
          <ul className="mt-4 text-sm text-gray-600 space-y-1">
            <li>
              {t.listingFlow.fieldAreas}: {listing.serviceAreas}
            </li>
            <li>
              {t.listingFlow.fieldPrice}: {listing.price} {listing.currency}
            </li>
            <li>
              {t.listingFlow.fieldExperience}: {listing.experienceYears}
            </li>
          </ul>
        </div>
        <FavoriteStarButton masterId={master.id} />
      </div>
      <div className="mt-8">
        <Link href="/">
          <Button variant="outline">{t.emptyStates.backHome}</Button>
        </Link>
      </div>
    </Container>
  );
}
