"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import type { MasterSummary } from "@/lib/api/masters";

function MasterCard({ master }: { master: MasterSummary }) {
  const { t } = useI18n();
  const firstService = master.masterServices?.[0] as
    | { basePrice: number; currency: string; service: { nameEn: string; nameAz?: string; nameRu?: string } }
    | undefined;
  const price = firstService?.basePrice ?? 0;
  const currency = firstService?.currency ?? "AZN";

  return (
    <Link
      href={`/masters/${master.id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all"
    >
      <div className="aspect-[4/3] bg-gray-100 relative">
        {master.avatarUrl ? (
          <Image
            src={master.avatarUrl}
            alt={master.displayName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
            👤
          </div>
        )}
        {master.verificationStatus === "APPROVED" && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            {t.masters.verified}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{master.displayName}</h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <span>⭐ {Number(master.averageRating).toFixed(1)}</span>
          <span>({master.totalReviews} {t.masters.reviews})</span>
        </div>
        {master.experienceYears && (
          <p className="text-sm text-gray-500 mt-1">
            {master.experienceYears} {t.masters.experience}
          </p>
        )}
        <p className="mt-2 font-medium text-primary-600">
          {t.masters.from} {price} {currency}
        </p>
      </div>
    </Link>
  );
}

export function TopMastersSection({ masters }: { masters: MasterSummary[] }) {
  const { t } = useI18n();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.masters.title}</h2>
        <Link
          href="/categories?view=masters"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          {t.masters.viewAll} →
        </Link>
      </div>
      {masters.length === 0 ? (
        <p className="text-gray-500 py-8">{t.masters.noMasters}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {masters.map((m) => (
            <MasterCard key={m.id} master={m} />
          ))}
        </div>
      )}
    </div>
  );
}
