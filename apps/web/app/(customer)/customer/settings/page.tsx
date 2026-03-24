"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { SettingsProfileForm } from "@/components/settings/SettingsProfileForm";

export default function CustomerSettingsPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.customerDashboard.settings}</h1>
      <div className="mt-8 space-y-10">
        <SettingsProfileForm />

        <section className="space-y-4 max-w-lg">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {t.settingsProfile.sectionPreferences}
          </h2>
          <div>
            <label htmlFor="settings-lang" className="mb-1 block text-sm font-medium text-gray-700">
              {t.searchFilters.language}
            </label>
            <select
              id="settings-lang"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "az" | "ru")}
            >
              <option value="en">English</option>
              <option value="az">Azərbaycan</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">{t.notifications.title}</span>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked readOnly className="rounded border-gray-300" />{" "}
                {t.settingsProfile.notificationsEmail}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked readOnly className="rounded border-gray-300" />{" "}
                {t.settingsProfile.notificationsPush}{" "}
                <span className="text-gray-400">({t.common.comingSoon})</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" readOnly className="rounded border-gray-300" />{" "}
                {t.settingsProfile.notificationsSms}
              </label>
            </div>
          </div>
        </section>

        <div className="max-w-lg">
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" type="button" disabled>
            {t.settingsProfile.deleteAccount}
          </Button>
          <p className="mt-2 text-xs text-gray-400">2FA ({t.common.comingSoon})</p>
        </div>
      </div>
    </>
  );
}
