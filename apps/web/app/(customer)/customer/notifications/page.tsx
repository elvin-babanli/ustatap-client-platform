"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/notifications";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
};

export default function CustomerNotificationsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    getMyNotifications({ page: 1, limit: 50 })
      .then((data) => {
        const res = data as { items?: NotificationItem[] };
        const list = res?.items ?? [];
        setItems(list);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleMarkAsRead(id: string) {
    setActionId(id);
    try {
      await markNotificationAsRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch {
      setError(t.common.error);
    } finally {
      setActionId(null);
    }
  }

  async function handleMarkAllAsRead() {
    setActionId("all");
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    } catch {
      setError(t.common.error);
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error) return <Container className="py-12 text-red-600">{error}</Container>;

  const unreadCount = items.filter((n) => !n.isRead && !n.read).length;

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.notifications.title}</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={actionId === "all"}
          >
            {t.notifications.markAllAsRead}
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState
          title={t.notifications.noNotifications}
          icon="notifications"
        />
      ) : (
        <div className="space-y-4">
          {items.map((n) => {
            const isRead = n.isRead ?? n.read ?? false;
            return (
              <Card
                key={n.id}
                className={isRead ? "opacity-70" : "border-l-4 border-l-primary-500"}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">
                      {n.title ?? n.message ?? "Notification"}
                    </h3>
                    {n.message && n.title && (
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    )}
                    {n.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {!isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.id)}
                      disabled={actionId === n.id}
                    >
                      {t.notifications.markAsRead}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
