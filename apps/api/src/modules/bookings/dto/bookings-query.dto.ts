import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { BookingStatus } from "@prisma/client";

export class BookingsQueryDto {
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
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  sortBy?: "createdAt" | "scheduledDate" | "updatedAt";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

export class AdminBookingsQueryDto extends BookingsQueryDto {
  @IsOptional()
  @IsUUID()
  customerUserId?: string;

  @IsOptional()
  @IsUUID()
  masterProfileId?: string;
}
