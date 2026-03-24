"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function HowItWorksPage() {
  const { t } = useI18n();

  return (
    <div className="py-16">
      <Container size="narrow">
        <h1 className="text-3xl font-bold text-center text-gray-900">{t.home.howItWorks}</h1>
        <div className="mt-12 space-y-12">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t.home.step1}</h2>
              <p className="text-gray-600 mt-2">Browse categories or search for the service you need. View verified professionals with ratings and reviews.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t.home.step2}</h2>
              <p className="text-gray-600 mt-2">Choose a date and time that works for you. Add your address and describe the job.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t.home.step3}</h2>
              <p className="text-gray-600 mt-2">Pay securely through the platform. Your payment is protected until the job is completed.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">4</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t.home.step4}</h2>
              <p className="text-gray-600 mt-2">After the service, leave a review to help others and support great professionals.</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link href="/search">
            <Button variant="primary" size="lg">{t.home.findPro}</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
