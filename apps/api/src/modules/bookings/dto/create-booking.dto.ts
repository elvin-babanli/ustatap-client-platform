import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Currency } from "@prisma/client";
import { CreateBookingAddressDto } from "./create-booking-address.dto";
import { CreateBookingAttachmentDto } from "./create-booking-attachment.dto";

export class CreateBookingDto {
  @IsUUID()
  masterProfileId: string;

  @IsUUID()
  masterServiceId: string;

  @ValidateIf((o) => !o.address)
  @IsUUID()
  addressId?: string;

  @ValidateIf((o) => !o.addressId)
  @ValidateNested()
  @Type(() => CreateBookingAddressDto)
  address?: CreateBookingAddressDto;

  @IsString()
  scheduledDate: string;

  @IsString()
  scheduledTimeStart: string;

  @IsString()
  scheduledTimeEnd: string;

  @IsOptional()
  @IsString()
  problemDescription?: string;

  @IsNumber()
  @Min(0)
  estimatedPrice: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingAttachmentDto)
  attachments?: CreateBookingAttachmentDto[];
}
