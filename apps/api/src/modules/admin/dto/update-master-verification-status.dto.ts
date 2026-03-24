import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { VerificationStatus } from "@prisma/client";

export class UpdateMasterVerificationStatusDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason?: string;
}
