"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProSignup = searchParams.get("role") === "master";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [offersOptIn, setOffersOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = searchParams.get("role");
    if (role != null && role !== "master") {
      router.replace("/register");
    }
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone) {
      setError("Phone is required");
      return;
    }
    if (!firstName || !lastName) {
      setError("First and last name are required");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!acceptTerms) {
      setError("Please accept the Terms and Privacy Policy");
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        role: isProSignup ? "MASTER" : "CUSTOMER",
        firstName,
        lastName,
        email: email || undefined,
        phone,
        password,
      });
      const dash: Record<string, string> = {
        CUSTOMER: "/customer/dashboard",
        MASTER: "/master/dashboard",
        ADMIN: "/admin/dashboard",
      };
      router.replace(dash[res.user.role] ?? "/customer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength =
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

  return (
    <div className="min-h-[60vh] flex items-center py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {t.auth.unifiedRegisterTitle}
        </h1>
        <p className="text-gray-600 text-sm mb-6">{t.auth.unifiedRegisterHint}</p>
        {isProSignup && (
          <p className="text-gray-600 text-sm mb-6 rounded-lg bg-primary-50/80 border border-primary-100 px-4 py-3">
            {t.auth.proSignupHint}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.firstName}</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.lastName}</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.phone}</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.email}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="text-xs text-gray-500 mt-1">{t.auth.emailOptionalHint}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.auth.passwordStrength}: {passwordStrength ? "✓ Strong" : "Min 8 chars, upper, lower, number"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.auth.confirmPassword}</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">{t.auth.termsAccept}</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={offersOptIn}
              onChange={(e) => setOffersOptIn(e.target.checked)}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">{t.auth.offersOptIn}</span>
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? "Creating account..." : t.nav.register}
          </Button>
        </form>
        <p className="mt-6 text-gray-600 text-sm text-center border-t border-gray-100 pt-6">
          {t.auth.offerServicesFooter}{" "}
          <Link href="/register?role=master" className="text-primary-600 font-medium hover:underline">
            {t.auth.offerServicesLink}
          </Link>
        </p>
        <p className="mt-4 text-gray-600 text-sm">
          Have an account?{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </Container>
    </div>
  );
}
