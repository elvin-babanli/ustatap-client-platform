import { BookingStatus } from "@prisma/client";

/**
 * Allowed status transitions per role.
 * Key: fromStatus, Value: { role: toStatus[] }
 */
export const BOOKING_STATUS_TRANSITIONS: Record<
  BookingStatus,
  Partial<Record<"CUSTOMER" | "MASTER" | "ADMIN", BookingStatus[]>>
> = {
  [BookingStatus.PENDING]: {
    CUSTOMER: [BookingStatus.CANCELLED],
    MASTER: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  },
  [BookingStatus.CONFIRMED]: {
    CUSTOMER: [BookingStatus.CANCELLED],
    MASTER: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  },
  [BookingStatus.IN_PROGRESS]: {
    MASTER: [BookingStatus.COMPLETED],
  },
  [BookingStatus.COMPLETED]: {},
  [BookingStatus.CANCELLED]: {},
  [BookingStatus.DISPUTED]: {},
};

/**
 * Statuses from which customer can cancel
 */
export const CUSTOMER_CANCELABLE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
];

/**
 * Terminal statuses - no further transitions
 */
export const TERMINAL_STATUSES: BookingStatus[] = [
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
];
