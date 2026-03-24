"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !code.trim() || !newPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(identifier.trim(), code.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login?reset=success"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center py-12">
        <Container size="narrow">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="font-medium text-green-800">Password reset successful</p>
            <p className="text-sm text-green-700 mt-2">Redirecting to login...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.auth.resetPassword}</h1>
        <p className="text-gray-600 mb-6">Enter the code you received and your new password.</p>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.profile.email} or {t.profile.phone}
            </label>
            <Input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="email@example.com or +994..."
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reset code</label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.auth.newPassword}</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : t.auth.resetPassword}
          </Button>
        </form>
        <p className="mt-6 text-gray-600 text-sm">
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            ← {t.common.back} to login
          </Link>
        </p>
        <p className="mt-2 text-gray-500 text-xs">
          <Link href="/forgot-password" className="hover:underline">Request a new code</Link>
        </p>
      </Container>
    </div>
  );
}
