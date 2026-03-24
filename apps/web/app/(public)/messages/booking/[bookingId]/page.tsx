"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getThreadByBooking } from "@/lib/api/messages";
import { useI18n } from "@/lib/i18n";

export default function MessageBookingRedirectPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const router = useRouter();
  const { accessToken, isReady } = useAuth();
  const [error, setError] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken) {
      router.replace(`/login?redirect=/messages/booking/${bookingId}`);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const thread = await getThreadByBooking(bookingId) as { id: string };
        if (!cancelled) {
          router.replace(`/messages/${thread.id}`);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load conversation");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId, accessToken, isReady, router]);

  if (error) {
    return (
      <div className="py-12 px-4 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/messages" className="text-primary-600 hover:underline mt-2 inline-block">
          {t.common.back} to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 text-center text-gray-500">
      Loading conversation...
    </div>
  );
}
