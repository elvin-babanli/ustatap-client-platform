"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getThreads } from "@/lib/api/messages";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";

type Thread = {
  id: string;
  bookingId: string;
  lastMessage: { content: string; createdAt: string } | null;
  updatedAt: string;
  booking: {
    id: string;
    status: string;
    scheduledDate: string;
    otherPartyDisplayName: string;
  };
};

export default function MessagesPage() {
  const { t } = useI18n();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    getThreads()
      .then((data) => setThreads((data as Thread[]) ?? []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER", "MASTER"]}>
      <div className="py-12">
        <Container>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{t.messages.title}</h1>
            {threads.length > 0 && (
              <button
                type="button"
                onClick={refresh}
                className="text-sm text-primary-600 hover:underline"
              >
                Refresh
              </button>
            )}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {t.messages.keepCommunicationInPlatform}
          </div>
          {loading ? (
            <p className="mt-8 text-gray-500">Loading...</p>
          ) : threads.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No conversations yet"
                description="Your conversations will appear here. Start a booking to message a pro."
                actionLabel={t.emptyStates.backHome}
                actionHref="/"
                icon="messages"
              />
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-gray-200">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={`/messages/${thread.id}`}
                    className="block py-4 hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {thread.booking.otherPartyDisplayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {thread.lastMessage
                            ? thread.lastMessage.content.slice(0, 60) + (thread.lastMessage.content.length > 60 ? "…" : "")
                            : "No messages yet"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Booking #{thread.bookingId.slice(0, 8)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(thread.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-sm text-gray-500">
            Quick replies (e.g. &quot;{t.messages.onMyWay}&quot;) {t.common.availableSoon}.
          </p>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
