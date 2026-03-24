"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Enter your email or phone");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(identifier.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.auth.forgotPassword}</h1>
        <p className="text-gray-600 mb-6">Enter your email or phone. We&apos;ll send you a reset code.</p>
        {!submitted ? (
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
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending..." : t.auth.sendCode}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-800">Check your inbox</p>
            <p className="text-sm text-green-700">
              If an account exists for that email or phone, a reset code has been sent.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Dev: code is logged in API server console.
            </p>
            <Link href="/reset-password" className="block mt-4">
              <Button variant="primary" size="lg">Enter reset code</Button>
            </Link>
          </div>
        )}
        <p className="mt-6 text-gray-600 text-sm">
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            ← {t.common.back} to login
          </Link>
        </p>
      </Container>
    </div>
  );
}
