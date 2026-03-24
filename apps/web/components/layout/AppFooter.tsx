"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "./Container";

export function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <Container>
        <div className="py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/" className="text-lg font-bold text-primary-600">
              UstaTap
            </Link>
            <p className="text-gray-500 text-sm mt-1">
              {t.footer?.tagline ?? "Trusted local professionals"}
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              {t.footer?.about ?? "About"}
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              {t.footer?.contact ?? "Contact"}
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              {t.footer?.terms ?? "Terms"}
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              {t.footer?.privacy ?? "Privacy"}
            </Link>
          </nav>
        </div>
        <div className="py-4 border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} UstaTap. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
