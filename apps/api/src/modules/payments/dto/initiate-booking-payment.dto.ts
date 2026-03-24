import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class InitiateBookingPaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}
