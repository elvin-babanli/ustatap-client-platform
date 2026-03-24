"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n, getName } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";
import { FavoriteStarButton } from "@/components/FavoriteStarButton";
import { isLocalMasterId, localListingIdFromMasterId } from "@/lib/listings/catalog";

type ProCardProps = {
  master: MasterSummary;
  compact?: boolean;
};

function getFirstCategory(master: MasterSummary, locale: "en" | "az" | "ru"): string {
  const svc = master.masterServices?.[0];
  if (!svc?.service) return "";
  return getName(svc.service as { nameEn?: string; nameAz?: string; nameRu?: string }, locale);
}

function profileHrefFor(master: MasterSummary): string {
  if (isLocalMasterId(master.id)) {
    return `/listings/view/${localListingIdFromMasterId(master.id)}`;
  }
  return `/masters/${master.id}`;
}

export function ProCard({ master, compact = false }: ProCardProps) {
  const { t, locale } = useI18n();
  const href = profileHrefFor(master);

  const firstSvc = master.masterServices?.[0] as { basePrice?: number; currency?: string } | undefined;
  const areas = master.serviceAreas ?? [];
  const areaLabel = areas.length > 0 ? areas.map((a) => a.city).filter(Boolean).join(", ") : "";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${compact ? "" : "max-w-sm"}`}
    >
      <Link href={href} className="block">
        <div className="relative h-40 w-full bg-gray-100">
          {master.avatarUrl ? (
            <Image src={master.avatarUrl} alt={master.displayName} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-gray-400">👤</div>
          )}
          {master.verificationStatus === "APPROVED" && (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              ✔ {t.masters.verified}
            </span>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-base font-semibold text-gray-900">{master.displayName}</p>
          </div>
          {isLocalMasterId(master.id) && (
            <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {t.listingFlow.localBadge}
            </span>
          )}
          <p className="text-xs text-gray-500">{getFirstCategory(master, locale) || "Service"}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-amber-500">★</span>
            <span>{Number(master.averageRating).toFixed(1)}</span>
            <span>
              ({master.totalReviews} {t.masters.reviews})
            </span>
          </div>
          <p className="text-sm text-gray-600">📍 {areaLabel || t.search.city}</p>
          <p className="text-sm font-semibold text-gray-900">
            {t.masters.from} {firstSvc?.basePrice ?? 0} {firstSvc?.currency ?? "AZN"}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                master.isAvailable ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"
              }`}
            >
              {master.isAvailable ? `${t.masters.available}` : t.masters.unavailable}
            </span>
            <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
              {t.masterCard.viewProfile} →
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute left-3 top-3 z-10">
        <FavoriteStarButton masterId={master.id} />
      </div>
    </div>
  );
}
