"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getAdminDisputeById } from "@/lib/api/admin";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

type DisputeDetail = {
  id: string;
  bookingId: string;
  status: string;
  issueType: string;
  reason: string;
  attachmentUrls?: string[];
  resolutionNote?: string | null;
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
    customer?: { customerProfile?: { firstName: string; lastName: string }; email?: string | null; phone: string };
    masterProfile?: { displayName: string };
  };
};

const ISSUE_LABELS: Record<string, string> = {
  OVERCHARGE: "Overcharge",
  BAD_QUALITY: "Bad quality",
  NO_SHOW: "No show",
  SAFETY_ISSUE: "Safety issue",
  PAYMENT_ISSUE: "Payment issue",
  OTHER: "Other",
};

function openedByDisplay(openedBy: DisputeDetail["openedBy"]): string {
  if (!openedBy) return "—";
  if (openedBy.customerProfile) {
    return [openedBy.customerProfile.firstName, openedBy.customerProfile.lastName].filter(Boolean).join(" ") || openedBy.phone;
  }
  if (openedBy.masterProfile?.displayName) return openedBy.masterProfile.displayName;
  return openedBy.email ?? openedBy.phone ?? "—";
}

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken || !id) return;
    getAdminDisputeById(accessToken, id)
      .then(setDispute)
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [accessToken, id, t.common.error]);

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error) return <Container className="py-12 text-red-600">{error}</Container>;
  if (!dispute) return null;

  const attachments = Array.isArray(dispute.attachmentUrls) ? dispute.attachmentUrls : [];

  return (
    <Container className="py-8" size="narrow">
      <Link href="/admin/disputes" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
        ← {t.admin.disputes}
      </Link>
      <SectionHeading title={`${t.admin.disputeBooking} #${dispute.bookingId.slice(0, 8)}`} />
      <div className="space-y-4 mt-6">
        <Card>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{dispute.status}</Badge>
            <span className="text-gray-600">{ISSUE_LABELS[dispute.issueType] ?? dispute.issueType}</span>
            <span className="text-sm text-gray-400">{new Date(dispute.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-sm font-medium text-gray-700">{t.admin.disputeOpenedBy}</p>
          <p className="text-gray-900">{openedByDisplay(dispute.openedBy)}</p>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">{t.admin.disputeDescription}</p>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{dispute.reason}</p>
          </div>
          {dispute.resolutionNote && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Resolution note</p>
              <p className="text-gray-900 mt-1">{dispute.resolutionNote}</p>
            </div>
          )}
        </Card>

        {dispute.booking && (
          <Card>
            <p className="text-sm font-medium text-gray-700 mb-2">{t.admin.disputeBooking}</p>
            <p className="text-gray-900">Status: {dispute.booking.status}</p>
            <p className="text-gray-600 text-sm">Scheduled: {new Date(dispute.booking.scheduledDate).toLocaleDateString()}</p>
            {dispute.booking.estimatedPrice != null && (
              <p className="text-gray-600 text-sm">
                {dispute.booking.estimatedPrice} {dispute.booking.currency ?? "AZN"}
              </p>
            )}
            {dispute.booking.customer && (
              <p className="text-gray-600 text-sm mt-2">
                Customer: {[dispute.booking.customer.customerProfile?.firstName, dispute.booking.customer.customerProfile?.lastName].filter(Boolean).join(" ") || dispute.booking.customer.phone}
              </p>
            )}
            {dispute.booking.masterProfile && (
              <p className="text-gray-600 text-sm">Master: {dispute.booking.masterProfile.displayName}</p>
            )}
          </Card>
        )}

        {attachments.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-gray-700 mb-2">{t.admin.disputeAttachments}</p>
            <ul className="space-y-1">
              {attachments.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Container>
  );
}
