"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { loadUserListings, upsertUserListing } from "@/lib/listings/catalog";
import type { UserListing } from "@/lib/listings/user-listing.types";

export default function MyListingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

  const rows = useMemo(() => {
    void version;
    return user?.id ? loadUserListings(user.id) : [];
  }, [user?.id, version]);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener("ustatap-listings-public-ch", bump);
    return () => window.removeEventListener("ustatap-listings-public-ch", bump);
  }, []);

  function setStatus(row: UserListing, status: UserListing["status"]) {
    if (!user?.id) return;
    upsertUserListing({ ...row, status, updatedAt: new Date().toISOString() });
    setVersion((v) => v + 1);
  }

  if (!user?.id) return null;

  return (
    <div className="py-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t.listingFlow.myTitle}</h1>
        <Link href="/listings/create">
          <Button variant="primary">{t.listingFlow.createTitle}</Button>
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm">{t.listingFlow.emptyListings}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-medium text-gray-900">{row.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {row.status === "published" ? t.listingFlow.published : t.listingFlow.draft} · {row.categorySlug}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/listings/${row.id}/edit`}>
                  <Button variant="outline" size="sm">
                    {t.listingFlow.edit}
                  </Button>
                </Link>
                {row.status === "draft" ? (
                  <Button variant="primary" size="sm" onClick={() => setStatus(row, "published")}>
                    {t.listingFlow.publish}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setStatus(row, "draft")}>
                    {t.listingFlow.unpublish}
                  </Button>
                )}
                <Link href={`/listings/view/${row.id}`}>
                  <Button variant="ghost" size="sm">
                    {t.masterCard.viewProfile}
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
