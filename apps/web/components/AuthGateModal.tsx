"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

type AuthGateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  action: "book" | "favorites" | "payment" | "message";
};

export function AuthGateModal({ isOpen, onClose, action }: AuthGateModalProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const messages: Record<string, string> = {
    book: t.authGate?.loginToBook ?? "Log in to book this pro",
    favorites: t.authGate?.loginToFavorites ?? "Create an account to add to favorites",
    payment: t.authGate?.loginToPay ?? "Create an account to continue to payment",
    message: t.authGate?.loginToMessage ?? "Log in to send a message",
  };
  const title = t.authGate?.createAccountToContinue ?? "Create an account to continue";
  const subtitle = t.authGate?.accountRequired ?? "Booking, messaging and payments require an account.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-xl">
          🔐
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{subtitle}</p>
        <p className="text-gray-500 text-xs mt-1">{messages[action] ?? messages.book}</p>
        <div className="flex flex-col gap-2 mt-6">
          <Link href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}>
            <Button variant="primary" size="lg" className="w-full">
              {t.nav.login}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full">
              {t.nav.signUp}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
            {t.common.back}
          </Button>
        </div>
      </div>
    </div>
  );
}
