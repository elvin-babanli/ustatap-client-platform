"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDashboard } from "@/lib/api/dashboard";
import { getUsersAdmin } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<{
    totalUsers?: number;
    totalMasters?: number;
    totalBookings?: number;
    pendingMasterVerifications?: number;
    unreadOrOpenDisputes?: number;
  } | null>(null);
  const [users, setUsers] = useState<{ items?: { id: string; email?: string; phone: string; role: string; status: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    const fetchData = async () => {
      try {
        const [d, u] = await Promise.all([
          getAdminDashboard(),
          getUsersAdmin(accessToken, { limit: 20 }),
        ]);
        setDashboard(d as typeof dashboard);
        setUsers(u as typeof users);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.common.error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken, t.common.error]);

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error) return <Container className="py-12 text-red-600">{error}</Container>;

  const userItems = users?.items ?? [];

  return (
    <Container className="py-8">
      <SectionHeading title={t.admin.title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t.admin.totalUsers} value={dashboard?.totalUsers ?? 0} variant="primary" />
        <StatCard label={t.admin.totalMasters} value={dashboard?.totalMasters ?? 0} />
        <StatCard label={t.admin.totalBookings} value={dashboard?.totalBookings ?? 0} />
        <Link href="/admin/verifications" className="block hover:opacity-90 transition-opacity">
          <StatCard
            label={t.admin.verifications}
            value={dashboard?.pendingMasterVerifications ?? 0}
            variant="warning"
          />
        </Link>
        <Link href="/admin/disputes" className="block hover:opacity-90 transition-opacity">
          <StatCard
            label={t.admin.disputes}
            value={dashboard?.unreadOrOpenDisputes ?? 0}
          />
        </Link>
      </div>

      <SectionHeading title={t.admin.users} />
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.admin.emailPhone}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.admin.role}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.admin.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userItems.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{u.email ?? u.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{u.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}
