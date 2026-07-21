import type { AuditAction, Prisma, PrismaClient } from '@prisma/client';

export type WriteAuditLogInput = {
  organizationId?: number | null;
  actorId?: number | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: number | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export class AuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async write(input: WriteAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        organizationId:
          input.organizationId != null ? BigInt(input.organizationId) : null,
        actorId: input.actorId != null ? BigInt(input.actorId) : null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId != null ? BigInt(input.resourceId) : null,
        description: input.description ?? null,
        metadata: input.metadata ?? undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  }
}
