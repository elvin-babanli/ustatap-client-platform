import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BasicLayout } from "@/components/BasicLayout";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <BasicLayout>{children}</BasicLayout>
    </ProtectedRoute>
  );
}
