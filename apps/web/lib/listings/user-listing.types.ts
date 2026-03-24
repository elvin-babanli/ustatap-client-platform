export type UserListingStatus = "draft" | "published";

export interface UserListing {
  id: string;
  userId: string;
  title: string;
  categorySlug: string;
  description: string;
  serviceAreas: string;
  price: number;
  currency: string;
  experienceYears: number;
  contactNote: string;
  status: UserListingStatus;
  createdAt: string;
  updatedAt: string;
}
