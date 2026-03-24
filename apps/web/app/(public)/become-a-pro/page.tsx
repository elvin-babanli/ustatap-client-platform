"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function BecomeAProPage() {
  const { t } = useI18n();

  return (
    <div>
      <section className="bg-primary-600 py-16 text-white">
        <Container size="narrow">
          <h1 className="text-3xl md:text-4xl font-bold text-center">{t.becomePro.title}</h1>
          <p className="text-primary-100 text-center mt-4 text-lg">
            Grow your business with UstaTap. Reach new customers and get paid securely.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/register?role=master">
              <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                {t.becomePro.applyNow}
              </Button>
            </Link>
            <a href="#requirements">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                {t.becomePro.seeRequirements}
              </Button>
            </a>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-gray-50">
        <Container>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            {t.becomePro.benefits}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
              <span className="text-3xl">👥</span>
              <h3 className="font-semibold text-gray-900 mt-3">{t.becomePro.benefit1}</h3>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
              <span className="text-3xl">⏰</span>
              <h3 className="font-semibold text-gray-900 mt-3">{t.becomePro.benefit2}</h3>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
              <span className="text-3xl">📈</span>
              <h3 className="font-semibold text-gray-900 mt-3">{t.becomePro.benefit3}</h3>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
              <span className="text-3xl">💳</span>
              <h3 className="font-semibold text-gray-900 mt-3">{t.becomePro.benefit4}</h3>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            {t.becomePro.howItWorks}
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center mx-auto">1</div>
              <h3 className="font-semibold mt-3">{t.becomePro.step1}</h3>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center mx-auto">2</div>
              <h3 className="font-semibold mt-3">{t.becomePro.step2}</h3>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center mx-auto">3</div>
              <h3 className="font-semibold mt-3">{t.becomePro.step3}</h3>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center mx-auto">4</div>
              <h3 className="font-semibold mt-3">{t.becomePro.step4}</h3>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/register?role=master">
              <Button variant="primary" size="lg">{t.becomePro.applyNow}</Button>
            </Link>
          </div>
        </Container>
      </section>

      <section id="requirements" className="py-16 bg-gray-50">
        <Container>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Verification Requirements</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-gray-600">
            <p>• Valid ID document</p>
            <p>• Selfie verification</p>
            <p>• Service category and experience</p>
            <p>• Bank details for payouts (after approval)</p>
            <p className="text-sm text-gray-500 mt-6">Full verification is completed after registration.</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
