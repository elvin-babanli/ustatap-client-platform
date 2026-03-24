import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BasicLayout } from "@/components/BasicLayout";
import { Container } from "@/components/layout/Container";
import { CustomerSidebar } from "@/components/layout/CustomerSidebar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <BasicLayout>
        <Container>
          <div className="flex flex-col md:flex-row gap-8 py-8">
            <aside className="md:w-48 shrink-0">
              <CustomerSidebar />
            </aside>
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </Container>
      </BasicLayout>
    </ProtectedRoute>
  );
}
