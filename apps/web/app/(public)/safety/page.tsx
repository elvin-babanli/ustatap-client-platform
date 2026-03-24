"use client";

import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";

export default function SafetyPage() {
  const { t } = useI18n();

  return (
    <div className="py-16">
      <Container size="narrow">
        <h1 className="text-3xl font-bold text-gray-900">{t.footer?.safety ?? "Safety"}</h1>
        <div className="mt-8 space-y-6 text-gray-600">
          <p>UstaTap is designed with your safety in mind. We verify professionals, protect payments, and keep communication on the platform.</p>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mt-6">{t.masters.verified}</h2>
            <p>All professionals undergo identity verification before they can receive bookings.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mt-6">{t.trust.platformProtected}</h2>
            <p>Payments are held securely and released only after job completion. Dispute resolution is available.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mt-6">{t.messages.keepCommunicationInPlatform}</h2>
            <p>Keep all communication and payment inside UstaTap. Phone numbers are hidden until booking is confirmed.</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
