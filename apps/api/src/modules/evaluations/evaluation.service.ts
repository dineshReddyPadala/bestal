import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import {
  normalizeEvaluationRecommendation,
  normalizeEvaluationType,
} from '@bestal/shared-utils';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { notifyEvaluationProcessed } from '../../services/notification-dispatch.service.js';
import type { EvaluationExtractionResponse } from '../../services/evaluation-extraction.types.js';
import { StorageService } from '../../services/storage.service.js';
import { readStoredDocumentBuffer, type DocumentDownloadPayload } from '../../services/document-buffer.util.js';
import { UPLOAD_CATEGORIES } from '../../services/storage/storage.constants.js';
import { buildS3ObjectReference } from '../../services/storage/upload.utils.js';
import { normalizeUploadToPdf } from '../../services/document-pdf-normalizer.js';
import { AutomationService } from '../automation/automation.service.js';
import type { EvaluationAnalysisOutput } from '../automation/dto/evaluation-analysis.dto.js';
import { N8nClient } from '../automation/n8n.client.js';
import { N8N_AUTOMATION_REQUIRED_MESSAGE } from '../automation/automation.constants.js';
import { readN8nConfig } from '../../services/system-settings.reader.js';
import { assertCanCreateEvaluationForRole } from '../candidates/candidate-pipeline.js';
import {
  maybeAutoSubmitSuperAdminCandidate,
  syncImportedCandidateProfileStatus,
} from '../candidates/candidate-profile-sync.js';
import { recalculateCandidateScoresFromEvaluations } from './candidate-score.service.js';
import {
  mapEvaluationToDto,
  mapEvaluationToListItem,
} from './evaluation.mapper.js';
import { EvaluationRepository } from './evaluation.repository.js';
import type {
  CreateEvaluationInput,
  EvaluationAnalysisJobAccepted,
  EvaluationDto,
  EvaluationListItemDto,
  UpdateEvaluationInput,
} from './evaluation.types.js';
import type { ListEvaluationsQuery } from './evaluation.validator.js';

const DRAFT_EVALUATOR_NAME = 'Pending AI Analysis';

const SCORE_FIELD_KEYS = [
  'technicalScore',
  'communicationScore',
  'problemSolvingScore',
  'architectureScore',
  'clientReadinessScore',
] as const;

function evaluationScoreFieldsChanged(
  existing: {
    technicalScore: number | null;
    communicationScore: number | null;
    problemSolvingScore: number | null;
    architectureScore: number | null;
    clientReadinessScore: number | null;
    aiEvaluationSummary: string | null;
  },
  input: UpdateEvaluationInput,
): boolean {
  for (const key of SCORE_FIELD_KEYS) {
    if (input[key] !== undefined && input[key] !== existing[key]) {
      return true;
    }
  }
  if (input.aiEvaluationSummary !== undefined) {
    const next = input.aiEvaluationSummary?.trim() ?? '';
    const prev = existing.aiEvaluationSummary?.trim() ?? '';
    if (next !== prev) return true;
  }
  return false;
}

function hasEvaluationScoreData(input: {
  aiEvaluationSummary?: string | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  problemSolvingScore?: number | null;
  architectureScore?: number | null;
  clientReadinessScore?: number | null;
}): boolean {
  return Boolean(
    input.aiEvaluationSummary?.trim() ||
      SCORE_FIELD_KEYS.some((key) => input[key] != null),
  );
}

export type EvaluationExtractResult = {
  extraction: EvaluationExtractionResponse;
  liveAi: boolean;
};

export type EvaluationExtractResponse =
  | EvaluationExtractResult
  | EvaluationAnalysisJobAccepted;

export class EvaluationService {
  private readonly evaluationRepository: EvaluationRepository;
  private readonly prisma: PrismaClient;
  private readonly webAppUrl: string;
  private readonly config: FastifyInstance['config'];
  private readonly storageService: StorageService;
  private readonly fastify: FastifyInstance;

