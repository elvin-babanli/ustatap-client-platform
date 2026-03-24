"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const ROLE_DASHBOARDS: Record<string, string> = {
  CUSTOMER: "/customer/dashboard",
  MASTER: "/master/dashboard",
  ADMIN: "/admin/dashboard",
};

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, accessToken, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      const dashboard = ROLE_DASHBOARDS[user.role] ?? "/";
      router.replace(dashboard);
    }
  }, [isReady, accessToken, user, allowedRoles, router]);

  if (!isReady || !accessToken) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );
  }
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Redirecting...
      </div>
    );
  }
  return <>{children}</>;
}
