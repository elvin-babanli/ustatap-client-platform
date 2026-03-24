"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

function PaymentContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const { t } = useI18n();
  const confirmHref = `/order-confirmation?bookingId=${encodeURIComponent(bookingId)}`;

  return (
    <div className="py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-gray-900">{t.bookingFlow.orderSummary}</h1>
        {bookingId && <p className="text-gray-500 mt-1">Booking #{bookingId}</p>}
        <div className="mt-8 space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="font-medium">{t.trust.paymentMethods}</p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="method" defaultChecked /> {t.trust.card}
              </label>
              <label className="flex items-center gap-2 cursor-pointer opacity-60">
                <input type="radio" name="method" disabled /> Apple Pay / Google Pay ({t.common.comingSoon})
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="method" /> {t.trust.cash}
              </label>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">{t.bookingFlow.paymentProtected}</p>
            <p className="text-gray-600 mt-1">{t.bookingFlow.refundPolicy}</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Link href={confirmHref}>
            <Button variant="primary" size="lg">{t.bookingFlow.confirmAndPay}</Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">{t.common.back}</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="py-12"><Container size="narrow"><p className="text-gray-500">Loading...</p></Container></div>}>
      <PaymentContent />
    </Suspense>
  );
}
