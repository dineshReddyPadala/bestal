import type { BackgroundCheck, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  BackgroundCheckListFilters,
  CreateBackgroundCheckInput,
  UpdateBackgroundCheckInput,
} from './background-check.types.js';
import { parseSortParam } from './background-check.mapper.js';

const backgroundCheckInclude = {
  candidate: {
    select: { id: true, firstName: true, lastName: true, sourceCandidateId: true },
  },
  requestedBy: { select: { id: true, firstName: true, lastName: true } },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
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
        status: data.status ?? 'PENDING',
        provider: data.provider,
        externalReferenceId: data.externalReferenceId,
        resultSummary: data.resultSummary,
        aiSummary: data.aiSummary,
        reviewNotes: data.reviewNotes,
        initiatedAt: data.initiatedAt ? new Date(data.initiatedAt) : new Date(),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
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

  findLatestClearForCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<BackgroundCheckRecord | null> {
    return this.prisma.backgroundCheck.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(candidateId),
        status: 'CLEAR',
        deletedAt: null,
      },
      orderBy: { completedAt: 'desc' },
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
        ...(data.aiSummary !== undefined && { aiSummary: data.aiSummary }),
        ...(data.reviewNotes !== undefined && { reviewNotes: data.reviewNotes }),
        ...(data.consentConfirmedAt !== undefined && {
          consentConfirmedAt: data.consentConfirmedAt
            ? new Date(data.consentConfirmedAt)
            : null,
        }),
        ...(data.consentConfirmedById !== undefined && {
          consentConfirmedById:
            data.consentConfirmedById != null
              ? BigInt(data.consentConfirmedById)
              : null,
        }),
        ...(data.vendorAssignedAt !== undefined && {
          vendorAssignedAt: data.vendorAssignedAt
            ? new Date(data.vendorAssignedAt)
            : null,
        }),
        ...(data.reviewedById !== undefined && {
          reviewedById:
            data.reviewedById != null ? BigInt(data.reviewedById) : null,
        }),
        ...(data.reviewedAt !== undefined && {
          reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : null,
        }),
        ...(data.consentDocumentId !== undefined && {
          consentDocumentId:
            data.consentDocumentId != null
              ? BigInt(data.consentDocumentId)
              : null,
        }),
        ...(data.reportDocumentId !== undefined && {
          reportDocumentId:
            data.reportDocumentId != null ? BigInt(data.reportDocumentId) : null,
        }),
        ...(data.idCheckStatus !== undefined && {
          idCheckStatus: data.idCheckStatus,
        }),
        ...(data.addressCheckStatus !== undefined && {
          addressCheckStatus: data.addressCheckStatus,
        }),
        ...(data.employmentCheckStatus !== undefined && {
          employmentCheckStatus: data.employmentCheckStatus,
        }),
        ...(data.educationCheckStatus !== undefined && {
          educationCheckStatus: data.educationCheckStatus,
        }),
        ...(data.criminalCheckStatus !== undefined && {
          criminalCheckStatus: data.criminalCheckStatus,
        }),
        ...(data.referenceCheckStatus !== undefined && {
          referenceCheckStatus: data.referenceCheckStatus,
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

  listDocuments(organizationId: number, backgroundCheckId: number) {
    return this.prisma.document.findMany({
      where: {
        organizationId: BigInt(organizationId),
        entityType: 'BACKGROUND_CHECK',
        entityId: BigInt(backgroundCheckId),
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDocument(data: {
    organizationId: number;
    uploadedById: number;
    entityId: number;
    fileName: string;
    originalName: string;
    s3Key: string;
    s3Bucket: string;
    fileUrl: string | null;
    mimeType: string;
    fileSize: number;
    description: string;
  }) {
    return this.prisma.document.create({
      data: {
        organizationId: BigInt(data.organizationId),
        uploadedById: BigInt(data.uploadedById),
        entityType: 'BACKGROUND_CHECK',
        entityId: BigInt(data.entityId),
        kind: 'GENERAL',
        fileName: data.fileName,
        originalName: data.originalName,
        s3Key: data.s3Key,
        s3Bucket: data.s3Bucket,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSize: BigInt(data.fileSize),
        status: 'UPLOADED',
        description: data.description,
      },
    });
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

    const search = filters.search?.trim();
    if (search) {
      where.OR = [
        { provider: { contains: search, mode: 'insensitive' } },
        { externalReferenceId: { contains: search, mode: 'insensitive' } },
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
