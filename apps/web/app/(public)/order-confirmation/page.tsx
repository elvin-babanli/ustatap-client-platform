"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "—";
  const { t } = useI18n();

  return (
    <div className="py-12">
      <Container size="narrow">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">{t.orderConfirmation.success}</h1>
          <p className="text-gray-600 mt-2">{t.orderConfirmation.orderNumber}: {bookingId}</p>
          <p className="text-gray-500 text-sm mt-4">{t.orderConfirmation.estimatedArrival}: —</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/tracking/${bookingId}`}>
              <Button variant="primary" size="lg">{t.orderConfirmation.trackOrder}</Button>
            </Link>
            <Link href={`/messages/booking/${bookingId}`}>
              <Button variant="outline" size="lg">{t.orderConfirmation.messagePro}</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="lg">{t.emptyStates.backHome}</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-12"><Container size="narrow"><p className="text-center text-gray-500">Loading...</p></Container></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
