"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { createDispute, getMyDisputes, type DisputeIssueType } from "@/lib/api/disputes";
import { getMyBookings } from "@/lib/api/bookings";
import { getMasterBookings } from "@/lib/api/bookings";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

const ISSUE_TYPE_MAP: Record<string, DisputeIssueType> = {
  overcharge: "OVERCHARGE",
  badQuality: "BAD_QUALITY",
  noShow: "NO_SHOW",
  safetyIssue: "SAFETY_ISSUE",
  paymentIssue: "PAYMENT_ISSUE",
  other: "OTHER",
};

const DISPUTE_ELIGIBLE_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]; // Excludes DISPUTED, CANCELLED, PENDING

type Booking = {
  id: string;
  status: string;
  scheduledDate: string;
  estimatedPrice?: number;
  currency?: string;
  masterProfile?: { displayName: string };
  masterService?: { service?: { nameEn?: string } };
  customer?: { customerProfile?: { firstName?: string; lastName?: string } };
};

function formatBookingOption(b: Booking, isMaster: boolean): string {
  const date = new Date(b.scheduledDate).toLocaleDateString();
  const svc = b.masterService?.service?.nameEn ?? "Service";
  const price = b.estimatedPrice != null ? ` · ${b.estimatedPrice} ${b.currency ?? "AZN"}` : "";
  const party = isMaster
    ? [b.customer?.customerProfile?.firstName, b.customer?.customerProfile?.lastName].filter(Boolean).join(" ") || "Customer"
    : b.masterProfile?.displayName ?? "";
  return `${b.id.slice(0, 8)} · ${date} · ${svc}${party ? ` · ${party}` : ""}${price}`;
}

export default function DisputesPage() {
  const { t } = useI18n();
  const { accessToken, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [issueTypeKey, setIssueTypeKey] = useState("overcharge");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [myDisputes, setMyDisputes] = useState<{ id: string; status: string; bookingId: string; createdAt: string }[]>([]);

  const isMaster = user?.role === "MASTER";

  useEffect(() => {
    if (!accessToken) return;
    setBookingsLoading(true);
    const fetcher = isMaster ? getMasterBookings : getMyBookings;
    fetcher({ limit: 50, sortBy: "scheduledDate", sortOrder: "desc" })
      .then((res: unknown) => {
        const items = (res as { items?: Booking[] })?.items ?? [];
        const eligible = items.filter((b) => DISPUTE_ELIGIBLE_STATUSES.includes(b.status));
        setBookings(eligible);
        if (eligible.length > 0 && !selectedBookingId) setSelectedBookingId(eligible[0].id);
      })
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only set initial selection on first load
  }, [accessToken, isMaster]);

  useEffect(() => {
    if (!accessToken) return;
    getMyDisputes()
      .then((data: unknown) => setMyDisputes(Array.isArray(data) ? data : []))
      .catch(() => setMyDisputes([]));
  }, [accessToken, submitted]);

  const labels: Record<string, string> = {
    overcharge: t.disputes.overcharge,
    badQuality: t.disputes.badQuality,
    noShow: t.disputes.noShow,
    safetyIssue: t.disputes.safetyIssue,
    paymentIssue: t.disputes.paymentIssue,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) {
      router.push("/login?redirect=/disputes");
      return;
    }
    setError("");
    if (!selectedBookingId.trim() || !reason.trim() || reason.length < 10) {
      setError("Select an order and describe the issue (min 10 chars)");
      return;
    }
    setLoading(true);
    try {
      await createDispute({
        bookingId: selectedBookingId.trim(),
        issueType: ISSUE_TYPE_MAP[issueTypeKey] ?? "OTHER",
        reason: reason.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-gray-900">{t.disputes.title}</h1>
        {!accessToken && (
          <p className="mt-4 text-amber-700 bg-amber-50 p-4 rounded-lg">
            Please <Link href="/login" className="font-medium underline">log in</Link> to submit a dispute.
          </p>
        )}
        {accessToken && bookingsLoading && (
          <p className="mt-4 text-gray-500">{t.common.loading}</p>
        )}
        {accessToken && !bookingsLoading && bookings.length === 0 && (
          <EmptyState
            title="No eligible orders"
            description="You need at least one confirmed, in-progress, or completed booking to open a dispute."
            actionLabel={t.emptyStates.exploreServices}
            actionHref="/search"
            icon="bookings"
          />
        )}
        {accessToken && !bookingsLoading && bookings.length > 0 && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.disputes.selectOrder}</label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">Select an order</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {formatBookingOption(b, isMaster)}
                  </option>
                ))}
              </select>
              {selectedBooking && (
                <p className="mt-2 text-sm text-gray-500">
                  {isMaster
                    ? [selectedBooking.customer?.customerProfile?.firstName, selectedBooking.customer?.customerProfile?.lastName].filter(Boolean).join(" ") || "Customer"
                    : selectedBooking.masterProfile?.displayName ?? "—"
                  } · {new Date(selectedBooking.scheduledDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.disputes.issueType}</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                value={issueTypeKey}
                onChange={(e) => setIssueTypeKey(e.target.value)}
              >
                {Object.keys(ISSUE_TYPE_MAP).map((key) => (
                  <option key={key} value={key}>{labels[key]}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-lg min-h-[120px]"
                placeholder="Describe the issue... (min 10 characters)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500">Photo/video upload ({t.common.comingSoon})</p>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading || !accessToken}>
              {loading ? "Submitting..." : "Submit complaint"}
            </Button>
          </form>
        )}
        {submitted && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            Dispute submitted. We will review it shortly.
          </div>
        )}
        {accessToken && myDisputes.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your disputes</h2>
            <ul className="space-y-2">
              {myDisputes.map((d) => (
                <li key={d.id} className="p-3 border border-gray-200 rounded-lg text-sm">
                  <span className="font-medium">#{d.bookingId.slice(0, 8)}</span>
                  <span className="text-gray-500 mx-2">·</span>
                  <span className="text-gray-600">{d.status}</span>
                  <span className="text-gray-400 text-xs ml-2">{new Date(d.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </div>
  );
}
