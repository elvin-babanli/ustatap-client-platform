import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export enum RegisterRole {
  CUSTOMER = "CUSTOMER",
  MASTER = "MASTER",
}

export class RegisterDto {
  @IsEnum(RegisterRole, { message: "Role must be CUSTOMER or MASTER" })
  role: RegisterRole = RegisterRole.CUSTOMER;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Matches(/^\+?[0-9\s-]{10,20}$/, {
    message: "Phone must be a valid format",
  })
  phone: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase and number",
  })
  password: string;

  @IsString()
  @MinLength(1, { message: "First name is required" })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1, { message: "Last name is required" })
  @MaxLength(100)
  lastName: string;

  // Master-specific fields (optional for CUSTOMER)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  startingPrice?: number;
}
