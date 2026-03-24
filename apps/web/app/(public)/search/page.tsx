import { getMasters } from "@/lib/api/masters";
import { SearchPageClient } from "./_components/SearchPageClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categorySlug?: string;
    city?: string;
    map?: string;
    verifiedOnly?: string;
    priceMin?: string;
    priceMax?: string;
    minRating?: string;
    sortBy?: string;
    availableOnly?: string;
  }>;
}) {
  const params = await searchParams;
  const priceMin = params.priceMin ? Number(params.priceMin) : undefined;
  const priceMax = params.priceMax ? Number(params.priceMax) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;
  const sortBy = params.sortBy ?? "nearest";

  let masters: Awaited<ReturnType<typeof getMasters>>["items"] = [];
  try {
    const mastersRes = await getMasters({
      limit: 50,
      categorySlug: params.categorySlug ?? undefined,
      city: params.city ?? undefined,
      verifiedOnly: params.verifiedOnly === "1",
      priceMin: priceMin && !Number.isNaN(priceMin) ? priceMin : undefined,
      priceMax: priceMax && !Number.isNaN(priceMax) ? priceMax : undefined,
      minRating: minRating && !Number.isNaN(minRating) ? minRating : undefined,
      sortBy: sortBy as "recommended" | "priceAsc" | "ratingDesc" | "createdAt" | "nearest" | "fastestArrival",
    });
    masters = Array.isArray(mastersRes?.items) ? mastersRes.items : [];
  } catch {
    // API down or bad payload — client can still show local catalog / empty state
  }

  return (
    <SearchPageClient
      initialQuery={params.q ?? ""}
      initialCategory={params.categorySlug ?? ""}
      initialCity={params.city ?? ""}
      showMap={params.map === "1"}
      initialVerifiedOnly={params.verifiedOnly === "1"}
      initialPriceMin={params.priceMin ?? ""}
      initialPriceMax={params.priceMax ?? ""}
      initialMinRating={params.minRating ?? ""}
      initialSortBy={sortBy}
      initialAvailabilityOnly={params.availableOnly !== "0"}
      masters={masters}
    />
  );
}
