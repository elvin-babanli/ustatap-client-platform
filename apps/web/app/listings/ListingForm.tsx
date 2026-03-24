"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { UserListing } from "@/lib/listings/user-listing.types";
import { upsertUserListing, deleteUserListing } from "@/lib/listings/catalog";

const CATEGORIES = [
  { value: "electrician", key: "electrician" },
  { value: "plumber", key: "plumber" },
  { value: "ac-repair", key: "acRepair" },
  { value: "cleaning", key: "cleaning" },
  { value: "renovation", key: "renovation" },
  { value: "painting", key: "painting" },
];

export function ListingForm({
  initial,
}: {
  initial?: UserListing | null;
}) {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const catLabels = t.categories as Record<string, string>;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? "electrician");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [serviceAreas, setServiceAreas] = useState(initial?.serviceAreas ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [experienceYears, setExperienceYears] = useState(String(initial?.experienceYears ?? ""));
  const [currency, setCurrency] = useState(initial?.currency ?? "AZN");

  if (!user?.id) return null;
  const userId = user.id;

  const id = initial?.id ?? "";
  const isEdit = Boolean(initial);

  function buildListing(status: UserListing["status"]): UserListing {
    const now = new Date().toISOString();
    const lid = id || crypto.randomUUID();
    return {
      id: lid,
      userId,
      title: title.trim() || "Untitled",
      categorySlug,
      description: description.trim(),
      serviceAreas: serviceAreas.trim(),
      price: Math.max(0, parseInt(price, 10) || 0),
      currency,
      experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
      contactNote: "",
      status,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
  }

  function handleSaveDraft() {
    upsertUserListing(buildListing("draft"));
    router.push("/listings");
  }

  function handlePublish() {
    upsertUserListing(buildListing("published"));
    router.push("/listings");
  }

  function handleDelete() {
    if (!initial?.id) return;
    if (typeof window !== "undefined" && !window.confirm(t.listingFlow.deleteConfirm)) return;
    deleteUserListing(userId, initial.id);
    router.push("/listings");
  }

  return (
    <div className="max-w-xl space-y-5 py-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldTitle}</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldCategory}</label>
        <Select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="w-full">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {catLabels[c.key] ?? c.value}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldDescription}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldAreas}</label>
        <Input value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} placeholder="Baku, Sumqayit" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldPrice}</label>
          <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldCurrency}</label>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="AZN">AZN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingFlow.fieldExperience}</label>
        <Input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
      </div>
      <p className="text-sm text-gray-600">{t.listingFlow.contactFromAccount}</p>
      <p className="text-xs text-gray-500">
        {t.listingFlow.chooseFile}: <span className="font-medium text-amber-800/90">{t.listingFlow.imageUploadNote}</span>
      </p>
      <input type="file" accept="image/*" multiple disabled className="text-sm text-gray-400 w-full" />

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          {t.listingFlow.saveDraft}
        </Button>
        <Button type="button" variant="primary" onClick={handlePublish}>
          {t.listingFlow.publish}
        </Button>
        <Link href="/listings">
          <Button type="button" variant="ghost">
            {t.listingFlow.backToMine}
          </Button>
        </Link>
        {isEdit && (
          <Button type="button" variant="danger" className="ml-auto" onClick={handleDelete}>
            {t.listingFlow.delete}
          </Button>
        )}
      </div>
    </div>
  );
}
