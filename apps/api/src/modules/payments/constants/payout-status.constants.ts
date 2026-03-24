import { PayoutStatus } from "@prisma/client";

/**
 * Allowed payout status transitions.
 */
export const PAYOUT_STATUS_TRANSITIONS: Record<
  PayoutStatus,
  PayoutStatus[]
> = {
  [PayoutStatus.PENDING]: [
    PayoutStatus.PROCESSING,
    PayoutStatus.CANCELLED,
  ],
  [PayoutStatus.PROCESSING]: [
    PayoutStatus.COMPLETED,
    PayoutStatus.FAILED,
  ],
  [PayoutStatus.COMPLETED]: [],
  [PayoutStatus.FAILED]: [],
  [PayoutStatus.CANCELLED]: [],
};
