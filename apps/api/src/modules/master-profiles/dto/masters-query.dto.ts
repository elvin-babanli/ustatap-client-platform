import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export type MastersSortBy =
  | "createdAt"
  | "averageRating"
  | "completedJobsCount"
  | "basePrice";

export class MastersQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  serviceSlug?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

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

  /** Price range - filters masters with at least one service in range */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  /** Minimum average rating */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  /** Verified only - APPROVED verification status */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verifiedOnly?: boolean;

  /** Urgent available - placeholder, graceful no-op if no data */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  urgentAvailable?: boolean;

  /** Language - placeholder, soft support via profile */
  @IsOptional()
  @IsString()
  language?: string;

  /**
   * Sort: recommended (default), priceAsc, ratingDesc, nearest, fastestArrival.
   * nearest/fastestArrival are placeholders when geo/ETA data missing.
   */
  @IsOptional()
  @IsString()
  sortBy?: "recommended" | "priceAsc" | "ratingDesc" | "createdAt" | "nearest" | "fastestArrival";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}
