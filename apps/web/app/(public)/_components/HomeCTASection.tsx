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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/search">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 border-0 w-full sm:w-auto"
              >
                {t.home.findPro}
              </Button>
            </Link>
            <Link href="/become-a-pro">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                {t.home.becomePro}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
