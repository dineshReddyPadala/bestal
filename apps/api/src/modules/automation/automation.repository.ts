import { Prisma, type AutomationJob, type PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  AutomationJobListFilters,
  CreateAutomationJobInput,
  UpdateAutomationJobInput,
} from './automation.types.js';

export type AutomationJobRecord = AutomationJob;

export class AutomationRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(input: CreateAutomationJobInput): Promise<AutomationJobRecord> {
    return this.prisma.automationJob.create({
      data: {
        candidateId:
          input.candidateId != null ? BigInt(input.candidateId) : null,
        documentId: input.documentId != null ? BigInt(input.documentId) : null,
        jobType: input.jobType,
        status: 'PENDING',
        workflowName: input.workflowName ?? null,
        workflowVersion: input.workflowVersion ?? null,
        inputReference:
          input.inputReference === undefined
            ? undefined
            : (input.inputReference as Prisma.InputJsonValue),
        requestedById: BigInt(input.requestedBy),
        maxAttempts: input.maxAttempts,
        attempts: 0,
      },
    });
  }

  findById(id: number): Promise<AutomationJobRecord | null> {
    return this.prisma.automationJob.findFirst({
      where: { id: BigInt(id) },
    });
  }

  /**
   * Org-scoped lookup: job must belong to a candidate in the organization,
   * or have no candidate (rare) and be requested by a user in that org.
   */
  findByIdForOrganization(
    organizationId: number,
    id: number,
  ): Promise<AutomationJobRecord | null> {
    return this.prisma.automationJob.findFirst({
      where: {
        id: BigInt(id),
        OR: [
          {
            candidate: {
              organizationId: BigInt(organizationId),
              deletedAt: null,
            },
          },
          {
            candidateId: null,
            requestedBy: {
              memberships: {
                some: {
                  organizationId: BigInt(organizationId),
                  isActive: true,
                },
              },
            },
          },
        ],
      },
    });
  }

  update(
    id: number,
    data: UpdateAutomationJobInput,
  ): Promise<AutomationJobRecord> {
    const patch: Prisma.AutomationJobUncheckedUpdateInput = {};

    if (data.status !== undefined) patch.status = data.status;
    if (data.workflowName !== undefined) patch.workflowName = data.workflowName;
    if (data.workflowVersion !== undefined) {
      patch.workflowVersion = data.workflowVersion;
    }
    if (data.n8nExecutionId !== undefined) {
      patch.n8nExecutionId = data.n8nExecutionId;
    }
    if (data.inputReference !== undefined) {
      patch.inputReference =
        data.inputReference === null
          ? Prisma.DbNull
          : data.inputReference;
    }
    if (data.outputReference !== undefined) {
      patch.outputReference =
        data.outputReference === null
          ? Prisma.DbNull
          : data.outputReference;
    }
    if (data.attempts !== undefined) patch.attempts = data.attempts;
    if (data.errorCode !== undefined) patch.errorCode = data.errorCode;
    if (data.errorMessage !== undefined) patch.errorMessage = data.errorMessage;
    if (data.startedAt !== undefined) patch.startedAt = data.startedAt;
    if (data.completedAt !== undefined) patch.completedAt = data.completedAt;

    return this.prisma.automationJob.update({
      where: { id: BigInt(id) },
      data: patch,
    });
  }

  async findMany(filters: AutomationJobListFilters): Promise<{
    items: AutomationJobRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.automationJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.automationJob.count({ where }),
    ]);

    return { items, total };
  }

  private buildWhereClause(
    filters: AutomationJobListFilters,
  ): Prisma.AutomationJobWhereInput {
    const where: Prisma.AutomationJobWhereInput = {
      OR: [
        {
          candidate: {
            organizationId: BigInt(filters.organizationId),
            deletedAt: null,
          },
        },
        {
          candidateId: null,
          requestedBy: {
            memberships: {
              some: {
                organizationId: BigInt(filters.organizationId),
                isActive: true,
              },
            },
          },
        },
      ],
    };

    if (filters.candidateId != null) {
      where.candidateId = BigInt(filters.candidateId);
    }
    if (filters.documentId != null) {
      where.documentId = BigInt(filters.documentId);
    }
    if (filters.jobType) {
      where.jobType = filters.jobType;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}
