import { getMasters } from "@/lib/api/masters";
import { getCategories } from "@/lib/api/categories";
import { HomeHero } from "./_components/HomeHero";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { HomeCategoriesSection } from "./_components/HomeCategoriesSection";
import { FeaturedMastersSection } from "./_components/FeaturedMastersSection";
import { MapPreviewSection } from "./_components/MapPreviewSection";
import { TrustSection } from "./_components/TrustSection";
import { HomeCTASection } from "./_components/HomeCTASection";

export default async function HomePage() {
  const [mastersRes, categories] = await Promise.all([
    getMasters({ limit: 6, sortBy: "averageRating", sortOrder: "desc" }),
    getCategories(),
  ]);

  const topMasters = mastersRes.items;
  const homeCategories = categories.filter((c) =>
    ["electrician", "plumber", "ac-repair", "cleaning"].includes(c.slug)
  );
  if (homeCategories.length === 0) {
    homeCategories.push(...categories.slice(0, 4));
  }

  return (
    <>
      <HomeHero />
      <HowItWorksSection />
      <HomeCategoriesSection categories={homeCategories} />
      <FeaturedMastersSection masters={topMasters} />
      <MapPreviewSection masters={topMasters} />
      <TrustSection />
      <HomeCTASection />
    </>
  );
}
