import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BasicLayout } from "@/components/BasicLayout";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["MASTER"]}>
      <BasicLayout>{children}</BasicLayout>
    </ProtectedRoute>
  );
}
