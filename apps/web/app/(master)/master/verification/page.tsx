"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getMyVerificationSummary } from "@/lib/api/verification";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type DocPlaceholder = { type: string; labelKey: string };

const DOCS: DocPlaceholder[] = [
  { type: "id", labelKey: "idDocument" },
  { type: "selfie", labelKey: "selfie" },
  { type: "cert", labelKey: "certificates" },
];

export default function MasterVerificationPage() {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<{
    verificationStatus?: string;
    rejectionReason?: string;
    latestRejectionReason?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    getMyVerificationSummary(accessToken)
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [accessToken, t.common.error]);

  const status = summary?.verificationStatus ?? "PENDING";
  const v = t.verification;

  const statusVariant = status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "warning";

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{v.title}</h1>
        <Link href="/master/dashboard">
          <Button variant="ghost" size="sm">← Dashboard</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center py-12 text-gray-500">{t.common.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">{v.status}</span>
              <Badge variant={statusVariant}>
                {status === "APPROVED" ? v.approved : status === "REJECTED" ? v.rejected : v.pending}
              </Badge>
            </div>
            {(summary?.rejectionReason || summary?.latestRejectionReason) && (
              <p className="text-sm text-red-600 mt-2">
                {v.rejectionReason}: {summary.rejectionReason || summary.latestRejectionReason}
              </p>
            )}
          </Card>

          <div className="grid gap-4">
            {DOCS.map((doc) => (
              <Card key={doc.type}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {(v as Record<string, string>)[doc.labelKey] ?? doc.type}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{v.uploadPlaceholder}</p>
                  </div>
                  <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl text-gray-400 border-2 border-dashed border-gray-200">
                    📄
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
