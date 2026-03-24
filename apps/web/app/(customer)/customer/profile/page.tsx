"use client";

import { useEffect, useState } from "react";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/api/customer-profile";
import type { CustomerProfile } from "@/lib/api/customer-profile";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function CustomerProfilePage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCustomerProfile()
      .then((p) => {
        setProfile(p);
        setFirstName(p.firstName);
        setLastName(p.lastName);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateCustomerProfile({ firstName, lastName });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Container className="py-12 text-center">{t.common.loading}</Container>;
  if (error && !profile) return <Container className="py-12 text-red-600">{error}</Container>;

  return (
    <Container size="narrow" className="py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.nav.profile}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.firstName}</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.lastName}</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          {profile?.email && (
            <p className="text-sm text-gray-500">{t.profile.email}: {profile.email}</p>
          )}
          {profile?.phone && (
            <p className="text-sm text-gray-500">{t.profile.phone}: {profile.phone}</p>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? t.common.loading : t.common.save}
          </Button>
        </form>
      </Card>
    </Container>
  );
}
