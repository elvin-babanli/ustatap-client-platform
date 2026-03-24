import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { CreateThreadDto } from "./dto/create-thread.dto";

@ApiTags("messages")
@Controller("messages")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER, UserRole.MASTER)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get("threads")
  findThreads(@CurrentUser() userId: string) {
    return this.messages.findThreads(userId);
  }

  @Get("threads/by-booking/:bookingId")
  getThreadByBooking(
    @CurrentUser() userId: string,
    @Param("bookingId") bookingId: string,
  ) {
    return this.messages.getOrCreateThread(userId, bookingId);
  }

  @Get("threads/:id")
  findThreadById(
    @CurrentUser() userId: string,
    @Param("id") threadId: string,
  ) {
    return this.messages.findThreadById(userId, threadId);
  }

  @Post("threads")
  createThread(
    @CurrentUser() userId: string,
    @Body() dto: CreateThreadDto,
  ) {
    return this.messages.getOrCreateThread(userId, dto.bookingId);
  }

  @Post("threads/:id/messages")
  createMessage(
    @CurrentUser() userId: string,
    @Param("id") threadId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messages.createMessage(userId, threadId, dto.content);
  }
}
