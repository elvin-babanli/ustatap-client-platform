import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BasicLayout } from "@/components/BasicLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <BasicLayout>{children}</BasicLayout>
    </ProtectedRoute>
  );
}
