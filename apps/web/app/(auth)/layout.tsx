import { AuthGuard } from "@/components/AuthGuard";
import { BasicLayout } from "@/components/BasicLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <BasicLayout>{children}</BasicLayout>
    </AuthGuard>
  );
}
