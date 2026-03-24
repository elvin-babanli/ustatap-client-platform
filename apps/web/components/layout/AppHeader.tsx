"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { clsx } from "clsx";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import {
  bookingsHrefForRole,
  favoritesHrefForRole,
  listingsHrefForRole,
  messagesHrefForRole,
  settingsHrefForRole,
} from "@/lib/navigation/account-hrefs";

export function AppHeader() {
  const { user, accessToken, isReady } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    router.push("/");
    setMenuOpen(false);
  }

  const role = user?.role;
  const authed = Boolean(isReady && accessToken && user);

  return (
    <header ref={menuRef} className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <Container>
        <div className="flex items-center justify-between gap-6 h-14">
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold text-primary-600 hover:text-primary-700 tracking-tight"
          >
            UstaTap
          </Link>

          <div className="flex-1 hidden md:block" aria-hidden="true" />

          <div className="flex items-center">
            <button
              type="button"
              aria-label={t.nav.menu}
              aria-expanded={menuOpen}
              className="p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
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

        {menuOpen && (
          <div className="md:absolute md:right-4 md:top-full md:mt-2 md:w-64 md:rounded-xl md:border md:border-gray-200 md:bg-white md:shadow-lg py-2 border-t border-gray-100 md:border-t-0">
            <nav className="flex flex-col gap-0.5 px-2">
              {authed ? (
                <>
                  <Link
                    href={listingsHrefForRole(role)}
                    className="px-4 py-2.5 text-gray-900 font-medium hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.myListings}
                  </Link>
                  <Link
                    href={bookingsHrefForRole(role)}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.myBookings}
                  </Link>
                  <Link
                    href={favoritesHrefForRole(role)}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.favorites}
                  </Link>
                  <Link
                    href={messagesHrefForRole(role)}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.messages.title}
                  </Link>
                  <Link
                    href={settingsHrefForRole(role)}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {role === "MASTER" ? t.masterDashboard.settings : t.customerDashboard.settings}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                  >
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1 px-2 py-1">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start font-medium">
                      {t.nav.login}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      {t.nav.signUp}
                    </Button>
                  </Link>
                </div>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                <p className="px-2 text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t.nav.languageMenu}</p>
                <div className="flex flex-wrap gap-1">
                  {locales.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLocale(l as Locale)}
                      className={clsx(
                        "px-2.5 py-1 text-xs font-medium rounded-md",
                        locale === l ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {localeLabels[l as Locale]}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