  constructor(
    fastify: FastifyInstance,
    evaluationRepository?: EvaluationRepository,
  ) {
    this.fastify = fastify;
    this.evaluationRepository =
      evaluationRepository ?? new EvaluationRepository(fastify.prisma);
    this.prisma = fastify.prisma;
    this.config = fastify.config;
    this.webAppUrl = fastify.config.webAppUrl;
    this.storageService = new StorageService(fastify.config, fastify.prisma);
  }

  private async isN8nEvaluationAnalysisEnabled(): Promise<boolean> {
    const config = await readN8nConfig(this.prisma);
    return new N8nClient(config).isEvaluationConfigured();
  }

  /**
   * Upload evaluation document and extract scores via n8n (async AutomationJob).
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
  ): Promise<EvaluationExtractResponse> {
    const organizationId = requireOrganization(authUser);

    if (!(await this.isN8nEvaluationAnalysisEnabled())) {
      throw new BadRequestError(N8N_AUTOMATION_REQUIRED_MESSAGE);
    }

    if (candidateId == null || !Number.isInteger(candidateId) || candidateId <= 0) {
      throw new BadRequestError(
        'candidateId is required for Evaluation AI Analysis',
      );
    }

    return this.enqueueEvaluationAnalysisJob({
      authUser,
      organizationId,
      candidateId,
      file,
    });
  }

  /**
   * Persist validated n8n evaluation output (transactional, idempotent caller).
   * Updates the existing evaluation — never creates a second row for the same job.
   */
  async applyEvaluationAnalysisFromAutomation(params: {
    organizationId: number;
    candidateId: number;
    evaluationId: number;
    automationJobId: number;
    output: EvaluationAnalysisOutput;
    requestedBy: number;
  }): Promise<void> {
    const {
      organizationId,
      candidateId,
      evaluationId,
      automationJobId,
      output,
      requestedBy,
    } = params;

    const existing = await this.evaluationRepository.findById(
      organizationId,
      evaluationId,
    );
    if (!existing) {
      throw new NotFoundError('Evaluation not found');
    }
    if (bigintToNumber(existing.candidateId) !== candidateId) {
      throw new BadRequestError(
        'evaluationId does not belong to the callback candidateId',
      );
    }

    const evaluatorName =
      output.evaluatorName?.trim() ||
      (existing.evaluatorName === DRAFT_EVALUATOR_NAME
        ? 'AI Evaluator'
        : existing.evaluatorName);
    const recommendation = normalizeEvaluationRecommendation(output.recommendation);
    const evaluationType = normalizeEvaluationType(output.evaluationType);
    const evaluationDate = normalizeEvaluationDate(output.evaluationDate);
    const aiEvaluationSummary =
      output.aiEvaluationSummary?.trim() ||
      output.evaluationSummary?.trim() ||
      undefined;
    const evaluatorComments =
      output.evaluatorComments?.trim() ||
      output.extractedText?.trim() ||
      undefined;

    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: { firstName: true, lastName: true },
    });
    if (!candidate) {
      throw new NotFoundError('Candidate not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: bigint; status: string }>>`
        SELECT id, status
        FROM automation_jobs
        WHERE id = ${BigInt(automationJobId)}
        FOR UPDATE
      `;
      const jobRow = locked[0];
      if (!jobRow) {
        throw new NotFoundError('Automation job not found');
      }
      if (jobRow.status === 'COMPLETED' || jobRow.status === 'CANCELLED') {
        return;
      }

      await tx.evaluation.update({
        where: {
          id: BigInt(evaluationId),
          organizationId: BigInt(organizationId),
        },
        data: {
          evaluatorName,
          evaluatorCompany:
            output.evaluatorCompany?.trim() || existing.evaluatorCompany,
          evaluationType: evaluationType ?? existing.evaluationType,
          evaluationDate:
            evaluationDate !== undefined
              ? evaluationDate
              : existing.evaluationDate,
          technicalScore: output.technicalScore ?? existing.technicalScore,
          communicationScore:
            output.communicationScore ?? existing.communicationScore,
          problemSolvingScore:
            output.problemSolvingScore ?? existing.problemSolvingScore,
          architectureScore:
            output.architectureScore ?? existing.architectureScore,
          clientReadinessScore:
            output.clientReadinessScore ?? existing.clientReadinessScore,
          recommendation: recommendation ?? existing.recommendation,
          evaluationSummary:
            output.evaluationSummary?.trim() || existing.evaluationSummary,
          evaluatorComments: evaluatorComments ?? existing.evaluatorComments,
          aiEvaluationSummary:
            aiEvaluationSummary ?? existing.aiEvaluationSummary,
        },
      });

      await tx.candidate.update({
        where: {
          id: BigInt(candidateId),
          organizationId: BigInt(organizationId),
        },
        data: { profileStatus: 'EVALUATION_PENDING' },
      });

      await tx.automationJob.update({
        where: { id: BigInt(automationJobId) },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          errorCode: null,
          errorMessage: null,
          outputReference: output as object,
        },
      });
    });

    if (
      hasEvaluationScoreData({
        aiEvaluationSummary,
        technicalScore: output.technicalScore,
        communicationScore: output.communicationScore,
        problemSolvingScore: output.problemSolvingScore,
        architectureScore: output.architectureScore,
        clientReadinessScore: output.clientReadinessScore,
      })
    ) {
      await this.runPostProcessing(
        organizationId,
        BigInt(candidateId),
        candidate.firstName,
        candidate.lastName,
        evaluationId,
        requestedBy,
        output.bestalScore,
      );
    }
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateEvaluationInput,
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    await this.validateCandidate(authUser, organizationId, input.candidateId);

    const evaluation = await this.evaluationRepository.create(organizationId, input);

    await this.prisma.candidate.update({
      where: {
        id: BigInt(input.candidateId),
        organizationId: BigInt(organizationId),
      },
      data: { profileStatus: 'EVALUATION_PENDING' },
    });

    const dto = mapEvaluationToDto(evaluation);

    if (hasEvaluationScoreData(input)) {
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

    const normalizedInput: UpdateEvaluationInput = {
      ...input,
      ...(input.evaluationType !== undefined
        ? {
            evaluationType:
              input.evaluationType == null
                ? null
                : normalizeEvaluationType(input.evaluationType) ?? input.evaluationType,
          }
        : {}),
      ...(input.recommendation !== undefined
        ? {
            recommendation:
              input.recommendation == null
                ? null
                : normalizeEvaluationRecommendation(input.recommendation) ?? input.recommendation,
          }
        : {}),
    };

    const evaluation = await this.evaluationRepository.update(
      organizationId,
      id,
      normalizedInput,
    );
    const dto = mapEvaluationToDto(evaluation);

    if (evaluationScoreFieldsChanged(existing, normalizedInput)) {
      await this.runPostProcessing(
        organizationId,
        existing.candidateId,
        existing.candidate.firstName,
        existing.candidate.lastName,
        id,
        authUser.id,
      );
    } else {
      await syncImportedCandidateProfileStatus(
        this.prisma,
        organizationId,
        Number(existing.candidateId),
      );
    }

    return dto;
  }

  async uploadDocument(
    authUser: AuthenticatedUser,
    id: number,
    file: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    },
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getEvaluationOrThrow(organizationId, id);
    const candidateId = Number(existing.candidateId);

    this.storageService.validateFile(UPLOAD_CATEGORIES.EVALUATION, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    const uploadFile = await normalizeUploadToPdf(file);

    const storageKey = this.storageService.buildEvaluationAssetKey(
      organizationId,
      id,
      uploadFile.originalName,
    );

    const uploadResult = await this.storageService.upload(
      storageKey,
      {
        buffer: uploadFile.buffer,
        originalName: uploadFile.originalName,
        mimeType: uploadFile.mimeType,
        size: uploadFile.size,
      },
      {
        category: UPLOAD_CATEGORIES.EVALUATION,
        organizationId,
        entityId: id,
      },
    );

    const storedFileUrl = buildS3ObjectReference(uploadResult.bucket, uploadResult.key);

    await this.prisma.document.create({
      data: {
        organizationId: BigInt(organizationId),
        uploadedById: BigInt(authUser.id),
        entityType: 'CANDIDATE',
        entityId: BigInt(candidateId),
        kind: 'GENERAL',
        fileName: uploadResult.key.split('/').pop() ?? uploadFile.originalName,
        originalName: uploadFile.originalName,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        fileUrl: storedFileUrl,
        mimeType: uploadFile.mimeType,
        fileSize: BigInt(uploadFile.size),
        status: 'UPLOADED',
      },
    });

    const evaluation = await this.evaluationRepository.update(organizationId, id, {
      evaluationFileUrl: storedFileUrl,
    });

    await syncImportedCandidateProfileStatus(this.prisma, organizationId, candidateId);

    return mapEvaluationToDto(evaluation);
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
      search: query.search,
      candidateId: query.candidateId,
      evaluationType: query.evaluationType,
    });

    const evaluationIds = items.map((item) => bigintToNumber(item.id));
    const documentIdByEvaluation = await this.resolveEvaluationDocumentIds(
      organizationId,
      evaluationIds,
    );

    return {
      data: items.map((item) =>
        mapEvaluationToListItem(
          item,
          documentIdByEvaluation.get(bigintToNumber(item.id)) ?? null,
        ),
      ),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async downloadDocument(
    authUser: AuthenticatedUser,
    evaluationId: number,
  ): Promise<DocumentDownloadPayload> {
    const organizationId = requireOrganization(authUser);
    await this.getEvaluationOrThrow(organizationId, evaluationId);
    const documentId =
      (await this.resolveEvaluationDocumentIds(organizationId, [evaluationId])).get(
        evaluationId,
      ) ?? null;

    if (documentId == null) {
      throw new NotFoundError('Evaluation document not found');
    }

    const document = await this.prisma.document.findFirst({
      where: {
        id: BigInt(documentId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
    });
    if (!document) {
      throw new NotFoundError('Evaluation document not found');
    }

    return readStoredDocumentBuffer(document, this.config, this.storageService);
  }

  private async resolveEvaluationDocumentIds(
    _organizationId: number,
    evaluationIds: number[],
  ): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (evaluationIds.length === 0) return map;

    const jobs = await this.prisma.automationJob.findMany({
      where: {
        jobType: 'EVALUATION_ANALYSIS',
        documentId: { not: null },
        OR: evaluationIds.map((evaluationId) => ({
          inputReference: {
            path: ['evaluationId'],
            equals: evaluationId,
          },
        })),
      },
      select: {
        documentId: true,
        inputReference: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const job of jobs) {
      const ref = job.inputReference as { evaluationId?: number } | null;
      const evaluationId = ref?.evaluationId;
      if (
        evaluationId != null &&
        !map.has(evaluationId) &&
        job.documentId != null
      ) {
        map.set(evaluationId, bigintToNumber(job.documentId));
      }
    }

    return map;
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    const evaluation = await this.getEvaluationOrThrow(organizationId, id);
    return mapEvaluationToDto(evaluation);
  }

  private async enqueueEvaluationAnalysisJob(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    candidateId: number;
    file: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    };
  }): Promise<EvaluationAnalysisJobAccepted> {
    const { authUser, organizationId, candidateId, file } = params;

    await this.validateCandidate(authUser, organizationId, candidateId);

    this.storageService.validateFile(UPLOAD_CATEGORIES.EVALUATION, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    const uploadFile = await normalizeUploadToPdf(file);

    let evaluationId: number | null = null;
    let documentId: number | null = null;

    try {
      const draft = await this.evaluationRepository.create(organizationId, {
        candidateId,
        evaluatorName: DRAFT_EVALUATOR_NAME,
        evaluationFileUrl: uploadFile.originalName,
      });
      evaluationId = bigintToNumber(draft.id);

      const storageKey = this.storageService.buildEvaluationAssetKey(
        organizationId,
        evaluationId,
        uploadFile.originalName,
      );

      const uploadResult = await this.storageService.upload(
        storageKey,
        {
          buffer: uploadFile.buffer,
          originalName: uploadFile.originalName,
          mimeType: uploadFile.mimeType,
          size: uploadFile.size,
        },
        {
          category: UPLOAD_CATEGORIES.EVALUATION,
          organizationId,
          entityId: evaluationId,
        },
      );

      const storedFileUrl = buildS3ObjectReference(uploadResult.bucket, uploadResult.key);

      const signedUrl =
        (await this.storageService.resolveFileUrl(
          uploadResult.key,
          uploadResult.bucket,
          uploadFile.mimeType,
        )) ?? storedFileUrl;

      const document = await this.prisma.document.create({
        data: {
          organizationId: BigInt(organizationId),
          uploadedById: BigInt(authUser.id),
          entityType: 'CANDIDATE',
          entityId: BigInt(candidateId),
          kind: 'GENERAL',
          fileName: uploadResult.key.split('/').pop() ?? uploadFile.originalName,
          originalName: uploadFile.originalName,
          s3Key: uploadResult.key,
          s3Bucket: uploadResult.bucket,
          fileUrl: storedFileUrl,
          mimeType: uploadFile.mimeType,
          fileSize: BigInt(uploadFile.size),
          status: 'UPLOADED',
        },
      });
      documentId = bigintToNumber(document.id);

      await this.evaluationRepository.update(organizationId, evaluationId, {
        evaluationFileUrl: storedFileUrl,
      });

      const automation = new AutomationService(this.fastify);
      const candidateRow = await this.prisma.candidate.findFirst({
        where: {
          id: BigInt(candidateId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { bestalScore: true },
      });
      const previousBestalScore = candidateRow?.bestalScore ?? null;

      const job = await automation.enqueueEvaluationAnalysis({
        candidateId,
        documentId,
        requestedBy: authUser.id,
        documentUrl: signedUrl,
        previousBestalScore,
        inputReference: {
          candidateId,
          documentId,
          evaluationId,
          fileName: uploadFile.originalName,
          mimeType: uploadFile.mimeType,
          previousBestalScore,
        },
      });

      return {
        jobId: job.id,
        status: job.status,
        candidateId,
        documentId,
        evaluationId,
      };
    } catch (error) {
      if (evaluationId != null) {
        await this.evaluationRepository
          .softDelete(organizationId, evaluationId)
          .catch(() => undefined);
      }
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(
            error instanceof Error
              ? error.message
              : 'Evaluation AI analysis enqueue failed',
          );
    }
  }

  private async runPostProcessing(
    organizationId: number,
    candidateId: bigint,
    firstName: string,
    lastName: string,
    evaluationId: number,
    triggeredByUserId: number,
    bestalScoreOverride?: number | null,
  ): Promise<void> {
    const { bestalScore } = await recalculateCandidateScoresFromEvaluations(
      this.prisma,
      organizationId,
      Number(candidateId),
      bestalScoreOverride != null ? { bestalScoreOverride } : undefined,
    );

    void notifyEvaluationProcessed(this.prisma, this.config, {
      organizationId,
      candidateId: Number(candidateId),
      candidateName: `${firstName} ${lastName}`.trim(),
      evaluationId,
      bestalScore,
      triggeredByUserId,
      webAppUrl: this.webAppUrl,
    }).catch(() => undefined);

    await maybeAutoSubmitSuperAdminCandidate(
      this.prisma,
      this.config,
      organizationId,
      Number(candidateId),
    );
  }

  private async getEvaluationOrThrow(organizationId: number, id: number) {
    const evaluation = await this.evaluationRepository.findById(organizationId, id);
    if (!evaluation) {
      throw new NotFoundError('Evaluation not found');
    }
    return evaluation;
  }

  private async validateCandidate(
    authUser: AuthenticatedUser,
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
        sourceCandidateId: true,
        clientBillRate: true,
        availabilityStatus: true,
        availableFrom: true,
        submittedForApprovalAt: true,
      },
    });

    if (!candidate) {
      throw new BadRequestError('Candidate not found');
    }

    assertCanCreateEvaluationForRole(authUser.role, candidate);
  }
}

function normalizeEvaluationDate(
  value: string | undefined,
): Date | null | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return undefined;
  return new Date(`${match[1]}T00:00:00.000Z`);
}
