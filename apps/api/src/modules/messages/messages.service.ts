import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertParticipant(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        masterProfile: { include: { user: true } },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    const isCustomer = booking.customerUserId === userId;
    const isMaster = booking.masterProfile.userId === userId;
    if (!isCustomer && !isMaster) {
      throw new ForbiddenException("You are not a participant in this booking");
    }
  }

  async findThreads(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const threads = await this.prisma.messageThread.findMany({
      where: {
        OR: [
          { booking: { customerUserId: userId } },
          { booking: { masterProfile: { userId } } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            customer: {
              select: {
                id: true,
                customerProfile: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
            masterProfile: { select: { id: true, displayName: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    return threads.map((t) => {
      const isCustomer = t.booking.customer.id === userId;
      const otherParty = isCustomer
        ? t.booking.masterProfile.displayName
        : [t.booking.customer.customerProfile?.firstName, t.booking.customer.customerProfile?.lastName]
            .filter(Boolean)
            .join(" ") || "Customer";
      return {
        id: t.id,
        bookingId: t.bookingId,
        booking: { ...t.booking, otherPartyDisplayName: otherParty },
        lastMessage: t.messages[0] ?? null,
        updatedAt: t.updatedAt,
      };
    });
  }

  async findThreadById(userId: string, threadId: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        booking: {
          select: {
            id: true,
            customerUserId: true,
            masterProfile: { select: { userId: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });
    if (!thread) throw new NotFoundException("Thread not found");

    const isParticipant =
      thread.booking.customerUserId === userId ||
      thread.booking.masterProfile.userId === userId;
    if (!isParticipant) {
      throw new ForbiddenException("Access denied");
    }

    return {
      id: thread.id,
      bookingId: thread.bookingId,
      messages: thread.messages,
    };
  }

  async getOrCreateThread(userId: string, bookingId: string) {
    await this.assertParticipant(userId, bookingId);

    let thread = await this.prisma.messageThread.findUnique({
      where: { bookingId },
    });

    if (!thread) {
      thread = await this.prisma.messageThread.create({
        data: { bookingId },
      });
    }

    return this.findThreadById(userId, thread.id);
  }

  async createMessage(userId: string, threadId: string, content: string) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      include: { booking: { include: { masterProfile: { include: { user: true } } } } },
    });
    if (!thread) throw new NotFoundException("Thread not found");

    const isParticipant =
      thread.booking.customerUserId === userId ||
      thread.booking.masterProfile.userId === userId;
    if (!isParticipant) {
      throw new ForbiddenException("Access denied");
    }

    const message = await this.prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        content: content.trim(),
      },
    });

    await this.prisma.messageThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
    };
  }
}
