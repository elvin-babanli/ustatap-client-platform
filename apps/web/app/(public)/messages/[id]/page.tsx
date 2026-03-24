"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getThreadById, sendMessage } from "@/lib/api/messages";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
};

type ThreadData = {
  id: string;
  bookingId: string;
  messages: Message[];
};

export default function MessageThreadPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useI18n();
  const { user } = useAuth();
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newContent, setNewContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    getThreadById(id)
      .then((data) => setThread(data as ThreadData))
      .catch(() => setError("Could not load conversation"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = newContent.trim();
    if (!content || sending || !thread) return;
    setSending(true);
    try {
      const msg = await sendMessage(thread.id, content) as Message;
      setThread((prev) =>
        prev ? { ...prev, messages: [...prev.messages, msg] } : null
      );
      setNewContent("");
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER", "MASTER"]}>
      <div className="py-12">
        <Container size="narrow">
          <Link
            href="/messages"
            className="text-sm text-primary-600 hover:underline mb-4 inline-block"
          >
            ← {t.common.back}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.messages.title}</h1>
          <p className="text-gray-500">Conversation</p>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {t.messages.keepCommunicationInPlatform}
          </div>
          {loading ? (
            <p className="mt-6 text-gray-500">Loading...</p>
          ) : error ? (
            <p className="mt-6 text-red-600">{error}</p>
          ) : thread ? (
            <>
              <div className="mt-6 p-4 border border-gray-200 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto space-y-3">
                {thread.messages.length === 0 ? (
                  <p className="text-gray-500 text-sm">No messages yet. Start the conversation.</p>
                ) : (
                  thread.messages.map((msg) => {
                    const isMe = user?.id === msg.senderId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            isMe
                              ? "bg-primary-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {msg.content}
                          <p
                            className={`text-xs mt-1 ${
                              isMe ? "text-primary-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                  disabled={sending}
                />
                <Button type="submit" variant="primary" disabled={sending || !newContent.trim()}>
                  {sending ? "Sending..." : "Send"}
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title={t.common.availableSoon}
                >
                  {t.messages.onMyWay}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title={t.common.availableSoon}
                >
                  {t.messages.sharePhoto}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title={t.common.availableSoon}
                >
                  {t.messages.willBeLate}
                </Button>
              </div>
            </>
          ) : null}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
