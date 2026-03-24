import { ReviewStatus } from "@prisma/client";

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * New reviews are PUBLISHED by default for better UX.
 * Moderation/HIDDEN flow can be added later.
 */
export const DEFAULT_REVIEW_STATUS: ReviewStatus = ReviewStatus.PUBLISHED;

export const EDITABLE_REVIEW_STATUSES: ReviewStatus[] = [ReviewStatus.PUBLISHED];
