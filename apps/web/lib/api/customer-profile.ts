/**
 * Customer profile API client (uses auth from store)
 */

import { apiClient } from "./client";
import { authenticatedJson } from "./request";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/customer-profile${path}`;

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  preferredLanguage: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  phone?: string;
  status?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

export interface UpdateCustomerProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  preferredLanguage?: "AZ" | "EN" | "RU";
  dateOfBirth?: string;
  notes?: string;
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return authenticatedJson<CustomerProfile>(getUrl("/me"));
}

export async function updateCustomerProfile(
  data: UpdateCustomerProfileData
): Promise<CustomerProfile> {
  return authenticatedJson<CustomerProfile>(getUrl("/me"), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
