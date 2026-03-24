"use client";

import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";

const testimonials = [
  { name: "Ali M.", role: "Baku", text: "Found a great electrician in 10 minutes. Very professional and on time.", rating: 5 },
  { name: "Nigar K.", role: "Baku", text: "Platform made it easy to compare prices and book same-day cleaning.", rating: 5 },
  { name: "Sergey V.", role: "Sumgait", text: "Verified masters give peace of mind. Will use again.", rating: 5 },
];

export function TestimonialsBlock() {
  const { t } = useI18n();

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <h2 className="text-2xl font-bold text-gray-900 text-center">{t.home.realReviews}</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="p-6 bg-white rounded-xl border border-gray-200"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-amber-500">★</span>
                ))}
              </div>
              <p className="text-gray-700">{item.text}</p>
              <p className="mt-3 text-sm text-gray-500 font-medium">{item.name}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
