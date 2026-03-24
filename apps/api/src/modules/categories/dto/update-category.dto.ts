import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameAz?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameRu?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with hyphens",
  })
  @MaxLength(150)
  slug?: string;

  @IsOptional()
  @IsString()
  descriptionAz?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateCategoryStatusDto {
  @IsBoolean()
  isActive: boolean;
}
