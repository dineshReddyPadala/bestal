import type { Evaluation, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CompleteEvaluationInput,
  CreateEvaluationInput,
  EvaluationListFilters,
  UpdateEvaluationInput,
} from './evaluation.types.js';
import { parseSortParam } from './evaluation.mapper.js';

const evaluationInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
  client: { select: { id: true, name: true } },
  evaluator: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.EvaluationInclude;

export type EvaluationRecord = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;

export class EvaluationRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    evaluatorId: number,
    data: CreateEvaluationInput,
  ): Promise<EvaluationRecord> {
    return this.prisma.evaluation.create({
      data: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(data.candidateId),
        clientId: data.clientId ? BigInt(data.clientId) : undefined,
        evaluatorId: BigInt(evaluatorId),
        status: data.status,
        summary: data.summary,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        evaluatorName: data.evaluatorName,
        evaluatorCompany: data.evaluatorCompany,
        evaluationType: data.evaluationType,
        technicalScore: data.technicalScore,
        communicationScore: data.communicationScore,
        problemSolvingScore: data.problemSolvingScore,
        architectureScore: data.architectureScore,
        clientReadinessScore: data.clientReadinessScore,
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
        ...(data.clientId !== undefined && {
          clientId: data.clientId ? BigInt(data.clientId) : null,
        }),
        ...(data.evaluatorId !== undefined && {
          evaluatorId: BigInt(data.evaluatorId),
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.recommendation !== undefined && {
          recommendation: data.recommendation,
        }),
        ...(data.overallScore !== undefined && { overallScore: data.overallScore }),
        ...(data.technicalScore !== undefined && {
          technicalScore: data.technicalScore,
        }),
        ...(data.softSkillScore !== undefined && {
          softSkillScore: data.softSkillScore,
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
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.strengths !== undefined && { strengths: data.strengths }),
        ...(data.weaknesses !== undefined && { weaknesses: data.weaknesses }),
        ...(data.evaluatorName !== undefined && { evaluatorName: data.evaluatorName }),
        ...(data.evaluatorCompany !== undefined && {
          evaluatorCompany: data.evaluatorCompany,
        }),
        ...(data.evaluationType !== undefined && { evaluationType: data.evaluationType }),
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

  complete(
    organizationId: number,
    id: number,
    data: CompleteEvaluationInput,
  ): Promise<EvaluationRecord> {
    return this.prisma.evaluation.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'COMPLETED',
        recommendation: data.recommendation,
        overallScore: data.overallScore,
        technicalScore: data.technicalScore,
        softSkillScore: data.softSkillScore,
        summary: data.summary,
        evaluatedAt: new Date(),
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

  evaluatorExists(evaluatorId: number): Promise<boolean> {
    return this.prisma.user
      .findFirst({
        where: {
          id: BigInt(evaluatorId),
          deletedAt: null,
          isActive: true,
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

    if (filters.clientId) {
      where.clientId = BigInt(filters.clientId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.evaluatorId) {
      where.evaluatorId = BigInt(filters.evaluatorId);
    }

    return where;
  }
}
