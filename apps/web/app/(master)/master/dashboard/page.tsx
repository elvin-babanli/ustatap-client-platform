"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMasterDashboard } from "@/lib/api/dashboard";
import { getMasterBookings, updateMasterBookingStatus } from "@/lib/api/bookings";
import { getMasterProfile, updateMasterProfile } from "@/lib/api/master-profile";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MasterDashboardPage() {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [dashboard, setDashboard] = useState<{
    pendingBookings?: number;
    totalCompletedPayoutsAmount?: number;
    pendingPayoutsAmount?: number;
    averageRating?: number;
    totalReviews?: number;
  } | null>(null);
  const [bookings, setBookings] = useState<{
    items?: { id: string; status: string; scheduledDate: string; estimatedPrice: number; currency: string; customer?: { email?: string }; service?: { nameEn: string } }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      getMasterDashboard(),
      getMasterBookings({ limit: 20, status: "PENDING" }),
      getMasterProfile(accessToken),
    ])
      .then(([d, b, profile]) => {
        setDashboard(d as typeof dashboard);
        setBookings(b as typeof bookings);
        setIsAvailable((profile as { isAvailable?: boolean })?.isAvailable ?? true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [accessToken, t.common.error]);

  async function toggleAvailability() {
    if (!accessToken) return;
    try {
      await updateMasterProfile(accessToken, { isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    }
  }

  async function handleStatus(bookingId: string, status: string) {
    setActionId(bookingId);
    try {
      await updateMasterBookingStatus(bookingId, status);
      setBookings((prev) => ({
        items: prev?.items?.filter((b) => b.id !== bookingId) ?? [],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error) return <Container className="py-12 text-red-600">{error}</Container>;

  const pendingItems = bookings?.items?.filter((b) => b.status === "PENDING") ?? [];

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <SectionHeading title={t.masterDashboard.title} />
        <div className="flex gap-2">
          <Link href="/master/verification">
            <Button variant="outline" size="sm">{(t as { verification?: { title: string } }).verification?.title ?? "Verification"}</Button>
          </Link>
          <Button
            variant={isAvailable ? "secondary" : "primary"}
            onClick={toggleAvailability}
          >
            {isAvailable ? t.masterDashboard.goOffline : t.masterDashboard.goOnline}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label={t.masterDashboard.earnings}
          value={`${Number(dashboard?.totalCompletedPayoutsAmount ?? 0).toFixed(0)} ${t.common.azn}`}
          variant="primary"
        />
        <StatCard
          label={t.masterDashboard.pendingPayouts}
          value={`${Number(dashboard?.pendingPayoutsAmount ?? 0).toFixed(0)} ${t.common.azn}`}
          variant="warning"
        />
        <StatCard
          label={t.masters.rating}
          value={`★ ${Number(dashboard?.averageRating ?? 0).toFixed(1)} (${dashboard?.totalReviews ?? 0} ${t.masters.reviews})`}
        />
      </div>

      <SectionHeading title={t.masterDashboard.incomingBookings} />
      {pendingItems.length === 0 ? (
        <EmptyState title={t.masterDashboard.noBookings} icon="bookings" />
      ) : (
        <div className="space-y-4">
          {pendingItems.map((b) => (
            <Card key={b.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.service?.nameEn ?? "Service"}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(b.scheduledDate), "MMM d, yyyy")} · {b.estimatedPrice} {b.currency}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatus(b.id, "CONFIRMED")}
                    disabled={actionId === b.id}
                  >
                    {t.masterDashboard.accept}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatus(b.id, "CANCELLED")}
                    disabled={actionId === b.id}
                  >
                    {t.masterDashboard.reject}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
