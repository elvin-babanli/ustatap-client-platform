"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function HomeHero() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-sky-50 py-16 md:py-24">
      <Container size="narrow">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t.hero.title}
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            {t.hero.subtitle}
          </p>
          <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.hero.searchPlaceholder}
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="lg">
              {t.hero.search}
            </Button>
          </form>
          <p className="text-gray-500 text-sm mt-4">
            {t.home.trust1} · {t.home.trust2} · {t.home.trust3}
          </p>
        </div>
      </Container>
    </section>
  );
}
