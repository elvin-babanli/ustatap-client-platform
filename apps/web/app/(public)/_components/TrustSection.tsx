"use client";

import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRUST_ITEMS = [
  { titleKey: "trust1", icon: "✅", description: "Background-checked and approved experts." },
  { titleKey: "trust3", icon: "🔒", description: "Protected transactions via platform flow." },
  { titleKey: "trust4", icon: "⭐", description: "Feedback from real completed bookings." },
] as const;

export function TrustSection() {
  const { t } = useI18n();

  return (
    <section className="py-16 bg-white">
      <Container>
        <SectionHeading title={t.home.trustTitle} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.titleKey}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-lg">
                {item.icon}
              </span>
              <p className="font-semibold text-gray-900">{t.home[item.titleKey]}</p>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
