"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function HomeCTASection() {
  const { t } = useI18n();

  return (
    <section className="bg-primary-600 py-16">
      <Container size="narrow">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold">{t.cta.title}</h2>
          <p className="text-primary-100 mt-2 text-lg">{t.cta.subtitle}</p>
          <Link href="/search" className="inline-block mt-8">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 border-0"
            >
              {t.cta.getStarted}
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
