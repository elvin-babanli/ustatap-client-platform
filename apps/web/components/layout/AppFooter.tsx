"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Container } from "./Container";

export function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <Container>
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-lg font-bold text-primary-600">
              UstaTap
            </Link>
            <p className="text-gray-500 text-sm mt-1">
              {t.footer?.tagline ?? "Trusted local professionals"}
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Product</p>
            <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
              {t.footer?.howItWorks ?? "How it works"}
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              {t.footer?.categories ?? "Categories"}
            </Link>
            <Link href="/safety" className="text-gray-600 hover:text-gray-900">
              {t.footer?.safety ?? "Safety"}
            </Link>
          </nav>
          <nav className="flex flex-col gap-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Company</p>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              {t.footer?.about ?? "About"}
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              {t.footer?.contact ?? "Contact"}
            </Link>
          </nav>
          <nav className="flex flex-col gap-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Legal</p>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              {t.footer?.terms ?? "Terms"}
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              {t.footer?.privacy ?? "Privacy Policy"}
            </Link>
          </nav>
        </div>
        <div className="py-4 border-t border-gray-200">
          <span className="text-gray-500 text-sm">
            © {new Date().getFullYear()} UstaTap. All rights reserved.
          </span>
        </div>
      </Container>
    </footer>
  );
}
