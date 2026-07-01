import type { BackgroundCheck, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  BackgroundCheckListFilters,
  CreateBackgroundCheckInput,
  UpdateBackgroundCheckInput,
} from './background-check.types.js';
import { parseSortParam } from './background-check.mapper.js';

const backgroundCheckInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.BackgroundCheckInclude;

export type BackgroundCheckRecord = Prisma.BackgroundCheckGetPayload<{
  include: typeof backgroundCheckInclude;
}>;

export class BackgroundCheckRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    requestedById: number,
    data: CreateBackgroundCheckInput,
  ): Promise<BackgroundCheckRecord> {
    return this.prisma.backgroundCheck.create({
      data: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(data.candidateId),
        requestedById: BigInt(requestedById),
        type: data.type,
        status: data.status,
        provider: data.provider,
        externalReferenceId: data.externalReferenceId,
        resultSummary: data.resultSummary,
        initiatedAt: data.initiatedAt ? new Date(data.initiatedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
      include: backgroundCheckInclude,
    });
  }

  findById(
    organizationId: number,
    id: number,
  ): Promise<BackgroundCheckRecord | null> {
    return this.prisma.backgroundCheck.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: backgroundCheckInclude,
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateBackgroundCheckInput,
  ): Promise<BackgroundCheckRecord> {
    return this.prisma.backgroundCheck.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.provider !== undefined && { provider: data.provider }),
        ...(data.externalReferenceId !== undefined && {
          externalReferenceId: data.externalReferenceId,
        }),
        ...(data.resultSummary !== undefined && {
          resultSummary: data.resultSummary,
        }),
        ...(data.initiatedAt !== undefined && {
          initiatedAt: data.initiatedAt ? new Date(data.initiatedAt) : null,
        }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
        }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
      },
      include: backgroundCheckInclude,
    });
  }

  softDelete(organizationId: number, id: number): Promise<BackgroundCheck> {
    return this.prisma.backgroundCheck.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(filters: BackgroundCheckListFilters): Promise<{
    items: BackgroundCheckRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.backgroundCheck.findMany({
        where,
        include: backgroundCheckInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.backgroundCheck.count({ where }),
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

  private buildWhereClause(
    filters: BackgroundCheckListFilters,
  ): Prisma.BackgroundCheckWhereInput {
    const where: Prisma.BackgroundCheckWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.candidateId) {
      where.candidateId = BigInt(filters.candidateId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return where;
  }
}
