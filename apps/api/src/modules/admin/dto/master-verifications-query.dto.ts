import { IsIn, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { VerificationStatus } from "@prisma/client";

export class MasterVerificationsQueryDto {
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
  @IsIn(Object.values(VerificationStatus))
  verificationStatus?: VerificationStatus;

  @IsOptional()
  masterProfileId?: string;

  @IsOptional()
  search?: string;
}
