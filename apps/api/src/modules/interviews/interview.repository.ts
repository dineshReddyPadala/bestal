import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CancelInterviewInput,
  ConfirmInterviewInput,
  CreateInterviewInput,
  InterviewListFilters,
  UpdateInterviewInput,
} from './interview.types.js';
import { parseSortParam } from './interview.mapper.js';

const interviewInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
  client: { select: { id: true, name: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.InterviewRequestInclude;

export type InterviewRecord = Prisma.InterviewRequestGetPayload<{
  include: typeof interviewInclude;
}>;

export class InterviewRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    requestedById: number,
    data: CreateInterviewInput,
  ): Promise<InterviewRecord> {
    return this.prisma.interviewRequest.create({
      data: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(data.candidateId),
        clientId: BigInt(data.clientId),
        requestedById: BigInt(requestedById),
        type: data.type,
        shortlistId: data.shortlistId ? BigInt(data.shortlistId) : undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        durationMinutes: data.durationMinutes,
        timezone: data.timezone,
        location: data.location,
        notes: data.notes,
      },
      include: interviewInclude,
    });
  }

  findById(
    organizationId: number,
    id: number,
  ): Promise<InterviewRecord | null> {
    return this.prisma.interviewRequest.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: interviewInclude,
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateInterviewInput,
  ): Promise<InterviewRecord> {
    const statusTimestamps: Prisma.InterviewRequestUpdateInput = {};

    if (data.status === 'COMPLETED') {
      statusTimestamps.completedAt = new Date();
    }

    if (data.status === 'CANCELLED') {
      statusTimestamps.cancelledAt = new Date();
    }

    return this.prisma.interviewRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.scheduledAt !== undefined && {
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        }),
        ...(data.durationMinutes !== undefined && {
          durationMinutes: data.durationMinutes,
        }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.meetingLink !== undefined && { meetingLink: data.meetingLink }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.feedback !== undefined && { feedback: data.feedback }),
        ...(data.cancelReason !== undefined && { cancelReason: data.cancelReason }),
        ...statusTimestamps,
      },
      include: interviewInclude,
    });
  }

  confirm(
    organizationId: number,
    id: number,
    data: ConfirmInterviewInput,
  ): Promise<InterviewRecord> {
    return this.prisma.interviewRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'CONFIRMED',
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes,
        timezone: data.timezone,
        location: data.location,
        meetingLink: data.meetingLink,
      },
      include: interviewInclude,
    });
  }

  cancel(
    organizationId: number,
    id: number,
    input: CancelInterviewInput,
  ): Promise<InterviewRecord> {
    return this.prisma.interviewRequest.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: input.cancelReason ?? null,
      },
      include: interviewInclude,
    });
  }

  async findMany(filters: InterviewListFilters): Promise<{
    items: InterviewRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.interviewRequest.findMany({
        where,
        include: interviewInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.interviewRequest.count({ where }),
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

  shortlistExists(organizationId: number, shortlistId: number): Promise<boolean> {
    return this.prisma.shortlist
      .findFirst({
        where: {
          id: BigInt(shortlistId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private buildWhereClause(
    filters: InterviewListFilters,
  ): Prisma.InterviewRequestWhereInput {
    const where: Prisma.InterviewRequestWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.candidateId) {
      where.candidateId = BigInt(filters.candidateId);
    }

    if (filters.clientId) {
      where.clientId = BigInt(filters.clientId);
    }

    if (filters.shortlistId) {
      where.shortlistId = BigInt(filters.shortlistId);
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
