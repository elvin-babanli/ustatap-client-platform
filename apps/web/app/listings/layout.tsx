"use client";

import { usePathname } from "next/navigation";
import { BasicLayout } from "@/components/BasicLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicView = pathname?.startsWith("/listings/view");

  if (isPublicView) {
    return <BasicLayout>{children}</BasicLayout>;
  }

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER", "MASTER"]}>
      <BasicLayout>{children}</BasicLayout>
    </ProtectedRoute>
  );
}
