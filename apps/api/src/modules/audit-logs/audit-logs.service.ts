import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { maskSensitiveMetadata } from "../../common/utils/audit-metadata.util";

export interface AuditLogCreateInput {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogCreateInput) {
    const safeMetadata = maskSensitiveMetadata(input.metadata);
    return this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        metadata: (Object.keys(safeMetadata).length
          ? safeMetadata
          : undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  }
}
