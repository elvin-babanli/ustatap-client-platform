"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

type Props = {
  bookingId?: string;
  price: number;
  currency: string;
  onSkip: () => void;
};

export function PaymentPlaceholder({ bookingId, price, currency, onSkip }: Props) {
  const { t } = useI18n();
  const paymentHref = bookingId ? `/payment?bookingId=${bookingId}` : "/payment";

  return (
    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
      <div className="flex items-center gap-2 text-emerald-700 font-medium mb-4">
        <span>🔒</span>
        {t.trust.securePayment}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-600">{t.booking.price}</span>
          <span className="font-bold text-gray-900">{price} {currency}</span>
        </div>
        <div className="flex gap-4 py-2">
          <span className="px-3 py-1.5 bg-white rounded-lg border text-sm">💳 {t.trust.card}</span>
          <span className="px-3 py-1.5 bg-white rounded-lg border text-sm">💵 {t.trust.cash}</span>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <span>🛡️</span> {t.trust.platformProtected}
        </p>
        <Link href={paymentHref}>
          <Button variant="primary" size="lg" className="w-full">
            {t.bookingFlow.continueToPayment}
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="w-full" onClick={onSkip}>
          {t.common.back} to dashboard
        </Button>
      </div>
    </div>
  );
}
