"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function EmergencyServiceBlock() {
  const { t } = useI18n();

  return (
    <section className="py-12 bg-amber-50 border-y border-amber-100">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.home.emergencyTitle}</h2>
            <p className="text-gray-600 mt-1">{t.home.emergencySubtitle}</p>
          </div>
          <Link href="/search?urgent=true">
            <Button variant="primary" size="lg">
              {t.home.emergencyCta}
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
