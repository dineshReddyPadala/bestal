import type { Evaluation, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CreateEvaluationInput,
  EvaluationListFilters,
  UpdateEvaluationInput,
} from './evaluation.types.js';
import { parseSortParam } from './evaluation.mapper.js';

const evaluationInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.EvaluationInclude;

export type EvaluationRecord = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;

function parseEvaluationDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

export class EvaluationRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(organizationId: number, data: CreateEvaluationInput): Promise<EvaluationRecord> {
    return this.prisma.evaluation.create({
      data: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(data.candidateId),
        evaluatorName: data.evaluatorName,
        evaluatorCompany: data.evaluatorCompany,
        evaluationType: data.evaluationType,
        evaluationDate: parseEvaluationDate(data.evaluationDate),
        technicalScore: data.technicalScore,
        communicationScore: data.communicationScore,
        problemSolvingScore: data.problemSolvingScore,
        architectureScore: data.architectureScore,
        clientReadinessScore: data.clientReadinessScore,
        recommendation: data.recommendation,
        evaluationSummary: data.evaluationSummary,
        evaluatorComments: data.evaluatorComments,
        aiEvaluationSummary: data.aiEvaluationSummary,
        recordingUrl: data.recordingUrl,
        evaluationFileUrl: data.evaluationFileUrl,
      },
      include: evaluationInclude,
    });
  }

  findById(organizationId: number, id: number): Promise<EvaluationRecord | null> {
    return this.prisma.evaluation.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: evaluationInclude,
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateEvaluationInput,
  ): Promise<EvaluationRecord> {
    return this.prisma.evaluation.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.evaluatorName !== undefined && { evaluatorName: data.evaluatorName }),
        ...(data.evaluatorCompany !== undefined && {
          evaluatorCompany: data.evaluatorCompany,
        }),
        ...(data.evaluationType !== undefined && { evaluationType: data.evaluationType }),
        ...(data.evaluationDate !== undefined && {
          evaluationDate: parseEvaluationDate(data.evaluationDate),
        }),
        ...(data.technicalScore !== undefined && {
          technicalScore: data.technicalScore,
        }),
        ...(data.communicationScore !== undefined && {
          communicationScore: data.communicationScore,
        }),
        ...(data.problemSolvingScore !== undefined && {
          problemSolvingScore: data.problemSolvingScore,
        }),
        ...(data.architectureScore !== undefined && {
          architectureScore: data.architectureScore,
        }),
        ...(data.clientReadinessScore !== undefined && {
          clientReadinessScore: data.clientReadinessScore,
        }),
        ...(data.recommendation !== undefined && { recommendation: data.recommendation }),
        ...(data.evaluationSummary !== undefined && {
          evaluationSummary: data.evaluationSummary,
        }),
        ...(data.evaluatorComments !== undefined && {
          evaluatorComments: data.evaluatorComments,
        }),
        ...(data.aiEvaluationSummary !== undefined && {
          aiEvaluationSummary: data.aiEvaluationSummary,
        }),
        ...(data.recordingUrl !== undefined && { recordingUrl: data.recordingUrl }),
        ...(data.evaluationFileUrl !== undefined && {
          evaluationFileUrl: data.evaluationFileUrl,
        }),
      },
      include: evaluationInclude,
    });
  }

  softDelete(organizationId: number, id: number): Promise<Evaluation> {
    return this.prisma.evaluation.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(filters: EvaluationListFilters): Promise<{
    items: EvaluationRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.evaluation.findMany({
        where,
        include: evaluationInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.evaluation.count({ where }),
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
    filters: EvaluationListFilters,
  ): Prisma.EvaluationWhereInput {
    const where: Prisma.EvaluationWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.candidateId) {
      where.candidateId = BigInt(filters.candidateId);
    }

    if (filters.evaluationType) {
      where.evaluationType = filters.evaluationType;
    }

    const search = filters.search?.trim();
    if (search) {
      where.OR = [
        { evaluatorName: { contains: search, mode: 'insensitive' } },
        { evaluationType: { contains: search, mode: 'insensitive' } },
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
