"use client";

import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRUST_ITEMS = [
  { key: "trust1", icon: "✓" },
  { key: "trust2", icon: "✓" },
  { key: "trust3", icon: "✓" },
  { key: "trust4", icon: "✓" },
] as const;

export function TrustSection() {
  const { t } = useI18n();

  return (
    <section className="py-16 bg-white">
      <Container>
        <SectionHeading title={t.home.trustTitle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100"
            >
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.icon}
              </span>
              <p className="font-medium text-gray-900">{t.home[item.key]}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
