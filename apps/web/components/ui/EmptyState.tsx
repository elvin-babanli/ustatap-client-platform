"use client";

import Link from "next/link";

const EMPTY_ICONS: Record<string, string> = {
  bookings: "📋",
  notifications: "🔔",
  reviews: "⭐",
  masters: "👤",
  default: "📭",
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  compact,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: keyof typeof EMPTY_ICONS;
  compact?: boolean;
}) {
  const iconChar = icon ? EMPTY_ICONS[icon] ?? EMPTY_ICONS.default : EMPTY_ICONS.default;
  return (
    <div className={`text-center rounded-xl border border-gray-200 ${compact ? "py-8 px-4 bg-transparent border-0" : "py-16 px-6 bg-gray-50/80"}`}>
      <span className="text-4xl block mb-3 opacity-60">{iconChar}</span>
      <p className="text-gray-600 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
