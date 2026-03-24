import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateBookingAttachmentDto } from "./create-booking-attachment.dto";

export class AddBookingAttachmentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingAttachmentDto)
  attachments: CreateBookingAttachmentDto[];
}
