/**
 * Local-first listing catalog (mock marketplace until API exists).
 * Published rows are mirrored to a public key so all tabs on this browser see them in / and /search.
 */

import type { MasterSummary } from "@/lib/api/masters";
import type { UserListing } from "./user-listing.types";

const USER_NS = "ustatap_user_listings_v1";
const PUBLIC_CATALOG = "ustatap_public_listings_v1";

function userKey(userId: string) {
  return `${USER_NS}:${userId}`;
}

export function loadUserListings(userId: string): UserListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(userKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserListing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserListings(userId: string, rows: UserListing[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(userKey(userId), JSON.stringify(rows));
}

export function loadPublicListings(): UserListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PUBLIC_CATALOG);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserListing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePublicCatalog(rows: UserListing[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PUBLIC_CATALOG, JSON.stringify(rows));
  window.dispatchEvent(new Event("ustatap-listings-public-ch"));
}

export function upsertUserListing(listing: UserListing) {
  const rows = loadUserListings(listing.userId);
  const idx = rows.findIndex((r) => r.id === listing.id);
  if (idx >= 0) rows[idx] = listing;
  else rows.push(listing);
  saveUserListings(listing.userId, rows);
  syncPublicCatalogFromUser(listing.userId);
}

export function getUserListing(userId: string, id: string): UserListing | null {
  return loadUserListings(userId).find((r) => r.id === id) ?? null;
}

export function findPublishedListingById(id: string): UserListing | null {
  return loadPublicListings().find((r) => r.id === id) ?? null;
}

export function deleteUserListing(userId: string, id: string) {
  const rows = loadUserListings(userId).filter((r) => r.id !== id);
  saveUserListings(userId, rows);
  const pub = loadPublicListings().filter((r) => !(r.id === id && r.userId === userId));
  savePublicCatalog(pub);
}

function syncPublicCatalogFromUser(userId: string) {
  const mine = loadUserListings(userId);
  const others = loadPublicListings().filter((r) => r.userId !== userId);
  const published = mine.filter((r) => r.status === "published");
  savePublicCatalog([...others, ...published]);
}

const LOCAL_MASTER_PREFIX = "local-";

export function userListingToMasterSummary(l: UserListing): MasterSummary {
  const id = `${LOCAL_MASTER_PREFIX}${l.id}`;
  const cities = l.serviceAreas
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id,
    displayName: l.title,
    bio: l.description,
    experienceYears: l.experienceYears,
    avatarUrl: undefined,
    averageRating: 0,
    totalReviews: 0,
    completedJobsCount: 0,
    isAvailable: l.status === "published",
    verificationStatus: "NONE",
    createdAt: l.createdAt,
    masterServices: [
      {
        id: `${id}-svc`,
        basePrice: l.price,
        currency: l.currency || "AZN",
        service: {
          id: `${id}-cat`,
          nameEn: l.categorySlug.replace(/-/g, " "),
          nameAz: l.categorySlug.replace(/-/g, " "),
          nameRu: l.categorySlug.replace(/-/g, " "),
        },
      },
    ],
    serviceAreas: cities.length > 0 ? cities.map((city) => ({ city })) : [{ city: "" }],
  };
}

export function isLocalMasterId(id: string) {
  return id.startsWith(LOCAL_MASTER_PREFIX);
}

export function localListingIdFromMasterId(masterId: string) {
  return masterId.startsWith(LOCAL_MASTER_PREFIX) ? masterId.slice(LOCAL_MASTER_PREFIX.length) : "";
}

export function getPublicListingsAsMasters(): MasterSummary[] {
  return loadPublicListings().map(userListingToMasterSummary);
}
