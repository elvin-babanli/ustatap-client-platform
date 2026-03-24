"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  getMasterVerifications,
  updateMasterVerificationStatus,
} from "@/lib/api/admin";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";

type Tab = "PENDING" | "APPROVED" | "REJECTED" | "ALL";
type MasterVerification = {
  id: string;
  displayName: string;
  verificationStatus: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentsCount?: number;
  user?: { email?: string; phone?: string };
};

export default function AdminVerificationsPage() {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<Tab>("PENDING");
  const [items, setItems] = useState<MasterVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    const status = tab === "ALL" ? undefined : tab;
    getMasterVerifications(accessToken, {
      verificationStatus: status,
      limit: 50,
      page: 1,
    })
      .then((res) => setItems((res as { items: MasterVerification[] }).items ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [accessToken, tab, t.common.error]);

  async function handleStatus(masterProfileId: string, status: string, reason?: string) {
    if (!accessToken) return;
    setActionId(masterProfileId);
    setRejectModal(null);
    setRejectReason("");
    try {
      await updateMasterVerificationStatus(accessToken, masterProfileId, status, reason);
      setItems((prev) => prev.filter((m) => m.id !== masterProfileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionId(null);
    }
  }

  const vt = (t.admin as { verificationTabs?: Record<string, string> }).verificationTabs;
  const tabs: { key: Tab; label: string }[] = [
    { key: "PENDING", label: vt?.pending ?? "Pending" },
    { key: "APPROVED", label: vt?.approved ?? "Approved" },
    { key: "REJECTED", label: vt?.rejected ?? "Rejected" },
    { key: "ALL", label: vt?.all ?? "All" },
  ];

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SectionHeading title={t.admin.verifications} />
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm">← {t.admin.title}</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === key
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-12 text-gray-500">{t.common.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title={t.admin.noVerifications} />
      ) : (
        <div className="space-y-4">
          {items.map((m) => (
            <Card key={m.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/masters/${m.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                      {m.displayName}
                    </Link>
                    <Badge
                      variant={
                        m.verificationStatus === "APPROVED"
                          ? "success"
                          : m.verificationStatus === "REJECTED"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {m.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {m.user?.email ?? m.user?.phone ?? "—"}
                  </p>
                  {m.reviewedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Reviewed: {new Date(m.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                  {m.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">{m.rejectionReason}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {m.verificationStatus !== "APPROVED" && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={actionId === m.id}
                      onClick={() => handleStatus(m.id, "APPROVED")}
                    >
                      {t.admin.approve}
                    </Button>
                  )}
                  {m.verificationStatus !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={actionId === m.id}
                      onClick={() => setRejectModal({ id: m.id, name: m.displayName })}
                    >
                      {t.admin.reject}
                    </Button>
                  )}
                  {m.verificationStatus !== "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionId === m.id}
                      onClick={() => handleStatus(m.id, "PENDING")}
                    >
                      Pending
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-2">{t.admin.reject}: {rejectModal.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.admin.rejectionReasonRequired}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t.admin.rejectionReason}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-4"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setRejectModal(null)}>
                {t.common.back}
              </Button>
              <Button
                variant="danger"
                disabled={!rejectReason.trim()}
                onClick={() => handleStatus(rejectModal.id, "REJECTED", rejectReason.trim())}
              >
                {t.admin.reject}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
