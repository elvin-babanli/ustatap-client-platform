import { PaymentStatus } from "@prisma/client";

/**
 * Allowed payment status transitions.
 * Key: fromStatus, Value: allowed toStatus[]
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.COMPLETED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [],
  [PaymentStatus.CANCELLED]: [],
  [PaymentStatus.REFUNDED]: [],
};

export const PAYMENT_TERMINAL_STATUSES: PaymentStatus[] = [
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
  PaymentStatus.REFUNDED,
];

export const PAYMENT_ACTIVE_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
];
