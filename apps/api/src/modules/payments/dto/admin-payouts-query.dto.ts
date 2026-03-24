import { IsIn, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { PayoutStatus } from "@prisma/client";

export class AdminPayoutsQueryDto {
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
  @IsIn(Object.values(PayoutStatus))
  status?: PayoutStatus;

  @IsOptional()
  masterProfileId?: string;

  @IsOptional()
  dateFrom?: string;

  @IsOptional()
  dateTo?: string;
}
