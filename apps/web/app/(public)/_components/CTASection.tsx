"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function CTASection() {
  const { t } = useI18n();

  return (
    <section className="bg-primary-600 py-16 px-4">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
        <p className="text-primary-100 text-lg mb-8">{t.cta.subtitle}</p>
        <Link
          href="/search"
          className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
        >
          {t.cta.getStarted}
        </Link>
      </div>
    </section>
  );
}
