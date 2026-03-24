import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Currency } from "@prisma/client";

export class MasterServiceItemDto {
  @IsUUID()
  serviceId: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMasterServicesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MasterServiceItemDto)
  services: MasterServiceItemDto[];
}
