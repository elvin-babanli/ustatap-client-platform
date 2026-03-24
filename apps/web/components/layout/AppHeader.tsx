"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { clsx } from "clsx";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";

export function AppHeader() {
  const { user, accessToken, isReady } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "MASTER"
        ? "/master/dashboard"
        : "/customer/dashboard";

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/categories", label: t.nav.categories },
    { href: "/search", label: t.nav.search },
    { href: "/categories?view=masters", label: t.nav.masters },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-primary-600 hover:text-primary-700 tracking-tight"
          >
            UstaTap
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5">
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l as Locale)}
                  className={clsx(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                    locale === l ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {localeLabels[l as Locale]}
                </button>
              ))}
            </div>

            {isReady && (
              <>
                {accessToken && user ? (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href={dashboardHref}>
                      <Button variant="ghost" size="sm">
                        {t.nav.dashboard}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      {t.nav.logout}
                    </Button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        {t.nav.login}
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" size="sm">
                        {t.nav.register}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 px-4 py-2 mt-2">
                {locales.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l as Locale)}
                    className={clsx(
                      "px-2.5 py-1 text-xs font-medium rounded-md",
                      locale === l ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {localeLabels[l as Locale]}
                  </button>
                ))}
              </div>
              {isReady && accessToken && user && (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Link
                    href={dashboardHref}
                    className="py-2 text-gray-700 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.dashboard}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="py-2 text-left text-gray-700 font-medium"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              )}
              {isReady && !accessToken && (
                <div className="flex gap-2 px-4 pt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm">{t.nav.login}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="sm">{t.nav.register}</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
