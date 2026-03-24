import { getMasters } from "@/lib/api/masters";
import { getCategories } from "@/lib/api/categories";
import { HomeMapBrowse } from "./_components/HomeMapBrowse";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { TrustSection } from "./_components/TrustSection";

export default async function HomePage() {
  let masters: Awaited<ReturnType<typeof getMasters>>["items"] = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    const [mastersRes, categoriesData] = await Promise.all([
      getMasters({ limit: 100, sortBy: "ratingDesc", sortOrder: "desc" }),
      getCategories(),
    ]);
    masters = Array.isArray(mastersRes?.items) ? mastersRes.items : [];
    categories = Array.isArray(categoriesData) ? categoriesData : [];
  } catch {
    // API unreachable — map/list render empty + local published listings on client
  }

  const safeCategories = Array.isArray(categories) ? categories : [];
  const catForFilter = safeCategories.filter(
    (c) => c && typeof c === "object" && "slug" in c
  ) as { slug: string; nameEn?: string; nameAz?: string; nameRu?: string }[];

  return (
    <>
      <HomeMapBrowse initialMasters={masters} categories={catForFilter} />
      <TrustSection />
      <HowItWorksSection />
    </>
  );
}
