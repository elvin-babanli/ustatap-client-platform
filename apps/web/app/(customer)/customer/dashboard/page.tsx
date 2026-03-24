"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCustomerDashboard } from "@/lib/api/dashboard";
import { getMyBookings } from "@/lib/api/bookings";
import { getMyReviews } from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewModal } from "@/components/ReviewModal";

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "default",
  DISPUTED: "danger",
};

type ReviewItem = { id: string; bookingId: string; rating: number; comment?: string; status?: string };

export default function CustomerDashboardPage() {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<{
    recentBookings?: { id: string; status: string; scheduledDate: string; estimatedPrice: number; currency: string; masterProfile?: { displayName: string }; service?: { nameEn: string } }[];
    unreadNotifications?: number;
  } | null>(null);
  const [bookings, setBookings] = useState<{ items?: unknown[] } | null>(null);
  const [reviewsByBooking, setReviewsByBooking] = useState<Record<string, ReviewItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalBooking, setReviewModalBooking] = useState<{
    id: string;
    masterName?: string;
    existingReview?: ReviewItem;
  } | null>(null);

  const fetchData = useCallback(() => {
    if (!accessToken) return;
    Promise.all([
      getCustomerDashboard(),
      getMyBookings({ limit: 20 }),
      getMyReviews(accessToken, { limit: 50 }),
    ])
      .then(([d, b, r]) => {
        setDashboard(d as typeof dashboard);
        setBookings(b as { items?: unknown[] });
        const items = (r as { items?: { id: string; bookingId: string; rating: number; comment?: string; status?: string }[] }).items ?? [];
        const map: Record<string, ReviewItem> = {};
        items.forEach((rev) => { map[rev.bookingId] = rev; });
        setReviewsByBooking(map);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [accessToken, t.common.error]);

  useEffect(() => {
    if (!accessToken) setLoading(false);
    else fetchData();
  }, [accessToken, fetchData]);

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error) return <Container className="py-12 text-red-600">{error}</Container>;

  const items = (bookings?.items ?? dashboard?.recentBookings ?? []) as {
    id: string;
    status: string;
    scheduledDate: string;
    estimatedPrice: number;
    currency: string;
    masterProfile?: { displayName: string };
    service?: { nameEn: string };
  }[];

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING: t.customerDashboard.pending,
      CONFIRMED: t.customerDashboard.confirmed,
      IN_PROGRESS: t.customerDashboard.inProgress,
      COMPLETED: t.customerDashboard.completed,
      CANCELLED: t.customerDashboard.cancelled,
      DISPUTED: "Disputed",
    };
    return map[status] ?? status;
  };

  return (
    <Container className="py-8">
      <SectionHeading title={t.customerDashboard.title} />
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/customer/notifications">
          <Button variant="outline" size="sm" className="relative">
            {t.nav.notifications}
            {dashboard?.unreadNotifications ? (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center bg-primary-600 text-white rounded-full">
                {dashboard.unreadNotifications}
              </span>
            ) : null}
          </Button>
        </Link>
        <Link href="/customer/profile">
          <Button variant="outline" size="sm">{t.nav.profile}</Button>
        </Link>
      </div>

      <SectionHeading title={t.customerDashboard.recentBookings} subtitle={t.customerDashboard.status} />
      {items.length === 0 ? (
        <EmptyState
          title={t.customerDashboard.noBookings}
          actionLabel={t.home.browseMasters}
          actionHref="/search"
          icon="bookings"
        />
      ) : (
        <div className="space-y-4">
          {items.map((b) => {
            const existingReview = reviewsByBooking[b.id];
            const canReview = b.status === "COMPLETED";
            return (
              <Card key={b.id}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {b.service?.nameEn ?? "Service"} · {b.masterProfile?.displayName ?? "Master"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(b.scheduledDate), "MMM d, yyyy")} · {b.estimatedPrice} {b.currency}
                    </p>
                    {canReview && (
                      <div className="mt-3">
                        {existingReview ? (
                          <div>
                            <p className="text-sm text-gray-600">
                              {t.review.viewReview}: ★ {existingReview.rating}
                              {existingReview.comment && ` — ${existingReview.comment}`}
                            </p>
                            {existingReview.status === "PUBLISHED" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 p-0 h-auto"
                                onClick={() => setReviewModalBooking({
                                  id: b.id,
                                  masterName: b.masterProfile?.displayName,
                                  existingReview,
                                })}
                              >
                                {t.review.editReview}
                              </Button>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">{t.review.cannotEdit}</p>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-600"
                            onClick={() => setReviewModalBooking({
                              id: b.id,
                              masterName: b.masterProfile?.displayName,
                              existingReview,
                            })}
                          >
                            {t.review.leaveReview}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANTS[b.status] ?? "default"}>
                    {statusLabel(b.status)}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {reviewModalBooking && (
        <ReviewModal
          bookingId={reviewModalBooking.id}
          existingReview={reviewModalBooking.existingReview}
          masterName={reviewModalBooking.masterName}
          onClose={() => setReviewModalBooking(null)}
          onSuccess={fetchData}
        />
      )}
    </Container>
  );
}
