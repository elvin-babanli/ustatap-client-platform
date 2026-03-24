import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { NotificationsService } from "./notifications.service";
import { NotificationsQueryDto } from "./dto";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  findMyNotifications(
    @CurrentUser() userId: string,
    @Query() query: NotificationsQueryDto,
  ) {
    return this.notifications.findForUser(userId, query);
  }

  @Patch("me/read-all")
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@CurrentUser() userId: string) {
    return this.notifications.markAllAsRead(userId);
  }

  @Patch("me/:id/read")
  @UseGuards(JwtAuthGuard)
  markAsRead(
    @CurrentUser() userId: string,
    @Param("id") id: string,
  ) {
    return this.notifications.markAsRead(userId, id);
  }

  @Get("me/unread-count")
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@CurrentUser() userId: string) {
    return this.notifications.getUnreadCount(userId);
  }
}
