"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

type Props = {
  /** MASTER shows verification shortcut */
  role?: string | null;
};

export function SettingsProfileForm({ role }: Props) {
  const { t } = useI18n();
  const { user, isReady } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName("");
    setLastName("");
  }, [user]);

  if (!isReady) {
    return <p className="text-sm text-gray-500">{t.common.loading}</p>;
  }
  if (!user) {
    return <p className="text-sm text-gray-500">{t.common.error}</p>;
  }

  return (
    <div className="space-y-8 max-w-lg">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {t.settingsProfile.sectionProfile}
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-xs text-center text-gray-400 px-1 leading-tight"
            aria-hidden
          >
            {t.settingsProfile.avatarHint}
          </div>
          <p className="text-xs text-gray-500">{t.settingsProfile.syncNote}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-first" className="mb-1 block text-sm font-medium text-gray-700">
              {t.settingsProfile.firstName}
            </label>
            <Input
              id="settings-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label htmlFor="settings-last" className="mb-1 block text-sm font-medium text-gray-700">
              {t.settingsProfile.lastName}
            </label>
            <Input
              id="settings-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div>
          <label htmlFor="settings-phone" className="mb-1 block text-sm font-medium text-gray-700">
            {t.profile.phone}
          </label>
          <Input id="settings-phone" value={user.phone ?? ""} readOnly className="bg-gray-50" />
        </div>
        <div>
          <label htmlFor="settings-email" className="mb-1 block text-sm font-medium text-gray-700">
            {t.profile.email}
          </label>
          <Input
            id="settings-email"
            type="email"
            value={user.email ?? ""}
            readOnly
            className="bg-gray-50"
          />
        </div>
        <Button type="button" variant="primary" size="sm" disabled className="opacity-80">
          {t.common.save}
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {t.settingsProfile.sectionSecurity}
        </h2>
        <Link href="/forgot-password">
          <Button type="button" variant="outline" size="sm">
            {t.settingsProfile.changePassword}
          </Button>
        </Link>
      </section>

      {role === "MASTER" ? (
        <section className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <p className="text-sm font-medium text-gray-800">{t.settingsProfile.masterVerification}</p>
          <Link href="/master/verification">
            <Button type="button" variant="outline" size="sm">
              {t.settingsProfile.goToVerification}
            </Button>
          </Link>
        </section>
      ) : null}
    </div>
  );
}
