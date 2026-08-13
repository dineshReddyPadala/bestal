import type { FastifyInstance } from 'fastify';
import { formatBgvCheckStatusesSummary as formatBgvCheckFieldsSummary } from '@bestal/shared-utils';
import type { BackgroundCheckStatus, PrismaClient } from '@prisma/client';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  AuthorizationError,
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { StorageService } from '../../services/storage.service.js';
import { readStoredDocumentBuffer, type DocumentDownloadPayload } from '../../services/document-buffer.util.js';
import { UPLOAD_CATEGORIES } from '../../services/storage/storage.constants.js';
import { buildS3ObjectReference } from '../../services/storage/upload.utils.js';
import { normalizeUploadToPdf } from '../../services/document-pdf-normalizer.js';
import {
  formatBgvAiSummaryJson,
  formatBgvCheckStatusesSummary,
  normalizeBgvExtractionResponse,
} from '../../services/bgv-extraction.mapper.js';
import type { BgvExtractionResponse } from '../../services/bgv-extraction.types.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { notifyBgvAnalysisProcessed } from '../../services/notification-dispatch.service.js';
import { PERMISSIONS, roleHasPermission } from '../auth/auth.permissions.js';
import { AutomationService } from '../automation/automation.service.js';
import type { BgvAnalysisOutput } from '../automation/dto/bgv-analysis.dto.js';
import { N8nClient } from '../automation/n8n.client.js';
import { N8N_AUTOMATION_REQUIRED_MESSAGE } from '../automation/automation.constants.js';
import { readN8nConfig } from '../../services/system-settings.reader.js';
import { assertCanCreateBackgroundCheckForRole } from '../candidates/candidate-pipeline.js';
import {
  maybeAutoSubmitSuperAdminCandidate,
  syncImportedCandidateProfileStatus,
} from '../candidates/candidate-profile-sync.js';
import {
  assertBgvConsentConfirmed,
  assertBgvReportUploaded,
  assertBgvStatusIn,
  assertBgvVendorAssigned,
  assertRecruiterCannotSetDisposition,
  type BgvDocumentKindLabel,
} from './background-check-workflow.js';
import {
  mapBackgroundCheckToDto,
  mapBackgroundCheckToListItem,
  mapBackgroundCheckToPublicSummary,
} from './background-check.mapper.js';
import { BackgroundCheckRepository } from './background-check.repository.js';
import type {
  BackgroundCheckDto,
  BackgroundCheckListItemDto,
  BackgroundCheckPublicSummaryDto,
  BgvAnalysisJobAccepted,
  BgvDocumentDto,
  CreateBackgroundCheckInput,
  UpdateBackgroundCheckInput,
  UploadBgvAssetInput,
} from './background-check.types.js';
import type { ListBackgroundChecksQuery } from './background-check.validator.js';

function deriveCandidateBgvProfileStatus(
  status: string | undefined,
): 'BGV_PENDING' | 'BGV_COMPLETE' {
  if (status === 'CLEAR' || status === 'COMPLETED_CLEAR') return 'BGV_COMPLETE';
  return 'BGV_PENDING';
}

const BGV_EARLY_WORKFLOW_STATUSES: BackgroundCheckStatus[] = [
  'NOT_STARTED',
  'PENDING',
  'CONSENT_PENDING',
  'INITIATED',
];

const BGV_UPLOAD_DOCUMENT_STATUSES: BackgroundCheckStatus[] = [
  ...BGV_EARLY_WORKFLOW_STATUSES,
  'IN_PROGRESS',
  'SUSPENDED',
  'CONSIDER',
  'CLEAR',
  'COMPLETED_CLEAR',
  'COMPLETED_WITH_CONCERN',
  'FAILED',
];

const BGV_CONSENT_ACTION_STATUSES: BackgroundCheckStatus[] = [
  ...BGV_EARLY_WORKFLOW_STATUSES,
  'IN_PROGRESS',
  'SUSPENDED',
];

const BGV_WORKFLOW_STATUSES = new Set([
  'NOT_STARTED',
  'PENDING',
  'CONSENT_PENDING',
  'INITIATED',
  'IN_PROGRESS',
  'CLEAR',
  'CONSIDER',
  'COMPLETED_CLEAR',
  'COMPLETED_WITH_CONCERN',
  'SUSPENDED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
]);

