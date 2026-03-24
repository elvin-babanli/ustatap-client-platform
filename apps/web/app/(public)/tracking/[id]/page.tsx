"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

const STEPS = ["requested", "accepted", "onTheWay", "arrived", "inProgress", "completed"] as const;

export default function TrackingPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useI18n();

  const labels: Record<string, string> = {
    requested: t.tracking.requested,
    accepted: t.tracking.accepted,
    onTheWay: t.tracking.onTheWay,
    arrived: t.tracking.arrived,
    inProgress: t.tracking.inProgress,
    completed: t.tracking.completed,
  };

  const currentStep = 2;

  return (
    <div className="py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-gray-900">{t.tracking.title}</h1>
        <p className="text-gray-500 mt-1">Order #{id}</p>
        <div className="mt-8 space-y-4">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  i <= currentStep ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{labels[step]}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">{t.orderConfirmation.estimatedArrival}: —</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Link href={`/messages/booking/${id}`}>
            <Button variant="primary">{t.orderConfirmation.messagePro}</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Live map tracking {t.common.availableSoon}.
        </p>
      </Container>
    </div>
  );
}
