import { IsOptional, IsString, MinLength } from "class-validator";

/**
 * Login with email or phone.
 * At least one of email or phone must be provided.
 */
export class LoginDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(1, { message: "Password is required" })
  password: string;
}
