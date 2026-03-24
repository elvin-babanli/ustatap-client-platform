"use client";

import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  { key: "step1", icon: "🔍" },
  { key: "step2", icon: "📅" },
  { key: "step3", icon: "🔒" },
  { key: "step4", icon: "⭐" },
] as const;

export function HowItWorksSection() {
  const { t } = useI18n();

  return (
    <section className="py-16 bg-white">
      <Container>
        <SectionHeading title={t.home.howItWorks} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className="text-center p-6 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <span className="text-3xl">{step.icon}</span>
              <p className="font-semibold text-gray-900 mt-3">{t.home[step.key]}</p>
              <p className="text-sm text-gray-500 mt-1">Step {i + 1}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
