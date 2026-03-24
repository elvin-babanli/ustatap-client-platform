import { PaymentStatus } from "@prisma/client";
import { PAYMENT_STATUS_TRANSITIONS } from "../constants/payment-status.constants";

export function canPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  const allowed = PAYMENT_STATUS_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}
