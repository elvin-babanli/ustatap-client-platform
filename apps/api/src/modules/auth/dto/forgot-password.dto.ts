import { IsString, MinLength } from "class-validator";

/**
 * Email or phone - identifier for the account.
 */
export class ForgotPasswordDto {
  @IsString()
  @MinLength(1)
  identifier: string; // email or phone
}
