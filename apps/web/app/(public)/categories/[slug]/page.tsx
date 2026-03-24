import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getMasters } from "@/lib/api/masters";
import Link from "next/link";
import { CategoryDetailClient } from "./_components/CategoryDetailClient";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const [category, mastersRes] = await Promise.all([
      getCategoryBySlug(slug),
      getMasters({ categorySlug: slug, limit: 24 }),
    ]);
    return (
      <CategoryDetailClient
        category={category}
        masters={mastersRes.items}
      />
    );
  } catch {
    notFound();
  }
}
