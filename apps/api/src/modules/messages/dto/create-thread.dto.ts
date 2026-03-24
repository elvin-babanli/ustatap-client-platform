import { IsUUID } from "class-validator";

export class CreateThreadDto {
  @IsUUID()
  bookingId: string;
}
