import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MaxLength(150)
  nameAz: string;

  @IsString()
  @MaxLength(150)
  nameEn: string;

  @IsString()
  @MaxLength(150)
  nameRu: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with hyphens",
  })
  @MaxLength(150)
  slug: string;

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
