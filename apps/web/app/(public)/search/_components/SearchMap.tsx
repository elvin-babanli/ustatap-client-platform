"use client";

import { MastersMap } from "@/app/(public)/_components/MastersMap";
import type { MasterSummary } from "@/lib/api/masters";

export function SearchMap({ masters }: { masters: MasterSummary[] }) {
  return <MastersMap masters={masters} height="100%" interactive />;
}
