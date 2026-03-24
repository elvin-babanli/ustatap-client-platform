import { IsString, MinLength } from "class-validator";

export class VerifyResetCodeDto {
  @IsString()
  @MinLength(6)
  code: string;

  @IsString()
  @MinLength(1)
  identifier: string; // email or phone
}
