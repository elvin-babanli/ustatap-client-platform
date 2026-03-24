"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getMasterById, type MasterSummary } from "@/lib/api/masters";
import { createBooking } from "@/lib/api/bookings";
import { useI18n } from "@/lib/i18n";
import { format, addDays } from "date-fns";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaymentPlaceholder } from "./PaymentPlaceholder";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00",
];

export function BookingFlow({
  masterId,
  preselectedServiceId,
}: {
  masterId: string;
  preselectedServiceId: string;
}) {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [master, setMaster] = useState<MasterSummary | null>(null);
  const [loading, setLoading] = useState(!!masterId);
  const [serviceId, setServiceId] = useState(preselectedServiceId);
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [city, setCity] = useState("Baku");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<{ id: string; price: number; currency: string } | null>(null);

  useEffect(() => {
    if (!masterId) {
      setLoading(false);
      return;
    }
    getMasterById(masterId)
      .then(setMaster)
      .catch(() => setError(t.common.error))
      .finally(() => setLoading(false));
  }, [masterId, t.common.error]);

  const selectedService = master?.masterServices?.find((ms) => ms.id === serviceId || ms.service.id === serviceId);
  const price = selectedService?.basePrice ?? 0;
  const currency = selectedService?.currency ?? "AZN";

  if (!masterId) {
    return (
      <Container size="narrow" className="py-12">
        <EmptyState
          title={t.home.selectMaster}
          actionLabel={t.home.browseMasters}
          actionHref="/search"
        />
      </Container>
    );
  }

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error || !master) {
    return (
      <Container size="narrow" className="py-12">
        <Card>
          <p className="text-red-600 text-center">{error || "Master not found"}</p>
          <Link href="/search" className="block mt-4 text-center text-primary-600">
            {t.home.browseMasters} →
          </Link>
        </Card>
      </Container>
    );
  }

  const minDate = format(addDays(new Date(), 1), "yyyy-MM-dd");

  async function handleSubmit() {
    if (!accessToken) {
      router.push("/login?redirect=/booking?masterId=" + masterId);
      return;
    }
    if (!master || !selectedService || !date || !timeStart) {
      setError("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const [h, m] = timeStart.split(":").map(Number);
      const endHour = h + 1;
      const timeEnd = `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
      const timeStartFormatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
      const result = await createBooking({
        masterProfileId: master.id,
        masterServiceId: selectedService.id,
        address: {
          country: "AZ",
          city,
          street: address || undefined,
          label: address || undefined,
        },
        scheduledDate: date,
        scheduledTimeStart: timeStartFormatted,
        scheduledTimeEnd: timeEnd,
        problemDescription: description || undefined,
        estimatedPrice: price,
        currency: currency as "AZN",
      }) as { id?: string };
      setBookingSuccess({ id: result?.id ?? "", price, currency });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [t.booking.selectService, t.booking.selectDateTime, `${t.booking.address} & ${t.booking.description}`];

  if (bookingSuccess) {
    return (
      <Container size="narrow" className="py-8">
        <Card>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">{t.booking.success}</h1>
            <p className="text-gray-600 mt-1">{master.displayName}</p>
          </div>
          <PaymentPlaceholder
            bookingId={bookingSuccess.id}
            price={bookingSuccess.price}
            currency={bookingSuccess.currency}
            onSkip={() => router.push("/customer/dashboard")}
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container size="narrow" className="py-8">
      <Card>
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">{t.booking.title}</h1>
          <p className="text-gray-600 mt-1">{master.displayName}</p>
          <div className="flex gap-4 mt-3">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i + 1 <= step ? "text-primary-600 font-medium" : "text-gray-400"}`}
              >
                {i + 1}. {steps[i]}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <>
              <h2 className="font-semibold text-gray-900">1. {t.booking.selectService}</h2>
              <div className="space-y-2">
                {master.masterServices?.map((ms) => (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => { setServiceId(ms.id); setStep(2); }}
                    className="w-full flex justify-between items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 text-left transition-colors"
                  >
                    <span>{ms.service.nameEn}</span>
                    <span className="font-medium text-primary-600">{ms.basePrice} {ms.currency}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-semibold text-gray-900">2. {t.booking.selectDateTime}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.booking.date}</label>
                  <Input
                    type="date"
                    value={date}
                    min={minDate}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.booking.time}</label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeStart(slot)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          timeStart === slot ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)}>{t.common.back}</Button>
                  <Button variant="primary" onClick={() => setStep(3)} disabled={!date || !timeStart}>
                    {t.common.next}
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-semibold text-gray-900">3. {t.booking.address} & {t.booking.description}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.booking.city}</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.booking.addressLabel}</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, apartment" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.booking.description}</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.booking.descriptionPlaceholder}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={urgent}
                    onChange={(e) => setUrgent(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="urgent" className="text-sm text-gray-700">
                    {t.booking.urgentPlaceholder}
                  </label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {t.search.addPhoto}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-gray-600">{t.booking.price}</span>
                  <span className="font-bold text-primary-600 text-lg">{price} {currency}</span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  🔒 {t.trust.securePayment} · 🛡️ {t.trust.platformProtected}
                </p>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)}>{t.common.back}</Button>
                  <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? t.common.loading : t.booking.confirm}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </Container>
  );
}
