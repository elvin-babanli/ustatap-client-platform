"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { listingsHrefForRole } from "@/lib/navigation/account-hrefs";
import { clsx } from "clsx";

export function CustomerSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: listingsHrefForRole("CUSTOMER"), label: t.nav.myListings },
    { href: "/customer/bookings", label: t.nav.myBookings },
    { href: "/customer/favorites", label: t.nav.favorites },
    { href: "/customer/settings", label: t.customerDashboard.settings },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
