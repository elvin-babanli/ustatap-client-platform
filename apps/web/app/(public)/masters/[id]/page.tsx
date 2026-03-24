import { notFound } from "next/navigation";
import Link from "next/link";
import { getMasterById } from "@/lib/api/masters";
import { getMasterReviews } from "@/lib/api/reviews";
import { MasterProfileClient } from "./_components/MasterProfileClient";

export default async function MasterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const [master, reviewsRes] = await Promise.all([
      getMasterById(id),
      getMasterReviews(id, { limit: 10 }),
    ]);
    const reviews = Array.isArray(reviewsRes?.items) ? reviewsRes.items : (reviewsRes as { items?: unknown[] })?.items ?? [];
    return (
      <MasterProfileClient
        master={master}
        reviews={reviews}
      />
    );
  } catch {
    notFound();
  }
}
