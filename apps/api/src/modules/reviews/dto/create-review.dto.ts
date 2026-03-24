import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { RATING_MAX, RATING_MIN } from "../constants";

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  bookingId!: string;

  @IsInt()
  @Min(RATING_MIN)
  @Max(RATING_MAX)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
