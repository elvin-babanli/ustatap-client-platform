"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { AuthGateModal } from "@/components/AuthGateModal";
import { isFavorite, toggleFavoriteId } from "@/lib/favorites/local-favorites";

export function FavoriteStarButton({
  masterId,
  className = "",
  size = "md",
}: {
  masterId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const { user, accessToken, isReady } = useAuth();
  const [gate, setGate] = useState(false);
  const [on, setOn] = useState(false);
  const authed = isReady && Boolean(accessToken);

  useEffect(() => {
    if (!user?.id) {
      setOn(false);
      return;
    }
    setOn(isFavorite(user.id, masterId));
    const sync = () => setOn(isFavorite(user.id, masterId));
    window.addEventListener("ustatap-favorites-changed", sync);
    return () => window.removeEventListener("ustatap-favorites-changed", sync);
  }, [user?.id, masterId]);

  const btnClass = size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg";

  return (
    <>
      <button
        type="button"
        aria-label={t.masterCard.saveListingAria}
        aria-pressed={on}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!authed || !user?.id) {
            setGate(true);
            return;
          }
          toggleFavoriteId(user.id, masterId);
          setOn(isFavorite(user.id, masterId));
        }}
        className={`inline-flex items-center justify-center rounded-full border border-gray-200/80 bg-white/95 shadow-sm transition-colors ${
          on ? "text-amber-500 border-amber-200" : "text-gray-700 hover:bg-gray-50"
        } ${btnClass} ${className}`}
      >
        {on ? "★" : "☆"}
      </button>
      <AuthGateModal isOpen={gate} onClose={() => setGate(false)} action="favorites" />
    </>
  );
}
