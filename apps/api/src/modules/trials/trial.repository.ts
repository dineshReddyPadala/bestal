import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CreateTrialInput,
  RejectTrialInput,
  TrialFeedbackInput,
  TrialListFilters,
  UpdateTrialInput,
} from './trial.types.js';
import { parseSortParam } from './trial.mapper.js';

const trialInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
  client: { select: { id: true, name: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true } },
  assignedRecruiter: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.TrialRequestInclude;

export type TrialRecord = Prisma.TrialRequestGetPayload<{
  include: typeof trialInclude;
}>;

export class TrialRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    requestedById: number,
    data: CreateTrialInput,
  ): Promise<TrialRecord> {
    return this.prisma.trialRequest.create({
      data: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(data.candidateId),
        clientId: BigInt(data.clientId),
        requestedById: BigInt(requestedById),
        deploymentId: data.deploymentId ? BigInt(data.deploymentId) : undefined,
        roleTitle: data.roleTitle,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        durationDays: data.durationDays,
        trialType: data.trialType,
        maxTrialHours: data.maxTrialHours,
        taskDescription: data.taskDescription,
        successCriteria: data.successCriteria,
        feedback: data.feedback,
      },
      include: trialInclude,
    });
  }

  findById(organizationId: number, id: number): Promise<TrialRecord | null> {
    return this.prisma.trialRequest.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: trialInclude,
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateTrialInput,
  ): Promise<TrialRecord> {
    return this.prisma.trialRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.candidateId !== undefined && {
          candidateId: BigInt(data.candidateId),
        }),
        ...(data.clientId !== undefined && { clientId: BigInt(data.clientId) }),
        ...(data.deploymentId !== undefined && {
          deploymentId: data.deploymentId ? BigInt(data.deploymentId) : null,
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.roleTitle !== undefined && { roleTitle: data.roleTitle }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.durationDays !== undefined && { durationDays: data.durationDays }),
        ...(data.trialType !== undefined && { trialType: data.trialType }),
        ...(data.maxTrialHours !== undefined && { maxTrialHours: data.maxTrialHours }),
        ...(data.taskDescription !== undefined && {
          taskDescription: data.taskDescription,
        }),
        ...(data.successCriteria !== undefined && {
          successCriteria: data.successCriteria,
        }),
        ...(data.feedback !== undefined && { feedback: data.feedback }),
        ...(data.clientRating !== undefined && { clientRating: data.clientRating }),
        ...(data.convertedToPaid !== undefined && {
          convertedToPaid: data.convertedToPaid,
        }),
        ...(data.outcome !== undefined && { outcome: data.outcome }),
      },
      include: trialInclude,
    });
  }

  approve(organizationId: number, id: number): Promise<TrialRecord> {
    return this.prisma.trialRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        rejectedAt: null,
        rejectReason: null,
      },
      include: trialInclude,
    });
  }

  reject(
    organizationId: number,
    id: number,
    input: RejectTrialInput,
  ): Promise<TrialRecord> {
    return this.prisma.trialRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectReason: input.reason ?? null,
        approvedAt: null,
      },
      include: trialInclude,
    });
  }

  confirmCandidate(organizationId: number, id: number): Promise<TrialRecord> {
    return this.prisma.trialRequest.update({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: { candidateConfirmedAt: new Date() },
      include: trialInclude,
    });
  }

  submitFeedback(
    organizationId: number,
    id: number,
    input: TrialFeedbackInput,
  ): Promise<TrialRecord> {
    return this.prisma.trialRequest.update({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: {
        status: 'COMPLETED',
        feedback: input.feedback,
        clientRating: input.clientRating,
        outcome: input.decision,
        convertedToPaid: input.decision === 'CONTINUE',
      },
      include: trialInclude,
    });
  }

  async findMany(filters: TrialListFilters): Promise<{
    items: TrialRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.trialRequest.findMany({
        where,
        include: trialInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.trialRequest.count({ where }),
    ]);

    return { items, total };
  }

  candidateExists(organizationId: number, candidateId: number): Promise<boolean> {
    return this.prisma.candidate
      .findFirst({
        where: {
          id: BigInt(candidateId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  clientExists(organizationId: number, clientId: number): Promise<boolean> {
    return this.prisma.client
      .findFirst({
        where: {
          id: BigInt(clientId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  deploymentExists(organizationId: number, deploymentId: number): Promise<boolean> {
    return this.prisma.deployment
      .findFirst({
        where: {
          id: BigInt(deploymentId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private buildWhereClause(filters: TrialListFilters): Prisma.TrialRequestWhereInput {
    const where: Prisma.TrialRequestWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.candidateId) {
      where.candidateId = BigInt(filters.candidateId);
    }

    if (filters.clientId) {
      where.clientId = BigInt(filters.clientId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}
