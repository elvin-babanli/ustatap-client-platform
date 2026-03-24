import { IsEnum, IsNotEmpty, IsOptional, IsUrl, MaxLength } from "class-validator";
import { DocumentType } from "@prisma/client";

export class CreateVerificationDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(500)
  fileUrl!: string;

  @IsOptional()
  @MaxLength(255)
  originalFileName?: string;
}
