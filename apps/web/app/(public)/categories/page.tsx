import { getCategories } from "@/lib/api/categories";
import { getMasters } from "@/lib/api/masters";
import { CategoriesPageClient } from "./_components/CategoriesPageClient";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const [categories, mastersRes] = await Promise.all([
    getCategories(),
    view === "masters" ? getMasters({ limit: 24 }) : Promise.resolve(null),
  ]);
  return (
    <CategoriesPageClient
      categories={categories}
      masters={view === "masters" ? mastersRes?.items ?? [] : null}
    />
  );
}
