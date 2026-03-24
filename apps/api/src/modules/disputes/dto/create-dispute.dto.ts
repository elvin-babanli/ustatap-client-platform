import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export enum DisputeIssueType {
  OVERCHARGE = "OVERCHARGE",
  BAD_QUALITY = "BAD_QUALITY",
  NO_SHOW = "NO_SHOW",
  SAFETY_ISSUE = "SAFETY_ISSUE",
  PAYMENT_ISSUE = "PAYMENT_ISSUE",
  OTHER = "OTHER",
}

export class CreateDisputeDto {
  @IsUUID()
  bookingId: string;

  @IsEnum(DisputeIssueType)
  issueType: DisputeIssueType;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  reason: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[];
}
