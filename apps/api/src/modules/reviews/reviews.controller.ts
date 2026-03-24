import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ReviewsService } from "./reviews.service";
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReplyReviewDto,
  ReviewsQueryDto,
} from "./dto";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(
    @CurrentUser() userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(userId, dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyReviews(
    @CurrentUser() userId: string,
    @Query() query: ReviewsQueryDto,
  ) {
    return this.reviews.findCustomerReviews(userId, query);
  }

  @Get("me/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyReviewById(
    @CurrentUser() userId: string,
    @Param("id") id: string,
  ) {
    return this.reviews.findCustomerReviewById(userId, id);
  }

  @Patch("me/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  updateMyReview(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviews.updateCustomerReview(userId, id, dto);
  }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  reply(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviews.reply(userId, id, dto);
  }
}
