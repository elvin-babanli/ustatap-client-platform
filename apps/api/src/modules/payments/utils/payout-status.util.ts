import { PayoutStatus } from "@prisma/client";
import { PAYOUT_STATUS_TRANSITIONS } from "../constants/payout-status.constants";

export function canPayoutTransition(
  from: PayoutStatus,
  to: PayoutStatus,
): boolean {
  const allowed = PAYOUT_STATUS_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}
