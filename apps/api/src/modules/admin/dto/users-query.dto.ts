import { IsIn, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { UserRole, UserStatus } from "@prisma/client";

export class UsersQueryDto {
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
  @IsIn(Object.values(UserRole))
  role?: UserRole;

  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  @IsOptional()
  search?: string;
}