/** Map AI overall status to a BGV workflow status after report analysis. */
function deriveBgvWorkflowStatusFromAiOutput(output: BgvAnalysisOutput): string {
  const raw = (output.overallStatus ?? output.status ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (raw && BGV_WORKFLOW_STATUSES.has(raw)) {
    return raw;
  }

  const checks = [
    output.idCheckStatus,
    output.addressCheckStatus,
    output.employmentCheckStatus,
    output.educationCheckStatus,
    output.criminalCheckStatus,
    output.referenceCheckStatus,
  ].filter(Boolean);

  if (checks.some((c) => c === 'CONSIDER' || c === 'FAILED')) {
    return 'CONSIDER';
  }
  if (checks.length > 0 && checks.every((c) => c === 'CLEAR')) {
    return 'CONSIDER';
  }
  if (output.aiBgvSummary?.trim()) {
    return 'CONSIDER';
  }
  return 'IN_PROGRESS';
}

export type BgvExtractResult = {
  extraction: BgvExtractionResponse;
  liveAi: boolean;
  backgroundCheckId?: number;
};

export type BgvExtractResponse = BgvExtractResult | BgvAnalysisJobAccepted;

export type BgvExtractAiResponse = BackgroundCheckDto | BgvAnalysisJobAccepted;

export class BackgroundCheckService {
  private readonly backgroundCheckRepository: BackgroundCheckRepository;
  private readonly prisma: PrismaClient;
  private readonly storageService: StorageService;
  private readonly fastify: FastifyInstance;
  private readonly webAppUrl: string;
  private readonly config: FastifyInstance['config'];

  constructor(
    fastify: FastifyInstance,
    backgroundCheckRepository?: BackgroundCheckRepository,
  ) {
    this.fastify = fastify;
    this.config = fastify.config;
    this.webAppUrl = fastify.config.webAppUrl;
    this.backgroundCheckRepository =
      backgroundCheckRepository ?? new BackgroundCheckRepository(fastify.prisma);
    this.prisma = fastify.prisma;
    this.storageService = new StorageService(fastify.config);
  }

  private async isN8nBgvAnalysisEnabled(): Promise<boolean> {
    const config = await readN8nConfig(this.prisma);
    return new N8nClient(config).isBgvConfigured();
  }

  /**
   * Upload BGV report and extract analysis fields via n8n (async AutomationJob).
   */
  async extractBgvDocument(
    authUser: AuthenticatedUser,
    file: UploadBgvAssetInput,
    candidateId?: number,
  ): Promise<BgvExtractResponse> {
    const organizationId = requireOrganization(authUser);

    if (!(await this.isN8nBgvAnalysisEnabled())) {
      throw new BadRequestError(N8N_AUTOMATION_REQUIRED_MESSAGE);
    }

    if (candidateId == null || !Number.isInteger(candidateId) || candidateId <= 0) {
      throw new BadRequestError('candidateId is required for BGV AI Analysis');
    }

    return this.enqueueBgvAnalysisJob({
      authUser,
      organizationId,
      candidateId,
      file,
    });
  }

  /**
   * Persist validated n8n BGV output (transactional, idempotent caller).
   * Updates the existing background check — never creates a duplicate row.
   */
  async applyBgvAnalysisFromAutomation(params: {
    organizationId: number;
    candidateId: number;
    backgroundCheckId: number;
    automationJobId: number;
    output: BgvAnalysisOutput;
    requestedBy: number;
  }): Promise<void> {
    const {
      organizationId,
      candidateId,
      backgroundCheckId,
      automationJobId,
      output,
    } = params;

    const existing = await this.backgroundCheckRepository.findById(
      organizationId,
      backgroundCheckId,
    );
    if (!existing) {
      throw new NotFoundError('Background check not found');
    }
    if (bigintToNumber(existing.candidateId) !== candidateId) {
      throw new BadRequestError(
        'backgroundCheckId does not belong to the callback candidateId',
      );
    }

    const extraction = bgvOutputToExtraction(output);
    const aiSummary = formatBgvAiSummaryJson(extraction, {
      provider: output.vendorName ?? existing.provider,
      checkType: output.checkType ?? existing.type,
      liveAi: true,
    });
    const resultSummary = formatBgvCheckStatusesSummary(extraction);
    const reviewNotes = output.concernNotes?.trim() || existing.reviewNotes;
    const workflowStatus = deriveBgvWorkflowStatusFromAiOutput(output);

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

      await tx.backgroundCheck.update({
        where: {
          id: BigInt(backgroundCheckId),
          organizationId: BigInt(organizationId),
        },
        data: {
          status: workflowStatus as typeof existing.status,
          provider: output.vendorName?.trim() || existing.provider,
          type: normalizeBgvCheckType(output.checkType) ?? existing.type,
          idCheckStatus: output.idCheckStatus ?? existing.idCheckStatus,
          addressCheckStatus: output.addressCheckStatus ?? existing.addressCheckStatus,
          employmentCheckStatus:
            output.employmentCheckStatus ?? existing.employmentCheckStatus,
          educationCheckStatus:
            output.educationCheckStatus ?? existing.educationCheckStatus,
          criminalCheckStatus:
            output.criminalCheckStatus ?? existing.criminalCheckStatus,
          referenceCheckStatus:
            output.referenceCheckStatus ?? existing.referenceCheckStatus,
          aiSummary,
          resultSummary,
          reviewNotes,
        },
      });

      await tx.automationJob.update({
        where: { id: BigInt(automationJobId) },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          errorCode: null,
          errorMessage: null,
          outputReference: sanitizeBgvOutputForStorage(output) as object,
        },
      });
    });

    await this.syncCandidateBgv(organizationId, candidateId, workflowStatus);

    await notifyBgvAnalysisProcessed(this.prisma, this.config, {
      organizationId,
      candidateId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`.trim(),
      backgroundCheckId,
      bgvStatus: workflowStatus,
      triggeredByUserId: params.requestedBy,
      webAppUrl: this.webAppUrl,
    });
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateBackgroundCheckInput,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(authUser, organizationId, input.candidateId);

    if (input.status) {
      assertRecruiterCannotSetDisposition(input.status);
    }

    const record = await this.backgroundCheckRepository.create(
      organizationId,
      authUser.id,
      {
        ...input,
        status: 'PENDING',
        initiatedAt: input.initiatedAt ?? new Date().toISOString(),
      },
    );

    await this.syncCandidateBgv(organizationId, input.candidateId, 'PENDING');

    return mapBackgroundCheckToDto(record);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateBackgroundCheckInput,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);

    const canApprove = roleHasPermission(
      authUser.role,
      PERMISSIONS.BACKGROUND_CHECKS_APPROVE,
    );
    if (!canApprove) {
      assertRecruiterCannotSetDisposition(input.status);
    }

    const patch = this.buildBgvUpdatePatch(existing, input);
    const record = await this.backgroundCheckRepository.update(
      organizationId,
      id,
      patch,
    );

    const candidateId = bigintToNumber(existing.candidateId);
    if (patch.status) {
      await this.syncCandidateBgv(organizationId, candidateId, patch.status);
    } else if (await this.candidateIsImported(organizationId, existing.candidateId)) {
      if (this.hasBgvEvidenceUpdate(patch)) {
        await syncImportedCandidateProfileStatus(
          this.prisma,
          organizationId,
          candidateId,
        );
      }
    }

    return this.toDetailDto(organizationId, record);
  }

  async confirmConsent(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(existing.status, BGV_CONSENT_ACTION_STATUSES, 'Confirm consent');

    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      consentConfirmedAt: new Date().toISOString(),
      consentConfirmedById: authUser.id,
    });

    return this.toDetailDto(organizationId, record);
  }

  async assignVendor(
    authUser: AuthenticatedUser,
    id: number,
    provider: string,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(existing.status, BGV_CONSENT_ACTION_STATUSES, 'Assign vendor');
    assertBgvConsentConfirmed(existing, 'Assign vendor');

    const trimmed = provider.trim();
    if (!trimmed) {
      throw new BadRequestError('Vendor / provider name is required');
    }

    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      provider: trimmed,
      vendorAssignedAt: new Date().toISOString(),
    });

    return this.toDetailDto(organizationId, record);
  }

  async startVerification(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(
      existing.status,
      ['PENDING', 'SUSPENDED', 'INITIATED'],
      'Start verification',
    );
    assertBgvConsentConfirmed(existing, 'Start verification');
    assertBgvVendorAssigned(existing, 'Start verification');

    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      status: 'IN_PROGRESS',
    });

    await this.syncCandidateBgv(
      organizationId,
      bigintToNumber(existing.candidateId),
      'IN_PROGRESS',
    );

    return this.toDetailDto(organizationId, record);
  }

  async uploadDocument(
    authUser: AuthenticatedUser,
    id: number,
    kind: BgvDocumentKindLabel,
    file: UploadBgvAssetInput,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    const isImported = await this.candidateIsImported(
      organizationId,
      existing.candidateId,
    );

    assertBgvStatusIn(
      existing.status,
      BGV_UPLOAD_DOCUMENT_STATUSES,
      'Upload document',
    );

    if (kind !== 'CONSENT' && !isImported) {
      assertBgvConsentConfirmed(existing, 'Upload document');
    }

    this.storageService.validateFile(UPLOAD_CATEGORIES.BACKGROUND_CHECK, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    const storageKey = this.storageService.buildBackgroundCheckAssetKey(
      organizationId,
      id,
      file.originalName,
    );

    const uploadResult = await this.storageService.upload(
      storageKey,
      {
        buffer: file.buffer,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
      },
      {
        category: UPLOAD_CATEGORIES.BACKGROUND_CHECK,
        organizationId,
        entityId: id,
      },
    );

    const fileUrl =
      (await this.storageService.resolveFileUrl(
        storageKey,
        uploadResult.bucket,
        file.mimeType,
      )) ?? `s3://${uploadResult.bucket}/${storageKey}`;

    const document = await this.backgroundCheckRepository.createDocument({
      organizationId,
      uploadedById: authUser.id,
      entityId: id,
      fileName: storageKey.split('/').pop() ?? file.originalName,
      originalName: file.originalName,
      s3Key: storageKey,
      s3Bucket: uploadResult.bucket,
      fileUrl,
      mimeType: file.mimeType,
      fileSize: file.size,
      description: kind,
    });

    const patch: UpdateBackgroundCheckInput = {};
    if (kind === 'CONSENT') {
      patch.consentDocumentId = bigintToNumber(document.id);
      if (!existing.consentConfirmedAt) {
        patch.consentConfirmedAt = new Date().toISOString();
        patch.consentConfirmedById = authUser.id;
      }
    } else if (isImported && !existing.consentConfirmedAt) {
      patch.consentConfirmedAt = new Date().toISOString();
      patch.consentConfirmedById = authUser.id;
    }
    if (kind === 'REPORT') {
      if (isImported) {
        if (!existing.provider?.trim()) {
          throw new BadRequestError('Set a vendor before uploading the BGV report');
        }
      } else {
        assertBgvVendorAssigned(existing, 'Upload final report');
        assertBgvStatusIn(
          existing.status,
          ['IN_PROGRESS', 'SUSPENDED'],
          'Upload final report',
        );
      }
      patch.reportDocumentId = bigintToNumber(document.id);
    }

    const record = await this.backgroundCheckRepository.update(
      organizationId,
      id,
      patch,
    );

    if (kind === 'REPORT' && (await this.isN8nBgvAnalysisEnabled()) && !isImported) {
      const updated = await this.getBackgroundCheckOrThrow(organizationId, id);
      await this.enqueueBgvAnalysisForExistingReport({
        authUser,
        organizationId,
        backgroundCheckId: id,
        existing: updated,
      }).catch((error) => {
        this.fastify.log.error(
          {
            backgroundCheckId: id,
            errorName: error instanceof Error ? error.name : 'UnknownError',
          },
          'Failed to enqueue n8n BGV analysis after report upload',
        );
      });
    }

    return this.toDetailDto(organizationId, record);
  }

  /**
   * Runs BGV AI extraction against the uploaded final report via n8n.
   */
  async extractAi(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BgvExtractAiResponse> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(
      existing.status,
      ['PENDING', 'IN_PROGRESS', 'CONSIDER', 'SUSPENDED'],
      'AI extraction',
    );
    assertBgvReportUploaded(existing, 'AI extraction');

    if (!(await this.isN8nBgvAnalysisEnabled())) {
      throw new BadRequestError(N8N_AUTOMATION_REQUIRED_MESSAGE);
    }

    return this.enqueueBgvAnalysisForExistingReport({
      authUser,
      organizationId,
      backgroundCheckId: id,
      existing,
    });
  }

  async submitForReview(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(existing.status, ['IN_PROGRESS', 'SUSPENDED'], 'Submit for review');
    assertBgvReportUploaded(existing, 'Submit for review');
    if (!existing.aiSummary?.trim()) {
      throw new BadRequestError(
        'Submit for review requires AI extraction on the final BGV report first',
      );
    }

    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      status: 'CONSIDER',
    });

    await this.syncCandidateBgv(
      organizationId,
      bigintToNumber(existing.candidateId),
      'CONSIDER',
    );

    return this.toDetailDto(organizationId, record);
  }

  async approve(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    this.assertCanApproveBgv(authUser);
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(existing.status, ['CONSIDER', 'IN_PROGRESS'], 'Approve verification');
    assertBgvReportUploaded(existing, 'Approve verification');

    const now = new Date().toISOString();
    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      status: 'CLEAR',
      completedAt: now,
      reviewedAt: now,
      reviewedById: authUser.id,
      reviewNotes: null,
    });

    await this.syncCandidateBgv(
      organizationId,
      bigintToNumber(existing.candidateId),
      'CLEAR',
    );

    return this.toDetailDto(organizationId, record);
  }

  async reject(
    authUser: AuthenticatedUser,
    id: number,
    notes?: string,
  ): Promise<BackgroundCheckDto> {
    this.assertCanApproveBgv(authUser);
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(
      existing.status,
      ['CONSIDER', 'IN_PROGRESS', 'SUSPENDED'],
      'Reject verification',
    );

    const now = new Date().toISOString();
    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      status: 'FAILED',
      completedAt: now,
      reviewedAt: now,
      reviewedById: authUser.id,
      reviewNotes: notes?.trim() || 'Verification rejected by admin',
    });

    await this.syncCandidateBgv(
      organizationId,
      bigintToNumber(existing.candidateId),
      'FAILED',
    );

    return this.toDetailDto(organizationId, record);
  }

  async requestClarification(
    authUser: AuthenticatedUser,
    id: number,
    notes: string,
  ): Promise<BackgroundCheckDto> {
    this.assertCanApproveBgv(authUser);
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(existing.status, ['CONSIDER', 'IN_PROGRESS'], 'Request clarification');

    const trimmed = notes.trim();
    if (!trimmed) {
      throw new BadRequestError('Clarification notes are required');
    }

    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      status: 'SUSPENDED',
      reviewedAt: new Date().toISOString(),
      reviewedById: authUser.id,
      reviewNotes: trimmed,
    });

    await this.syncCandidateBgv(
      organizationId,
      bigintToNumber(existing.candidateId),
      'SUSPENDED',
    );

    return this.toDetailDto(organizationId, record);
  }

  async reopen(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    this.assertCanApproveBgv(authUser);
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(
      existing.status,
      ['FAILED', 'SUSPENDED', 'CANCELLED', 'CLEAR'],
      'Reopen verification',
    );

    const record = await this.backgroundCheckRepository.update(organizationId, id, {
      status: 'PENDING',
      completedAt: null,
      reviewedAt: null,
      reviewedById: null,
    });

    await this.syncCandidateBgv(
      organizationId,
      bigintToNumber(existing.candidateId),
      'PENDING',
    );

    return this.toDetailDto(organizationId, record);
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    await this.getBackgroundCheckOrThrow(organizationId, id);
    await this.backgroundCheckRepository.softDelete(organizationId, id);
  }

  async downloadReport(
    authUser: AuthenticatedUser,
    backgroundCheckId: number,
  ): Promise<DocumentDownloadPayload> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getBackgroundCheckOrThrow(organizationId, backgroundCheckId);
    if (!record.reportDocumentId) {
      throw new NotFoundError('Background check report not found');
    }

    const document = await this.prisma.document.findFirst({
      where: {
        id: record.reportDocumentId,
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
    });
    if (!document) {
      throw new NotFoundError('Background check report not found');
    }

    return readStoredDocumentBuffer(document, this.fastify.config, this.storageService);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListBackgroundChecksQuery,
  ): Promise<{
    data: BackgroundCheckListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.backgroundCheckRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      candidateId: query.candidateId,
      status: query.status,
      type: query.type,
    });

    const salesOnly =
      roleHasPermission(authUser.role, PERMISSIONS.BACKGROUND_CHECKS_READ) &&
      !roleHasPermission(authUser.role, PERMISSIONS.BACKGROUND_CHECKS_WRITE);

    return {
      data: items.map((item) => {
        const mapped = mapBackgroundCheckToListItem(item);
        if (salesOnly) {
          return {
            ...mapped,
            // Sales: status, vendor, completion, AI summary — no report flags that imply doc access urgency beyond progress
            hasReportDocument: false,
          };
        }
        return mapped;
      }),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getBackgroundCheckOrThrow(organizationId, id);
    const dto = await this.toDetailDto(organizationId, record);

    const canWrite = roleHasPermission(
      authUser.role,
      PERMISSIONS.BACKGROUND_CHECKS_WRITE,
    );
    if (!canWrite) {
      // Sales: strip document URLs / filenames
      return {
        ...dto,
        documents: undefined,
        hasConsentDocument: false,
        hasReportDocument: false,
        supportingDocumentCount: 0,
        reviewNotes: null,
        resultSummary: null,
      };
    }

    return dto;
  }

  async getPublicSummaryForCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<BackgroundCheckPublicSummaryDto | null> {
    const record = await this.backgroundCheckRepository.findLatestClearForCandidate(
      organizationId,
      candidateId,
    );
    if (!record) return null;
    return mapBackgroundCheckToPublicSummary(record);
  }

  private assertCanApproveBgv(authUser: AuthenticatedUser): void {
    if (!roleHasPermission(authUser.role, PERMISSIONS.BACKGROUND_CHECKS_APPROVE)) {
      throw new AuthorizationError(
        'Only admins can approve, reject, clarify, or reopen background verifications',
      );
    }
  }

  private async candidateIsImported(
    organizationId: number,
    candidateId: bigint,
  ): Promise<boolean> {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id: candidateId,
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: { sourceCandidateId: true },
    });
    return Boolean(candidate?.sourceCandidateId?.trim());
  }

  private hasBgvEvidenceUpdate(patch: UpdateBackgroundCheckInput): boolean {
    return (
      patch.status !== undefined ||
      patch.type !== undefined ||
      patch.provider !== undefined ||
      patch.resultSummary !== undefined ||
      patch.reviewNotes !== undefined ||
      patch.idCheckStatus !== undefined ||
      patch.addressCheckStatus !== undefined ||
      patch.employmentCheckStatus !== undefined ||
      patch.educationCheckStatus !== undefined ||
      patch.criminalCheckStatus !== undefined ||
      patch.referenceCheckStatus !== undefined ||
      patch.initiatedAt !== undefined ||
      patch.completedAt !== undefined
    );
  }

  private buildBgvUpdatePatch(
    existing: NonNullable<Awaited<ReturnType<BackgroundCheckRepository['findById']>>>,
    input: UpdateBackgroundCheckInput,
  ): UpdateBackgroundCheckInput {
    const patch: UpdateBackgroundCheckInput = { ...input };
    const checkFieldsUpdated =
      patch.idCheckStatus !== undefined ||
      patch.addressCheckStatus !== undefined ||
      patch.employmentCheckStatus !== undefined ||
      patch.educationCheckStatus !== undefined ||
      patch.criminalCheckStatus !== undefined ||
      patch.referenceCheckStatus !== undefined;

    if (checkFieldsUpdated && patch.resultSummary === undefined) {
      patch.resultSummary = formatBgvCheckFieldsSummary({
        idCheckStatus: patch.idCheckStatus ?? existing.idCheckStatus,
        addressCheckStatus: patch.addressCheckStatus ?? existing.addressCheckStatus,
        employmentCheckStatus:
          patch.employmentCheckStatus ?? existing.employmentCheckStatus,
        educationCheckStatus: patch.educationCheckStatus ?? existing.educationCheckStatus,
        criminalCheckStatus: patch.criminalCheckStatus ?? existing.criminalCheckStatus,
        referenceCheckStatus: patch.referenceCheckStatus ?? existing.referenceCheckStatus,
      });
    }

    if (patch.provider?.trim() && !existing.vendorAssignedAt) {
      patch.vendorAssignedAt = new Date().toISOString();
    }

    const nextStatus = patch.status ?? existing.status;
    if (
      (nextStatus === 'CLEAR' || nextStatus === 'COMPLETED_CLEAR') &&
      patch.completedAt === undefined &&
      !existing.completedAt
    ) {
      patch.completedAt = new Date().toISOString();
    }

    return patch;
  }

  private async syncCandidateBgv(
    organizationId: number,
    candidateId: number,
    status: string,
  ): Promise<void> {
    await this.prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: {
        bgvStatus: status,
      },
    });

    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: { sourceCandidateId: true },
    });

    if (candidate?.sourceCandidateId?.trim()) {
      await syncImportedCandidateProfileStatus(this.prisma, organizationId, candidateId);
      return;
    }

    await this.prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: {
        profileStatus: deriveCandidateBgvProfileStatus(status),
      },
    });

    await maybeAutoSubmitSuperAdminCandidate(
      this.prisma,
      this.config,
      organizationId,
      candidateId,
    );
  }

  private async toDetailDto(
    organizationId: number,
    record: Awaited<ReturnType<BackgroundCheckRepository['findById']>>,
  ): Promise<BackgroundCheckDto> {
    if (!record) {
      throw new NotFoundError('Background check not found');
    }

    const docs = await this.backgroundCheckRepository.listDocuments(
      organizationId,
      bigintToNumber(record.id),
    );

    const mappedDocs: BgvDocumentDto[] = await Promise.all(
      docs.map(async (doc) => ({
        id: bigintToNumber(doc.id),
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        description: doc.description,
        url:
          (await this.storageService.resolveFileUrl(
            doc.s3Key,
            doc.s3Bucket,
            doc.mimeType,
          )) ?? doc.fileUrl,
        createdAt: doc.createdAt.toISOString(),
      })),
    );

    const supportingDocumentCount = docs.filter(
      (d) => d.description === 'SUPPORTING',
    ).length;

    return mapBackgroundCheckToDto(record, {
      documents: mappedDocs,
      supportingDocumentCount,
    });
  }

  private async getBackgroundCheckOrThrow(organizationId: number, id: number) {
    const record = await this.backgroundCheckRepository.findById(
      organizationId,
      id,
    );
    if (!record) {
      throw new NotFoundError('Background check not found');
    }
    return record;
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

    assertCanCreateBackgroundCheckForRole(authUser.role, candidate);
  }

  private async enqueueBgvAnalysisJob(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    candidateId: number;
    file: UploadBgvAssetInput;
  }): Promise<BgvAnalysisJobAccepted> {
    const { authUser, organizationId, candidateId, file } = params;

    await this.validateCandidate(authUser, organizationId, candidateId);

    this.storageService.validateFile(UPLOAD_CATEGORIES.BACKGROUND_CHECK, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    const uploadFile = await normalizeUploadToPdf(file);

    let backgroundCheckId: number | null = null;
    let documentId: number | null = null;

    try {
      const draft = await this.backgroundCheckRepository.create(
        organizationId,
        authUser.id,
        {
          candidateId,
          type: 'COMPREHENSIVE',
          status: 'PENDING',
        },
      );
      backgroundCheckId = bigintToNumber(draft.id);

      const storageKey = this.storageService.buildBackgroundCheckAssetKey(
        organizationId,
        backgroundCheckId,
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
          category: UPLOAD_CATEGORIES.BACKGROUND_CHECK,
          organizationId,
          entityId: backgroundCheckId,
        },
      );

      const storedFileUrl = buildS3ObjectReference(uploadResult.bucket, uploadResult.key);

      const signedUrl =
        (await this.storageService.resolveFileUrl(
          uploadResult.key,
          uploadResult.bucket,
          uploadFile.mimeType,
        )) ?? storedFileUrl;

      const document = await this.backgroundCheckRepository.createDocument({
        organizationId,
        uploadedById: authUser.id,
        entityId: backgroundCheckId,
        fileName: uploadResult.key.split('/').pop() ?? uploadFile.originalName,
        originalName: uploadFile.originalName,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        fileUrl: storedFileUrl,
        mimeType: uploadFile.mimeType,
        fileSize: uploadFile.size,
        description: 'REPORT',
      });
      documentId = bigintToNumber(document.id);

      await this.backgroundCheckRepository.update(organizationId, backgroundCheckId, {
        reportDocumentId: documentId,
      });

      const automation = new AutomationService(this.fastify);
      const job = await automation.enqueueBgvAnalysis({
        candidateId,
        documentId,
        requestedBy: authUser.id,
        documentUrl: signedUrl,
        inputReference: {
          candidateId,
          documentId,
          backgroundCheckId,
          fileName: uploadFile.originalName,
          mimeType: uploadFile.mimeType,
        },
      });

      await this.syncCandidateBgv(organizationId, candidateId, 'PENDING');

      return {
        jobId: job.id,
        status: job.status,
        candidateId,
        documentId,
        backgroundCheckId,
      };
    } catch (error) {
      if (backgroundCheckId != null) {
        await this.backgroundCheckRepository
          .softDelete(organizationId, backgroundCheckId)
          .catch(() => undefined);
      }
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'BGV AI analysis enqueue failed',
          );
    }
  }

  private async enqueueBgvAnalysisForExistingReport(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    backgroundCheckId: number;
    existing: NonNullable<Awaited<ReturnType<BackgroundCheckRepository['findById']>>>;
  }): Promise<BgvAnalysisJobAccepted> {
    const { authUser, organizationId, backgroundCheckId, existing } = params;

    const reportDoc = await this.prisma.document.findFirst({
      where: {
        id: existing.reportDocumentId!,
        organizationId: BigInt(organizationId),
        entityType: 'BACKGROUND_CHECK',
        entityId: BigInt(backgroundCheckId),
        deletedAt: null,
      },
    });
    if (!reportDoc?.s3Key || !reportDoc.s3Bucket) {
      throw new BadRequestError('BGV report document is missing storage metadata');
    }

    const downloaded = await readStoredDocumentBuffer(
      reportDoc,
      this.fastify.config,
      this.storageService,
    );

    const uploadFile = await normalizeUploadToPdf({
      buffer: downloaded.buffer,
      originalName: reportDoc.originalName || reportDoc.fileName || 'bgv-report.pdf',
      mimeType: reportDoc.mimeType || 'application/pdf',
      size: downloaded.buffer.length,
    });

    let documentId = bigintToNumber(existing.reportDocumentId!);
    let signedUrl: string;

    const alreadyPdf =
      uploadFile.mimeType === 'application/pdf' &&
      reportDoc.mimeType === 'application/pdf' &&
      uploadFile.size === downloaded.buffer.length;

    if (alreadyPdf) {
      signedUrl =
        (await this.storageService.resolveFileUrl(
          reportDoc.s3Key,
          reportDoc.s3Bucket,
          uploadFile.mimeType,
        )) ?? buildS3ObjectReference(reportDoc.s3Bucket, reportDoc.s3Key);
    if (!signedUrl) {
      throw new BadRequestError('Unable to resolve signed URL for BGV report');
    }
    } else {
      const storageKey = this.storageService.buildBackgroundCheckAssetKey(
        organizationId,
        backgroundCheckId,
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
          category: UPLOAD_CATEGORIES.BACKGROUND_CHECK,
          organizationId,
          entityId: backgroundCheckId,
        },
      );
      const storedFileUrl = buildS3ObjectReference(uploadResult.bucket, uploadResult.key);
      signedUrl =
        (await this.storageService.resolveFileUrl(
          uploadResult.key,
          uploadResult.bucket,
          uploadFile.mimeType,
        )) ?? storedFileUrl;

      await this.prisma.document.update({
        where: { id: reportDoc.id },
        data: {
          fileName: uploadResult.key.split('/').pop() ?? uploadFile.originalName,
          originalName: uploadFile.originalName,
          s3Key: uploadResult.key,
          s3Bucket: uploadResult.bucket,
          fileUrl: storedFileUrl,
          mimeType: uploadFile.mimeType,
          fileSize: BigInt(uploadFile.size),
        },
      });
    }

    const candidateId = bigintToNumber(existing.candidateId);

    const automation = new AutomationService(this.fastify);
    const job = await automation.enqueueBgvAnalysis({
      candidateId,
      documentId,
      requestedBy: authUser.id,
      documentUrl: signedUrl,
      inputReference: {
        candidateId,
        documentId,
        backgroundCheckId,
        fileName: uploadFile.originalName,
        mimeType: uploadFile.mimeType,
      },
    });

    return {
      jobId: job.id,
      status: job.status,
      candidateId,
      documentId,
      backgroundCheckId,
    };
  }
}

