"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getAdminDisputes } from "@/lib/api/admin";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";

type Dispute = {
  id: string;
  bookingId: string;
  status: string;
  issueType: string;
  reason: string;
  createdAt: string;
  openedBy?: {
    customerProfile?: { firstName: string; lastName: string };
    masterProfile?: { displayName: string };
    email?: string | null;
    phone: string;
  };
  booking?: {
    id: string;
    status: string;
    scheduledDate: string;
    estimatedPrice?: number;
    currency?: string;
  };
};

const STATUS_VARIANTS: Record<string, "default" | "warning" | "success"> = {
  OPEN: "warning",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

const ISSUE_LABELS: Record<string, string> = {
  OVERCHARGE: "Overcharge",
  BAD_QUALITY: "Bad quality",
  NO_SHOW: "No show",
  SAFETY_ISSUE: "Safety issue",
  PAYMENT_ISSUE: "Payment issue",
  OTHER: "Other",
};

function openedByDisplay(openedBy: Dispute["openedBy"]): string {
  if (!openedBy) return "—";
  if (openedBy.customerProfile) {
    return [openedBy.customerProfile.firstName, openedBy.customerProfile.lastName].filter(Boolean).join(" ") || openedBy.phone;
  }
  if (openedBy.masterProfile?.displayName) return openedBy.masterProfile.displayName;
  return openedBy.email ?? openedBy.phone ?? "—";
}

export default function AdminDisputesPage() {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [issueFilter, setIssueFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    getAdminDisputes(accessToken)
      .then((data) => setDisputes(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [accessToken, t.common.error]);

  const filtered = disputes.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (issueFilter && d.issueType !== issueFilter) return false;
    if (search.trim() && !d.bookingId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error) return <Container className="py-12 text-red-600">{error}</Container>;

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SectionHeading title={t.admin.disputes} />
        <Link href="/admin/dashboard" className="text-primary-600 hover:underline text-sm">
          ← {t.admin.title}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by booking ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-48"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={issueFilter}
          onChange={(e) => setIssueFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All issue types</option>
          {Object.entries(ISSUE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t.admin.noDisputes}
          description="Disputes will appear here when customers or masters submit them."
          actionLabel={t.common.back}
          actionHref="/admin/dashboard"
          icon="default"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <Link key={d.id} href={`/admin/disputes/${d.id}`}>
              <Card className="hover:border-primary-200 hover:shadow-sm transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {t.admin.disputeBooking} #{d.bookingId.slice(0, 8)}…
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t.admin.disputeOpenedBy}: {openedByDisplay(d.openedBy)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {d.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[d.status] ?? "default"}>{d.status}</Badge>
                    <span className="text-sm text-gray-500">{ISSUE_LABELS[d.issueType] ?? d.issueType}</span>
                    <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
