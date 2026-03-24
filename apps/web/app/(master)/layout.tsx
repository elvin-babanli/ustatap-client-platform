import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BasicLayout } from "@/components/BasicLayout";
import { Container } from "@/components/layout/Container";
import { MasterSidebar } from "@/components/layout/MasterSidebar";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["MASTER"]}>
      <BasicLayout>
        <Container>
          <div className="flex flex-col md:flex-row gap-8 py-8">
            <aside className="md:w-48 shrink-0">
              <MasterSidebar />
            </aside>
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </Container>
      </BasicLayout>
    </ProtectedRoute>
  );
}
