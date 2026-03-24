"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const { t } = useI18n();
  const backLabel = t.emptyStates?.backHome ?? "Back to home";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <h1 className="text-8xl font-bold text-primary-600">404</h1>
      <p className="text-gray-600 mt-4 text-lg text-center">Page not found</p>
      <Link href="/" className="mt-8">
        <Button variant="primary" size="lg">{backLabel}</Button>
      </Link>
    </div>
  );
}
