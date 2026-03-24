import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ReplyReviewDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  comment!: string;
}
