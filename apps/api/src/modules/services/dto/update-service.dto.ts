import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";

export class UpdateServiceDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

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
}

export class UpdateServiceStatusDto {
  @IsBoolean()
  isActive: boolean;
}
