import { IsIn, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { PaymentStatus } from "@prisma/client";

export class AdminPaymentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(Object.values(PaymentStatus))
  status?: PaymentStatus;

  @IsOptional()
  bookingId?: string;

  @IsOptional()
  payerUserId?: string;

  @IsOptional()
  provider?: string;

  @IsOptional()
  dateFrom?: string;

  @IsOptional()
  dateTo?: string;
}
