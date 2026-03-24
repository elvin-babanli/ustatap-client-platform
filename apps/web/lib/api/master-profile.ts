/**
 * Master profile API client (authenticated)
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/master-profile${path}`;

export interface MasterServiceItem {
  serviceId: string;
  basePrice: number;
  currency: "AZN" | "USD" | "EUR" | "RUB";
  isActive?: boolean;
}

export async function getMasterProfile(accessToken: string) {
  const res = await fetch(getUrl("/me"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateMasterProfile(
  accessToken: string,
  data: {
    displayName?: string;
    bio?: string;
    experienceYears?: number;
    avatarUrl?: string;
    isAvailable?: boolean;
  }
) {
  const res = await fetch(getUrl("/me"), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function updateMasterServices(
  accessToken: string,
  services: MasterServiceItem[]
) {
  const res = await fetch(getUrl("/me/services"), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ services }),
  });
  if (!res.ok) throw new Error("Failed to update services");
  return res.json();
}
