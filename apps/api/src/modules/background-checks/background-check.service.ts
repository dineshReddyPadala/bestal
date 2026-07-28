import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  AuthorizationError,
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { StorageService } from '../../services/storage.service.js';
import { UPLOAD_CATEGORIES } from '../../services/storage/storage.constants.js';
import {
  bufferToBase64,
  BgvExtractionClient,
  formatBgvAiSummaryJson,
  formatBgvCheckStatusesSummary,
  type BgvExtractionResponse,
} from '../../services/bgv-extraction.client.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { PERMISSIONS, roleHasPermission } from '../auth/auth.permissions.js';
import { assertCanCreateBackgroundCheck } from '../candidates/candidate-pipeline.js';
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

export type BgvExtractResult = {
  extraction: BgvExtractionResponse;
  liveAi: boolean;
};

export class BackgroundCheckService {
  private readonly backgroundCheckRepository: BackgroundCheckRepository;
  private readonly prisma: PrismaClient;
  private readonly storageService: StorageService;
  private readonly bgvExtractionClient: BgvExtractionClient;

  constructor(
    fastify: FastifyInstance,
    backgroundCheckRepository?: BackgroundCheckRepository,
  ) {
    this.backgroundCheckRepository =
      backgroundCheckRepository ?? new BackgroundCheckRepository(fastify.prisma);
    this.prisma = fastify.prisma;
    this.storageService = new StorageService(fastify.config);
    this.bgvExtractionClient = new BgvExtractionClient(fastify.config.aiBgvUrl);
  }

  /**
   * Calls Python ai-service BGV route (or static stub). Does not persist a BGV row —
   * UI reviews fields then POSTs /background-checks.
   */
  async extractBgvDocument(
    authUser: AuthenticatedUser,
    file: UploadBgvAssetInput,
    candidateId?: number,
  ): Promise<BgvExtractResult> {
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
      const extraction = await this.bgvExtractionClient.extract({
        fileName: file.originalName,
        mimeType: file.mimeType,
        content: bufferToBase64(file.buffer),
        ...(candidateId != null && candidateId > 0
          ? { candidateId: String(candidateId) }
          : {}),
      });

      if (!extraction.aiBgvSummary?.trim()) {
        throw new BadRequestError(
          'AI did not return a background verification summary for this document.',
        );
      }

      return {
        extraction,
        liveAi: this.bgvExtractionClient.isLiveAiConfigured,
      };
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'BGV extraction failed',
          );
    }
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateBackgroundCheckInput,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(organizationId, input.candidateId);

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

    const record = await this.backgroundCheckRepository.update(
      organizationId,
      id,
      input,
    );

    if (input.status) {
      await this.syncCandidateBgv(
        organizationId,
        bigintToNumber(existing.candidateId),
        input.status,
      );
    }

    return this.toDetailDto(organizationId, record);
  }

  async confirmConsent(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(existing.status, ['PENDING', 'IN_PROGRESS', 'SUSPENDED'], 'Confirm consent');

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
    assertBgvStatusIn(existing.status, ['PENDING', 'IN_PROGRESS', 'SUSPENDED'], 'Assign vendor');
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
    assertBgvStatusIn(existing.status, ['PENDING', 'SUSPENDED'], 'Start verification');
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
    assertBgvStatusIn(
      existing.status,
      ['PENDING', 'IN_PROGRESS', 'SUSPENDED', 'CONSIDER'],
      'Upload document',
    );

    if (kind !== 'CONSENT') {
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
    }
    if (kind === 'REPORT') {
      assertBgvVendorAssigned(existing, 'Upload final report');
      assertBgvStatusIn(
        existing.status,
        ['IN_PROGRESS', 'SUSPENDED'],
        'Upload final report',
      );
      patch.reportDocumentId = bigintToNumber(document.id);

      // Best-effort live AI extract on report upload (ai-service or static stub).
      try {
        const extraction = await this.bgvExtractionClient.extract({
          fileName: file.originalName,
          mimeType: file.mimeType,
          content: bufferToBase64(file.buffer),
          candidateId: String(bigintToNumber(existing.candidateId)),
        });
        patch.aiSummary = formatBgvAiSummaryJson(extraction, {
          provider: existing.provider,
          checkType: existing.type,
          liveAi: this.bgvExtractionClient.isLiveAiConfigured,
        });
        patch.resultSummary = formatBgvCheckStatusesSummary(extraction);
      } catch {
        // Keep the uploaded report even if AI fails; recruiter can retry via extract-ai.
      }
    }

    const record = await this.backgroundCheckRepository.update(
      organizationId,
      id,
      patch,
    );

    return this.toDetailDto(organizationId, record);
  }

  /**
   * Runs BGV AI extraction against the uploaded final report (AI_BGV_URL → ai-service).
   */
  async extractAi(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);
    assertBgvStatusIn(
      existing.status,
      ['PENDING', 'IN_PROGRESS', 'CONSIDER', 'SUSPENDED'],
      'AI extraction',
    );
    assertBgvReportUploaded(existing, 'AI extraction');

    const reportDoc = await this.prisma.document.findFirst({
      where: {
        id: existing.reportDocumentId!,
        organizationId: BigInt(organizationId),
        entityType: 'BACKGROUND_CHECK',
        entityId: BigInt(id),
        deletedAt: null,
      },
    });
    if (!reportDoc?.s3Key || !reportDoc.s3Bucket) {
      throw new BadRequestError('BGV report document is missing storage metadata');
    }

    const downloadUrl = await this.storageService.resolveFileUrl(
      reportDoc.s3Key,
      reportDoc.s3Bucket,
      reportDoc.mimeType ?? undefined,
    );
    if (!downloadUrl) {
      throw new BadRequestError('Unable to download BGV report for AI extraction');
    }

    let fileBuffer: Buffer;
    try {
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error(`HTTP ${fileResponse.status}`);
      }
      fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error
          ? `Failed to download BGV report: ${error.message}`
          : 'Failed to download BGV report for AI extraction',
      );
    }

    try {
      const extraction = await this.bgvExtractionClient.extract({
        fileName: reportDoc.originalName || reportDoc.fileName || 'bgv-report.pdf',
        mimeType: reportDoc.mimeType || 'application/pdf',
        content: bufferToBase64(fileBuffer),
        candidateId: String(bigintToNumber(existing.candidateId)),
      });

      if (!extraction.aiBgvSummary?.trim()) {
        throw new BadRequestError(
          'AI did not return a background verification summary for this report.',
        );
      }

      const summary = formatBgvAiSummaryJson(extraction, {
        provider: existing.provider,
        checkType: existing.type,
        liveAi: this.bgvExtractionClient.isLiveAiConfigured,
      });

      const record = await this.backgroundCheckRepository.update(organizationId, id, {
        aiSummary: summary,
        resultSummary: formatBgvCheckStatusesSummary(extraction),
      });

      return this.toDetailDto(organizationId, record);
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'BGV AI extraction failed',
          );
    }
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
        profileStatus: deriveCandidateBgvProfileStatus(status),
      },
    });
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

    assertCanCreateBackgroundCheck(candidate);
  }
}
