import { IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateBookingAttachmentDto {
  @IsUrl()
  @MaxLength(500)
  fileUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fileType?: string;
}
