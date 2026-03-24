import { BasicLayout } from "@/components/BasicLayout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BasicLayout>{children}</BasicLayout>;
}
