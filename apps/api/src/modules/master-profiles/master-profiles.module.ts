import { Module } from "@nestjs/common";
import { MasterProfilesController } from "./master-profiles.controller";
import { MasterProfilesService } from "./master-profiles.service";
import { ReviewsModule } from "../reviews/reviews.module";

@Module({
  imports: [ReviewsModule],
  controllers: [MasterProfilesController],
  providers: [MasterProfilesService],
  exports: [MasterProfilesService],
})
export class MasterProfilesModule {}
