import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { notifyEvaluationProcessed } from '../../services/notification-dispatch.service.js';
import {
  bufferToBase64,
  EvaluationExtractionClient,
  type EvaluationExtractionResponse,
} from '../../services/evaluation-extraction.client.js';
import { assertCanCreateEvaluation } from '../candidates/candidate-pipeline.js';
import { recalculateCandidateScoresFromEvaluations } from './candidate-score.service.js';
import {
  mapEvaluationToDto,
  mapEvaluationToListItem,
} from './evaluation.mapper.js';
import { EvaluationRepository } from './evaluation.repository.js';
import type {
  CreateEvaluationInput,
  EvaluationDto,
  EvaluationListItemDto,
  UpdateEvaluationInput,
} from './evaluation.types.js';
import type { ListEvaluationsQuery } from './evaluation.validator.js';

function wasAiProcessed(input: {
  aiEvaluationSummary?: string | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  problemSolvingScore?: number | null;
  architectureScore?: number | null;
  clientReadinessScore?: number | null;
}): boolean {
  return Boolean(
    input.aiEvaluationSummary?.trim() ||
      input.technicalScore != null ||
      input.communicationScore != null ||
      input.problemSolvingScore != null ||
      input.architectureScore != null ||
      input.clientReadinessScore != null,
  );
}

export type EvaluationExtractResult = {
  extraction: EvaluationExtractionResponse;
  liveAi: boolean;
};

export class EvaluationService {
  private readonly evaluationRepository: EvaluationRepository;
  private readonly prisma: PrismaClient;
  private readonly webAppUrl: string;
  private readonly evaluationExtractionClient: EvaluationExtractionClient;

  constructor(
    fastify: FastifyInstance,
    evaluationRepository?: EvaluationRepository,
  ) {
    this.evaluationRepository =
      evaluationRepository ?? new EvaluationRepository(fastify.prisma);
    this.prisma = fastify.prisma;
    this.webAppUrl = fastify.config.webAppUrl;
    this.evaluationExtractionClient = new EvaluationExtractionClient(
      fastify.config.aiEvaluationUrl,
    );
  }

  /**
   * Calls Python ai-service (or static stub) with the uploaded evaluation document.
   * Does not persist an evaluation row — UI reviews fields then POSTs /evaluations.
   */
  async extractEvaluationDocument(
    authUser: AuthenticatedUser,
    file: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    },
    candidateId?: number,
  ): Promise<EvaluationExtractResult> {
    const organizationId = requireOrganization(authUser);

    if (candidateId != null && candidateId > 0) {
      const candidate = await this.prisma.candidate.findFirst({
        where: {
          id: BigInt(candidateId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!candidate) {
        throw new BadRequestError('Candidate not found');
      }
    }

    try {
      const extraction = await this.evaluationExtractionClient.extract({
        fileName: file.originalName,
        mimeType: file.mimeType,
        content: bufferToBase64(file.buffer),
        ...(candidateId != null && candidateId > 0
          ? { candidateId: String(candidateId) }
          : {}),
      });

      if (!extraction.aiEvaluationSummary?.trim()) {
        throw new BadRequestError(
          'AI did not return an evaluation summary for this document.',
        );
      }

      return {
        extraction,
        liveAi: this.evaluationExtractionClient.isLiveAiConfigured,
      };
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'Evaluation extraction failed',
          );
    }
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateEvaluationInput,
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    await this.validateCandidate(organizationId, input.candidateId);

    const evaluation = await this.evaluationRepository.create(organizationId, input);

    await this.prisma.candidate.update({
      where: {
        id: BigInt(input.candidateId),
        organizationId: BigInt(organizationId),
      },
      data: { profileStatus: 'EVALUATION_PENDING' },
    });

    const dto = mapEvaluationToDto(evaluation);

    if (wasAiProcessed(input)) {
      await this.runPostProcessing(
        organizationId,
        evaluation.candidateId,
        evaluation.candidate.firstName,
        evaluation.candidate.lastName,
        Number(evaluation.id),
        authUser.id,
      );
    }

    return dto;
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateEvaluationInput,
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getEvaluationOrThrow(organizationId, id);

    const evaluation = await this.evaluationRepository.update(
      organizationId,
      id,
      input,
    );
    const dto = mapEvaluationToDto(evaluation);

    if (wasAiProcessed(input)) {
      await this.runPostProcessing(
        organizationId,
        existing.candidateId,
        existing.candidate.firstName,
        existing.candidate.lastName,
        id,
        authUser.id,
      );
    }

    return dto;
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getEvaluationOrThrow(organizationId, id);
    await this.evaluationRepository.softDelete(organizationId, id);
    await recalculateCandidateScoresFromEvaluations(
      this.prisma,
      organizationId,
      Number(existing.candidateId),
    );
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListEvaluationsQuery,
  ): Promise<{
    data: EvaluationListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.evaluationRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      candidateId: query.candidateId,
      evaluationType: query.evaluationType,
    });

    return {
      data: items.map(mapEvaluationToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    const evaluation = await this.getEvaluationOrThrow(organizationId, id);
    return mapEvaluationToDto(evaluation);
  }

  private async runPostProcessing(
    organizationId: number,
    candidateId: bigint,
    firstName: string,
    lastName: string,
    evaluationId: number,
    triggeredByUserId: number,
  ): Promise<void> {
    const { bestalScore } = await recalculateCandidateScoresFromEvaluations(
      this.prisma,
      organizationId,
      Number(candidateId),
    );

    await notifyEvaluationProcessed(this.prisma, {
      organizationId,
      candidateId: Number(candidateId),
      candidateName: `${firstName} ${lastName}`.trim(),
      evaluationId,
      bestalScore,
      triggeredByUserId,
      webAppUrl: this.webAppUrl,
    });
  }

  private async getEvaluationOrThrow(organizationId: number, id: number) {
    const evaluation = await this.evaluationRepository.findById(organizationId, id);
    if (!evaluation) {
      throw new NotFoundError('Evaluation not found');
    }
    return evaluation;
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: {
        profileStatus: true,
        approvalStatus: true,
        visibility: true,
        resumeDocumentId: true,
        evaluationStatus: true,
        bgvStatus: true,
        clientBillRate: true,
        availabilityStatus: true,
        availableFrom: true,
        submittedForApprovalAt: true,
      },
    });

    if (!candidate) {
      throw new BadRequestError('Candidate not found');
    }

    assertCanCreateEvaluation(candidate);
  }
}
