import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  AddShortlistCandidateInput,
  CreateShortlistInput,
  ShortlistListFilters,
  UpdateShortlistCandidateInput,
} from './shortlist.types.js';
import { parseSortParam } from './shortlist.mapper.js';

const shortlistInclude = {
  client: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.ShortlistInclude;

const shortlistCandidateInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
  addedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.ShortlistCandidateInclude;

const shortlistWithCandidatesInclude = {
  ...shortlistInclude,
  candidates: {
    where: { deletedAt: null },
    include: shortlistCandidateInclude,
    orderBy: [{ rank: 'asc' as const }, { createdAt: 'asc' as const }],
  },
} satisfies Prisma.ShortlistInclude;

export type ShortlistRecord = Prisma.ShortlistGetPayload<{
  include: typeof shortlistInclude;
}>;

export type ShortlistWithCandidatesRecord = Prisma.ShortlistGetPayload<{
  include: typeof shortlistWithCandidatesInclude;
}>;

export type ShortlistCandidateRecord = Prisma.ShortlistCandidateGetPayload<{
  include: typeof shortlistCandidateInclude;
}>;

export type ShortlistListRecord = ShortlistRecord & {
  _count: { candidates: number };
};

export class ShortlistRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    createdById: number,
    data: CreateShortlistInput,
  ): Promise<ShortlistWithCandidatesRecord> {
    return this.prisma.shortlist.create({
      data: {
        organizationId: BigInt(organizationId),
        clientId: BigInt(data.clientId),
        createdById: BigInt(createdById),
        title: data.title,
        description: data.description,
        roleTitle: data.roleTitle,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: shortlistWithCandidatesInclude,
    });
  }

  findById(
    organizationId: number,
    id: number,
  ): Promise<ShortlistWithCandidatesRecord | null> {
    return this.prisma.shortlist.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: shortlistWithCandidatesInclude,
    });
  }

  async findMany(filters: ShortlistListFilters): Promise<{
    items: ShortlistListRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.shortlist.findMany({
        where,
        include: {
          ...shortlistInclude,
          _count: {
            select: {
              candidates: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.shortlist.count({ where }),
    ]);

    return { items, total };
  }

  findCandidateEntry(
    shortlistId: number,
    candidateId: number,
  ): Promise<ShortlistCandidateRecord | null> {
    return this.prisma.shortlistCandidate.findFirst({
      where: {
        shortlistId: BigInt(shortlistId),
        candidateId: BigInt(candidateId),
        deletedAt: null,
      },
      include: shortlistCandidateInclude,
    });
  }

  findCandidateEntryIncludingDeleted(
    shortlistId: number,
    candidateId: number,
  ): Promise<ShortlistCandidateRecord | null> {
    return this.prisma.shortlistCandidate.findUnique({
      where: {
        shortlistId_candidateId: {
          shortlistId: BigInt(shortlistId),
          candidateId: BigInt(candidateId),
        },
      },
      include: shortlistCandidateInclude,
    });
  }

  addCandidate(
    shortlistId: number,
    addedById: number,
    data: AddShortlistCandidateInput,
  ): Promise<ShortlistCandidateRecord> {
    return this.prisma.shortlistCandidate.create({
      data: {
        shortlistId: BigInt(shortlistId),
        candidateId: BigInt(data.candidateId),
        addedById: BigInt(addedById),
        rank: data.rank ?? 0,
        status: data.status,
        notes: data.notes,
        clientNotes: data.clientNotes,
      },
      include: shortlistCandidateInclude,
    });
  }

  restoreCandidate(
    entryId: number,
    addedById: number,
    data: AddShortlistCandidateInput,
  ): Promise<ShortlistCandidateRecord> {
    return this.prisma.shortlistCandidate.update({
      where: { id: BigInt(entryId) },
      data: {
        deletedAt: null,
        addedById: BigInt(addedById),
        rank: data.rank ?? 0,
        status: data.status,
        notes: data.notes,
        clientNotes: data.clientNotes,
        isApproved: null,
        approvedAt: null,
      },
      include: shortlistCandidateInclude,
    });
  }

  updateCandidate(
    shortlistId: number,
    candidateId: number,
    data: UpdateShortlistCandidateInput,
  ): Promise<ShortlistCandidateRecord> {
    const approvalFields: Prisma.ShortlistCandidateUpdateInput = {};

    if (data.isApproved === true) {
      approvalFields.approvedAt = new Date();
    } else if (data.isApproved === false || data.isApproved === null) {
      approvalFields.approvedAt = null;
    }

    return this.prisma.shortlistCandidate.update({
      where: {
        shortlistId_candidateId: {
          shortlistId: BigInt(shortlistId),
          candidateId: BigInt(candidateId),
        },
      },
      data: {
        ...(data.rank !== undefined && { rank: data.rank }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.clientNotes !== undefined && { clientNotes: data.clientNotes }),
        ...(data.isApproved !== undefined && { isApproved: data.isApproved }),
        ...approvalFields,
      },
      include: shortlistCandidateInclude,
    });
  }

  removeCandidate(shortlistId: number, candidateId: number): Promise<void> {
    return this.prisma.shortlistCandidate
      .update({
        where: {
          shortlistId_candidateId: {
            shortlistId: BigInt(shortlistId),
            candidateId: BigInt(candidateId),
          },
        },
        data: { deletedAt: new Date() },
      })
      .then(() => undefined);
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

  findClientIdByContactEmail(
    organizationId: number,
    email: string,
  ): Promise<number | null> {
    return this.prisma.client
      .findFirst({
        where: {
          organizationId: BigInt(organizationId),
          contactEmail: email.toLowerCase(),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then((row) => (row ? Number(row.id) : null));
  }

  async findClientIdForUser(
    organizationId: number,
    userId: number,
    email: string,
  ): Promise<number | null> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: BigInt(userId),
        organizationId: BigInt(organizationId),
        role: 'CLIENT',
        isActive: true,
      },
      select: { clientId: true },
    });
    if (membership?.clientId != null) {
      return Number(membership.clientId);
    }
    return this.findClientIdByContactEmail(organizationId, email);
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
    filters: ShortlistListFilters,
  ): Prisma.ShortlistWhereInput {
    const where: Prisma.ShortlistWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.clientId) {
      where.clientId = BigInt(filters.clientId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}
