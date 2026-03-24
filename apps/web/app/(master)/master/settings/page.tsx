"use client";

import { useI18n } from "@/lib/i18n";
import { SettingsProfileForm } from "@/components/settings/SettingsProfileForm";

export default function MasterSettingsPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t.masterDashboard.settings}</h1>
      <div className="mt-8 space-y-10">
        <SettingsProfileForm role="MASTER" />

        <section className="space-y-4 max-w-lg">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {t.settingsProfile.sectionPreferences}
          </h2>
          <div>
            <label htmlFor="master-settings-lang" className="mb-1 block text-sm font-medium text-gray-700">
              {t.searchFilters.language}
            </label>
            <select
              id="master-settings-lang"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "az" | "ru")}
            >
              <option value="en">English</option>
              <option value="az">Azərbaycan</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </section>
      </div>
    </>
  );
}
