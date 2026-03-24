import { Decimal } from "@prisma/client/runtime/library";

/**
 * Calculates commission amount from payment amount and rate.
 * Uses Decimal for precision.
 */
export function calculateCommissionAmount(
  paymentAmount: Decimal | number,
  rate: number,
): Decimal {
  const amount = typeof paymentAmount === "number"
    ? new Decimal(paymentAmount)
    : paymentAmount;
  return amount.times(rate);
}
