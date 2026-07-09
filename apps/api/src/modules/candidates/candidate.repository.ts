import type {
  Candidate,
  Document,
  DocumentKind,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CandidateListFilters,
  CreateCandidateInput,
  UpdateCandidateInput,
} from './candidate.types.js';
import {
  buildCandidateCreateData,
  buildCandidateScalarData,
} from './candidate-field-mapper.js';
import { parseSortParam } from './candidate.mapper.js';

const candidateInclude = {
  primarySkillCommunity: { select: { id: true, name: true } },
  resumeDocument: true,
  profileImageDocument: true,
  introVideoDocument: true,
  skills: {
    where: { deletedAt: null },
    include: { skillCommunity: { select: { name: true } } },
  },
} satisfies Prisma.CandidateInclude;

export type CandidateRecord = Prisma.CandidateGetPayload<{
  include: typeof candidateInclude;
}>;

export type CandidateWithRelations = CandidateRecord;

export class CandidateRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    data: CreateCandidateInput,
  ): Promise<CandidateRecord> {
    return this.prisma.candidate.create({
      data: buildCandidateCreateData(organizationId, data),
      include: candidateInclude,
    });
  }

  findById(organizationId: number, id: number): Promise<CandidateRecord | null> {
    return this.prisma.candidate.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: candidateInclude,
    });
  }

  findByEmail(organizationId: number, email: string): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateCandidateInput,
  ): Promise<CandidateRecord> {
    return this.prisma.candidate.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: buildCandidateScalarData(data) as Prisma.CandidateUncheckedUpdateInput,
      include: candidateInclude,
    });
  }

  softDelete(organizationId: number, id: number): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(filters: CandidateListFilters): Promise<{
    items: CandidateRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        include: candidateInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return { items, total };
  }

  publish(organizationId: number, id: number): Promise<CandidateRecord> {
    return this.prisma.candidate.update({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: {
        visibility: 'PUBLISHED',
        publishedAt: new Date(),
        hiddenAt: null,
      },
      include: candidateInclude,
    });
  }

  hide(organizationId: number, id: number): Promise<CandidateRecord> {
    return this.prisma.candidate.update({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: {
        visibility: 'HIDDEN',
        hiddenAt: new Date(),
      },
      include: candidateInclude,
    });
  }

  approve(
    organizationId: number,
    id: number,
    approvedById: number,
  ): Promise<CandidateRecord> {
    return this.prisma.candidate.update({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedById: BigInt(approvedById),
        rejectedAt: null,
        rejectedById: null,
        rejectionReason: null,
      },
      include: candidateInclude,
    });
  }

  reject(
    organizationId: number,
    id: number,
    rejectedById: number,
    reason: string,
  ): Promise<CandidateRecord> {
    return this.prisma.candidate.update({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: {
        approvalStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectedById: BigInt(rejectedById),
        rejectionReason: reason,
        approvedAt: null,
        approvedById: null,
      },
      include: candidateInclude,
    });
  }

  linkDocument(
    organizationId: number,
    candidateId: number,
    kind: DocumentKind,
    documentId: bigint,
  ): Promise<CandidateRecord> {
    const fieldMap = {
      RESUME: 'resumeDocumentId',
      PROFILE_IMAGE: 'profileImageDocumentId',
      INTRO_VIDEO: 'introVideoDocumentId',
    } as const;

    const field = fieldMap[kind as keyof typeof fieldMap];

    if (!field) {
      throw new Error(`Unsupported document kind: ${kind}`);
    }

    return this.prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: { [field]: documentId },
      include: candidateInclude,
    });
  }

  createDocument(data: {
    organizationId: number;
    uploadedById: number;
    entityId: number;
    kind: DocumentKind;
    fileName: string;
    originalName: string;
    s3Key: string;
    s3Bucket: string;
    mimeType: string;
    fileSize: number;
  }): Promise<Document> {
    return this.prisma.document.create({
      data: {
        organizationId: BigInt(data.organizationId),
        uploadedById: BigInt(data.uploadedById),
        entityType: 'CANDIDATE',
        entityId: BigInt(data.entityId),
        kind: data.kind,
        fileName: data.fileName,
        originalName: data.originalName,
        s3Key: data.s3Key,
        s3Bucket: data.s3Bucket,
        mimeType: data.mimeType,
        fileSize: BigInt(data.fileSize),
        status: 'UPLOADED',
      },
    });
  }

  softDeleteDocument(documentId: bigint): Promise<Document> {
    return this.prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
  }

  findDocumentById(documentId: bigint): Promise<Document | null> {
    return this.prisma.document.findFirst({
      where: { id: documentId, deletedAt: null },
    });
  }

  skillCommunityExists(
    organizationId: number,
    skillCommunityId: number,
  ): Promise<boolean> {
    return this.prisma.skillCommunity
      .findFirst({
        where: {
          id: BigInt(skillCommunityId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private buildWhereClause(
    filters: CandidateListFilters,
  ): Prisma.CandidateWhereInput {
    const where: Prisma.CandidateWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.clientView) {
      where.visibility = 'PUBLISHED';
      where.approvalStatus = 'APPROVED';
    } else {
      if (filters.visibility) {
        where.visibility = filters.visibility;
      }
      if (filters.approvalStatus) {
        where.approvalStatus = filters.approvalStatus;
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.primarySkillCommunityId) {
      where.primarySkillCommunityId = BigInt(filters.primarySkillCommunityId);
    }

    if (filters.skillCommunityId) {
      where.skills = {
        some: {
          skillCommunityId: BigInt(filters.skillCommunityId),
          deletedAt: null,
        },
      };
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { headline: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
