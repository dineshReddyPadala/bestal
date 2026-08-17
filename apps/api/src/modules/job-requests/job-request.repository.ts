import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CreatePublicJobRequestInput,
  JobRequestListFilters,
  UpdateJobRequestInput,
} from './job-request.types.js';
import { parseSortParam } from './job-request.mapper.js';

const jobRequestInclude = {
  assignedTo: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.JobRequestInclude;

export type JobRequestRecord = Prisma.JobRequestGetPayload<{
  include: typeof jobRequestInclude;
}>;

export class JobRequestRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  createPublic(
    organizationId: number,
    data: CreatePublicJobRequestInput,
  ): Promise<JobRequestRecord> {
    return this.prisma.jobRequest.create({
      data: {
        organizationId: BigInt(organizationId),
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        requiredSkills: data.requiredSkills,
        experienceRequired: data.experienceRequired,
        numberOfResources: data.numberOfResources,
        companyName: data.companyName,
        website: data.website,
        contactName: data.contactName,
        contactEmail: data.contactEmail.toLowerCase(),
        contactPhone: data.contactPhone,
        status: 'SUBMITTED',
        source: 'WEBSITE',
      },
      include: jobRequestInclude,
    });
  }

  findById(organizationId: number, id: number): Promise<JobRequestRecord | null> {
    return this.prisma.jobRequest.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: jobRequestInclude,
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateJobRequestInput,
  ): Promise<JobRequestRecord> {
    return this.prisma.jobRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.assignedToId !== undefined && {
          assignedToId: data.assignedToId ? BigInt(data.assignedToId) : null,
        }),
        ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes }),
      },
      include: jobRequestInclude,
    });
  }

  async findMany(filters: JobRequestListFilters): Promise<{
    items: JobRequestRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.jobRequest.findMany({
        where,
        include: jobRequestInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.jobRequest.count({ where }),
    ]);

    return { items, total };
  }

  assigneeExists(organizationId: number, userId: number): Promise<boolean> {
    return this.prisma.membership
      .findFirst({
        where: {
          organizationId: BigInt(organizationId),
          userId: BigInt(userId),
          isActive: true,
          role: { in: ['ADMIN', 'SALES', 'SUPER_ADMIN'] },
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private buildWhereClause(filters: JobRequestListFilters): Prisma.JobRequestWhereInput {
    const where: Prisma.JobRequestWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
      };
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { jobTitle: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { contactEmail: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
