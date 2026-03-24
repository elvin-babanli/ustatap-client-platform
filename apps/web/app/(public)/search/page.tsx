import { getMasters } from "@/lib/api/masters";
import { SearchPageClient } from "./_components/SearchPageClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorySlug?: string; city?: string; map?: string }>;
}) {
  const params = await searchParams;
  const mastersRes = await getMasters({
    limit: 50,
    categorySlug: params.categorySlug ?? undefined,
    city: params.city ?? undefined,
  });
  const masters = mastersRes.items;

  return (
    <SearchPageClient
      initialQuery={params.q ?? ""}
      initialCategory={params.categorySlug ?? ""}
      initialCity={params.city ?? ""}
      showMap={params.map === "1"}
      masters={masters}
    />
  );
}
