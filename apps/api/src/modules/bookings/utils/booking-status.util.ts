import { BookingStatus } from "@prisma/client";
import { UserRole } from "@prisma/client";
import {
  BOOKING_STATUS_TRANSITIONS,
  CUSTOMER_CANCELABLE_STATUSES,
} from "../constants";

export function canTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus,
  role: UserRole,
): boolean {
  const allowed = BOOKING_STATUS_TRANSITIONS[fromStatus]?.[role];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}

export function canCustomerCancel(status: BookingStatus): boolean {
  return CUSTOMER_CANCELABLE_STATUSES.includes(status);
}
