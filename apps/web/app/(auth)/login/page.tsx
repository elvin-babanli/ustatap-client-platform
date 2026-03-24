"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email && !phone) {
      setError("Email or phone is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email: email || undefined, phone: phone || undefined, password });
      const dash: Record<string, string> = { CUSTOMER: "/customer/dashboard", MASTER: "/master/dashboard", ADMIN: "/admin/dashboard" };
      router.replace(dash[res.user.role] ?? "/customer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.nav.login}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t.profile.email} or {t.profile.phone}
            </label>
            <Input
              id="email"
              type="text"
              value={email || phone}
              onChange={(e) => {
                const v = e.target.value;
                if (v.includes("@")) {
                  setEmail(v);
                  setPhone("");
                } else {
                  setPhone(v);
                  setEmail("");
                }
              }}
              placeholder="email@example.com or +994..."
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">{t.auth.rememberMe}</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
              {t.auth.forgotPassword}
            </Link>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? "Signing in..." : t.nav.login}
          </Button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" disabled className="opacity-60">
              {t.auth.continueWithGoogle} ({t.common.comingSoon})
            </Button>
            <Button type="button" variant="outline" disabled className="opacity-60">
              {t.auth.continueWithFacebook} ({t.common.comingSoon})
            </Button>
          </div>
        </form>
        <p className="mt-6 text-gray-600 text-sm">
          No account?{" "}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">
            {t.nav.signUp}
          </Link>
        </p>
      </Container>
    </div>
  );
}
