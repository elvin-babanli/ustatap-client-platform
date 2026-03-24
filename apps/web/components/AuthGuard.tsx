"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const ROLE_DASHBOARDS: Record<string, string> = {
  CUSTOMER: "/customer/dashboard",
  MASTER: "/master/dashboard",
  ADMIN: "/admin/dashboard",
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (accessToken && user) {
      const dashboard = ROLE_DASHBOARDS[user.role] ?? "/customer/dashboard";
      router.replace(dashboard);
    }
  }, [isReady, accessToken, user, router]);

  if (!isReady) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );
  }
  if (accessToken && user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Redirecting...
      </div>
    );
  }
  return <>{children}</>;
}