function bgvOutputToExtraction(output: BgvAnalysisOutput): BgvExtractionResponse {
  return normalizeBgvExtractionResponse({
    status: output.overallStatus ?? output.status,
    vendorName: output.vendorName,
    idCheckStatus: output.idCheckStatus,
    addressCheckStatus: output.addressCheckStatus,
    employmentCheckStatus: output.employmentCheckStatus,
    educationCheckStatus: output.educationCheckStatus,
    criminalCheckStatus: output.criminalCheckStatus,
    referenceCheckStatus: output.referenceCheckStatus,
    aiBgvSummary: output.aiBgvSummary,
    concernNotes: output.concernNotes,
    checkType: output.checkType,
    confidence: output.confidence,
    warnings: output.warnings,
  });
}

/** Strip fields that must not be stored or returned to clients. */
function sanitizeBgvOutputForStorage(output: BgvAnalysisOutput): BgvAnalysisOutput {
  const { ...safe } = output;
  return safe;
}

function normalizeBgvCheckType(
  value: string | undefined,
): CreateBackgroundCheckInput['type'] | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().toUpperCase();
  const allowed = [
    'CRIMINAL',
    'EMPLOYMENT',
    'EDUCATION',
    'REFERENCE',
    'IDENTITY',
    'CREDIT',
    'COMPREHENSIVE',
  ] as const;
  return allowed.find((item) => item === normalized);
}
