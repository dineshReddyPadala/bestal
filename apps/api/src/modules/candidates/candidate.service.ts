import type { DocumentKind, PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { ROLES } from '../../constants/index.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  PERMISSIONS,
  roleHasPermission,
} from '../auth/auth.permissions.js';
import {
  assertSalesLimitedCandidateUpdate,
  redactCandidateForClient,
  redactCandidatePayFields,
} from './candidate-access.js';
import {
  normalizeCandidateSkills,
  normalizeSkillsForPersistence,
} from './candidate-skills.js';
import type { ResumeScreeningOutput } from '../automation/dto/resume-screening.dto.js';
import { AutomationService } from '../automation/automation.service.js';
import { N8nClient } from '../automation/n8n.client.js';
import { readN8nConfig } from '../../services/system-settings.reader.js';
import {
  assertCanApprove,
  assertCanCompletePricing,
  assertCanCompleteRecruiterReview,
  assertCanPublish,
  assertCanRunAiScreening,
  assertCanSubmitForApproval,
  isPricingComplete,
  type PipelineCandidateSnapshot,
} from './candidate-pipeline.js';
import { isClearBgvStatus } from './candidate-import-status.js';
import { notifyCandidatePendingApproval } from '../../services/notification-events.js';
import { StorageService } from '../../services/storage.service.js';
import { normalizeUploadToPdf } from '../../services/document-pdf-normalizer.js';
import {
  bufferToBase64,
  ResumeExtractionClient,
} from '../../services/resume-extraction.client.js';
import type { ResumeExtractionResponse } from '../../services/resume-extraction.types.js';
import type { UploadCategory } from '../../services/storage/storage.constants.js';
import {
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  bigintToNumber,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapCandidateToDtoAsync,
  mapCandidateToListItemAsync,
} from './candidate.mapper.js';
import { CandidateRepository } from './candidate.repository.js';
import type {
  CandidateAssetKind,
  CandidateDto,
  CandidateListItemDto,
  CompleteRecruiterReviewInput,
  CreateCandidateInput,
  CreateCandidateSkillInput,
  ExtractResumeResult,
  RejectCandidateInput,
  ResumeScreeningJobAccepted,
  RunAiScreeningInput,
  UpdateCandidateInput,
  UploadAssetInput,
} from './candidate.types.js';
import type { ListCandidatesQuery } from './candidate.validator.js';

export class CandidateService {
  private readonly candidateRepository: CandidateRepository;
  private readonly storageService: StorageService;
  private readonly resumeExtractionClient: ResumeExtractionClient;
  private readonly prisma: PrismaClient;
  private readonly fastify: FastifyInstance;

  constructor(
    fastify: FastifyInstance,
    candidateRepository?: CandidateRepository,
  ) {
    this.fastify = fastify;
    this.candidateRepository = candidateRepository ?? new CandidateRepository(
      fastify.prisma,
    );
    this.storageService = new StorageService(fastify.config);
    this.resumeExtractionClient = new ResumeExtractionClient(
      fastify.config.aiExtractionUrl,
    );
    this.prisma = fastify.prisma;
  }

  private async isN8nResumeScreeningEnabled(): Promise<boolean> {
    const config = await readN8nConfig(this.prisma);
    return new N8nClient(config).isResumeConfigured();
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateCandidateInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);

    await this.validateSkillCommunity(input.primarySkillCommunityId);

    if (input.skills?.length) {
      for (const skill of input.skills) {
        await this.validateSkillCommunity(skill.skillCommunityId);
      }
    }

    const existing = await this.candidateRepository.findByEmail(
      organizationId,
      input.email,
    );

    if (existing) {
      throw new ConflictError('A candidate with this email already exists');
    }

    const {
      profileStatus: _profileStatus,
      visibility: _visibility,
      evaluationStatus: _evaluationStatus,
      bgvStatus: _bgvStatus,
      ...safeInput
    } = input;

    const candidate = await this.candidateRepository.create(organizationId, {
      ...safeInput,
      skills: normalizeCandidateSkills(safeInput.skills),
      profileStatus: 'SOURCED',
      visibility: 'INTERNAL_ONLY',
      createdById: authUser.id,
    });
    return this.toDto(candidate, authUser);
  }

  /**
   * Uploads a resume and starts AI screening.
   *
   * Branches on `existingCandidateId` and n8n availability:
   * 1. **Re-screen** (`existingCandidateId` set) — upload to existing candidate, then sync or async screening.
   * 2. **New + n8n** — upload with placeholder document owner; candidate created on callback when AI returns a name.
   * 3. **New + sync** — extract first, create candidate with real names, then upload and apply fields.
   *
   * Never creates placeholder names like "Draft Candidate".
   */
  async extractResumeAndCreateDraft(
    authUser: AuthenticatedUser,
    file: UploadAssetInput,
    existingCandidateId?: number,
  ): Promise<ExtractResumeResult> {
    const organizationId = this.requireOrganization(authUser);
    const uploadCategory = this.storageService.uploadCategoryFromDocumentKind('RESUME');

    this.storageService.validateFile(uploadCategory, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    const n8nEnabled = await this.isN8nResumeScreeningEnabled();
    const uploadFile = n8nEnabled ? await normalizeUploadToPdf(file) : file;

    if (existingCandidateId != null && existingCandidateId > 0) {
      // --- Re-screen: attach resume to an existing candidate ---
      const existing = await this.getCandidateOrThrow(
        organizationId,
        existingCandidateId,
      );
      const candidate = existing;

      try {
        const uploaded = await this.uploadResumeForDraft({
          authUser,
          organizationId,
          candidate,
          candidateId: existingCandidateId,
          file: uploadFile,
          uploadCategory,
        });

        if (n8nEnabled) {
          // Return immediately; frontend polls GET /automation/jobs/:id.
          return this.enqueueResumeScreeningJob({
            authUser,
            organizationId,
            candidateId: existingCandidateId,
            documentId: uploaded.documentId,
            documentUrl: uploaded.signedUrl,
            fileName: uploadFile.originalName,
            mimeType: uploadFile.mimeType,
          });
        }

        const extraction = await this.resumeExtractionClient.extract({
          fileName: file.originalName,
          mimeType: file.mimeType,
          content: bufferToBase64(file.buffer),
        });

        const updated = await this.applyExtractionToDraft(
          organizationId,
          existingCandidateId,
          existing.email,
          extraction,
        );

        return {
          candidate: await this.toDto(updated, authUser),
          extraction,
        };
      } catch (error) {
        throw error instanceof BadRequestError || error instanceof ConflictError
          ? error
          : new BadRequestError(
              error instanceof Error ? error.message : 'Resume extraction failed',
            );
      }
    }

    if (n8nEnabled) {
      // --- New upload + async n8n: defer candidate creation until callback ---
      let uploaded: { documentId: number; signedUrl: string } | null = null;
      try {
        uploaded = await this.uploadResumePendingScreening({
          authUser,
          organizationId,
          file: uploadFile,
          uploadCategory,
        });
        return await this.enqueueResumeScreeningJob({
          authUser,
          organizationId,
          candidateId: null, // linked in applyResumeScreeningFromAutomation on COMPLETED
          documentId: uploaded.documentId,
          documentUrl: uploaded.signedUrl,
          fileName: uploadFile.originalName,
          mimeType: uploadFile.mimeType,
        });
      } catch (error) {
        // Orphan document cleanup when enqueue/trigger fails before a candidate exists.
        if (uploaded?.documentId) {
          await this.candidateRepository
            .softDeleteDocument(BigInt(uploaded.documentId))
            .catch(() => undefined);
        }
        throw error instanceof BadRequestError || error instanceof ConflictError
          ? error
          : new BadRequestError(
              error instanceof Error ? error.message : 'Resume extraction failed',
            );
      }
    }

    let candidateId: number | null = null;
    try {
      // --- New upload + sync extraction: extract → create → upload → apply ---
      const extraction = await this.resumeExtractionClient.extract({
        fileName: file.originalName,
        mimeType: file.mimeType,
        content: bufferToBase64(file.buffer),
      });

      const identity = await this.resolveExtractionIdentity(
        organizationId,
        extraction,
      );
      const draft = await this.candidateRepository.create(organizationId, {
        firstName: identity.firstName,
        lastName: identity.lastName,
        email: identity.email,
        source: 'JOB_BOARD',
        profileStatus: 'SOURCED',
        visibility: 'INTERNAL_ONLY',
        createdById: authUser.id,
      });
      candidateId = bigintToNumber(draft.id);

      const candidate = await this.getCandidateOrThrow(organizationId, candidateId);
      await this.uploadResumeForDraft({
        authUser,
        organizationId,
        candidate,
        candidateId,
        file,
        uploadCategory,
      });

      const updated = await this.applyExtractionToDraft(
        organizationId,
        candidateId,
        identity.email,
        extraction,
      );

      return {
        candidate: await this.toDto(updated, authUser),
        extraction,
      };
    } catch (error) {
      // Roll back candidate if upload/apply fails after sync create.
      if (candidateId != null) {
        await this.candidateRepository
          .softDelete(organizationId, candidateId)
          .catch(() => undefined);
      }
      throw error instanceof BadRequestError || error instanceof ConflictError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'Resume extraction failed',
          );
    }
  }

  /** Resolves display identity from sync extraction; rejects when no name is found. */
  private async resolveExtractionIdentity(
    organizationId: number,
    extraction: ResumeExtractionResponse,
    fallbackEmail?: string,
  ): Promise<{ firstName: string; lastName: string; email: string }> {
    const extracted = extraction.candidate;
    const firstName = extracted.firstName?.trim() ?? '';
    const lastName = extracted.lastName?.trim() ?? '';
    if (!firstName && !lastName) {
      throw new BadRequestError(
        'Resume extraction did not identify a candidate name',
      );
    }

    let email =
      extracted.email?.trim().toLowerCase() ||
      fallbackEmail ||
      `draft-${randomUUID()}@draft.bestal.local`;

    if (email !== fallbackEmail) {
      const existing = await this.candidateRepository.findByEmail(
        organizationId,
        email,
      );
      if (existing) {
        extraction.warnings = [
          ...(extraction.warnings ?? []),
          `Email ${email} already exists — using a temporary email until you change it.`,
        ];
        email = fallbackEmail ?? `draft-${randomUUID()}@draft.bestal.local`;
      }
    }

    return { firstName, lastName, email };
  }

  /** Creates AutomationJob and triggers n8n; does not wait for OpenAI. */
  private async enqueueResumeScreeningJob(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    candidateId: number | null;
    documentId: number;
    documentUrl: string;
    fileName: string;
    mimeType: string;
  }): Promise<ResumeScreeningJobAccepted> {
    const automation = new AutomationService(this.fastify);
    const job = await automation.enqueueResumeScreening({
      candidateId: params.candidateId ?? undefined,
      documentId: params.documentId,
      requestedBy: params.authUser.id,
      documentUrl: params.documentUrl,
      inputReference: {
        organizationId: params.organizationId,
        candidateId: params.candidateId,
        documentId: params.documentId,
        fileName: params.fileName,
        mimeType: params.mimeType,
      },
    });

    return {
      jobId: job.id,
      status: job.status,
      candidateId: params.candidateId,
      documentId: params.documentId,
    };
  }

  /**
   * Persist validated n8n resume screening output (transactional, idempotent caller).
   * When `candidateId` is null, creates the candidate inside the transaction and links the
   * pending resume document (uploaded with entityId 0).
   */
  async applyResumeScreeningFromAutomation(params: {
    organizationId: number;
    candidateId?: number | null;
    documentId?: number;
    createdById?: number;
    automationJobId: number;
    output: ResumeScreeningOutput;
  }): Promise<void> {
    const { organizationId, automationJobId, output } = params;
    let candidateId = params.candidateId ?? null;
    let candidate =
      candidateId != null
        ? await this.candidateRepository.findById(organizationId, candidateId)
        : null;
    if (candidateId != null && !candidate) {
      throw new NotFoundError('Candidate not found');
    }

    const firstName =
      output.firstName?.trim() ||
      output.candidate?.firstName?.trim() ||
      candidate?.firstName?.trim() ||
      '';
    const lastName =
      output.lastName?.trim() ||
      output.candidate?.lastName?.trim() ||
      candidate?.lastName?.trim() ||
      '';
    if (!firstName && !lastName) {
      throw new BadRequestError('AI screening did not return a candidate name');
    }

    let email =
      output.email?.trim().toLowerCase() ||
      output.candidate?.email?.trim().toLowerCase() ||
      candidate?.email ||
      `draft-${randomUUID()}@draft.bestal.local`;

    if (candidate && email !== candidate.email) {
      const existing = await this.candidateRepository.findByEmail(organizationId, email);
      if (existing && bigintToNumber(existing.id) !== candidateId) {
        email = candidate.email;
      }
    } else if (!candidate) {
      const existing = await this.candidateRepository.findByEmail(organizationId, email);
      if (existing) {
        email = `draft-${randomUUID()}@draft.bestal.local`;
      }
    }

    const communities = await this.prisma.skillCommunity.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    });

    const matchCommunityId = (value: string | undefined | null): number | null => {
      const normalized = value?.toLowerCase().trim();
      if (!normalized) return null;
      const exact = communities.find((c) => c.name.toLowerCase() === normalized);
      if (exact) return Number(exact.id);
      const partial = communities.find(
        (c) =>
          normalized.includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(normalized),
      );
      return partial ? Number(partial.id) : null;
    };

    const communityFromExtraction = matchCommunityId(output.community);
    const fallbackCommunityId = communities[0] ? Number(communities[0].id) : null;
    const defaultCategory = output.skillCategory;

    const mappedSkills: CreateCandidateSkillInput[] = [];
    for (const [index, skill] of (output.skills ?? []).entries()) {
      const skillLabel = skill.skillName?.trim() || skill.name?.trim() || '';
      if (!skillLabel) continue;
      const skillCommunityId =
        matchCommunityId(skill.skillCategory) ??
        matchCommunityId(skillLabel) ??
        communityFromExtraction ??
        fallbackCommunityId;
      if (!skillCommunityId) continue;
      const proficiencyLevel =
        skill.proficiencyLevel ?? skill.proficiency ?? 'INTERMEDIATE';
      mappedSkills.push({
        skillCommunityId,
        skillName: skillLabel.slice(0, 150),
        skillCategory: skill.skillCategory ?? defaultCategory,
        proficiencyLevel,
        yearsExperience:
          skill.skillYearsExperience ?? skill.yearsExperience ?? undefined,
        isPrimary: skill.isPrimary || index === 0,
        notes: skillLabel,
      });
    }

    const normalizedSkills = normalizeSkillsForPersistence(mappedSkills);
    const primarySkillCommunityId =
      communityFromExtraction ??
      normalizedSkills?.find((s) => s.isPrimary)?.skillCommunityId ??
      normalizedSkills?.[0]?.skillCommunityId ??
      fallbackCommunityId ??
      undefined;

    const summary =
      output.summary?.trim() ||
      output.candidate?.summary?.trim() ||
      undefined;
    const aiSummary = output.aiSummary?.trim() || summary;
    const hasScreeningSignal =
      output.bestalScore != null ||
      Boolean(aiSummary) ||
      Boolean(output.strengths?.trim());

    const clientBillRate = output.recommendedClientRate;
    const candidatePayRate = output.recommendedCandidateRate;
    const grossMargin =
      clientBillRate != null && candidatePayRate != null
        ? clientBillRate - candidatePayRate
        : undefined;

    const yearsExperience =
      output.yearsExperience ?? output.candidate?.yearsExperience ?? undefined;

    const latestJob = output.experience?.[0];
    const educationFromHistory = (output.educationHistory ?? [])
      .map((entry) =>
        [entry.degree, entry.fieldOfStudy, entry.institution, entry.graduationYear]
          .filter((part) => part != null && part !== '')
          .join(', '),
      )
      .filter(Boolean)
      .join('; ');
    const educationText = output.education?.trim() || educationFromHistory || undefined;

    const experienceJobs = output.experience ?? [];
    const isCurrentRole = (endDate: string | null | undefined): boolean => {
      const end = endDate?.trim().toLowerCase() ?? '';
      return !end || end === 'present' || end === 'current' || end === 'now' || end === 'ongoing';
    };
    const currentRole =
      experienceJobs.find((job) => isCurrentRole(job.endDate)) ?? experienceJobs[0] ?? latestJob;
    const headlineCompany = (() => {
      const headline = output.headline?.trim() || output.candidate?.headline?.trim();
      if (!headline) return undefined;
      const match = headline.match(/\bat\s+([^|,]+)/i);
      return match?.[1]?.trim() || undefined;
    })();
    const currentCompany =
      output.currentCompany?.trim() ||
      currentRole?.company?.trim() ||
      headlineCompany ||
      undefined;

    await this.prisma.$transaction(async (tx) => {
      // Row lock prevents concurrent callbacks from double-applying results.
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

      if (candidateId == null) {
        // Deferred create path: AI returned a name → create candidate and wire document + job.
        const documentId = params.documentId;
        if (documentId == null || documentId <= 0) {
          throw new BadRequestError(
            'Resume screening job is missing documentId for candidate creation',
          );
        }

        const created = await tx.candidate.create({
          data: {
            organizationId: BigInt(organizationId),
            firstName,
            lastName,
            email,
            displayName: `${firstName} ${lastName}`.trim(),
            source: 'JOB_BOARD',
            profileStatus: 'SOURCED',
            visibility: 'INTERNAL_ONLY',
            createdById: params.createdById
              ? BigInt(params.createdById)
              : undefined,
          },
        });
        candidateId = bigintToNumber(created.id);

        await tx.document.update({
          where: { id: BigInt(documentId) },
          data: { entityId: BigInt(candidateId) },
        });

        await tx.candidate.update({
          where: {
            id: BigInt(candidateId),
            organizationId: BigInt(organizationId),
          },
          data: { resumeDocumentId: BigInt(documentId) },
        });

        await tx.automationJob.update({
          where: { id: BigInt(automationJobId) },
          data: { candidateId: BigInt(candidateId) },
        });
      }

      await tx.candidateSkill.deleteMany({
        where: { candidateId: BigInt(candidateId!) },
      });

      await tx.candidate.update({
        where: {
          id: BigInt(candidateId!),
          organizationId: BigInt(organizationId),
        },
        data: {
          firstName,
          lastName,
          email,
          phone: output.phone ?? output.candidate?.phone ?? undefined,
          location: output.location ?? output.candidate?.location ?? undefined,
          timezone: output.timezone ?? output.candidate?.timezone ?? undefined,
          headline:
            output.headline ??
            output.candidate?.headline ??
            output.primaryRole ??
            undefined,
          primaryRole: output.primaryRole ?? output.headline ?? undefined,
          currentCompany,
          education: educationText,
          summary,
          clientProfileSummary: summary,
          yearsExperience:
            yearsExperience != null ? Math.round(yearsExperience) : undefined,
          displayName: `${firstName} ${lastName}`.trim(),
          strengths: output.strengths ?? undefined,
          weaknesses: output.weaknesses ?? undefined,
          riskFlags: output.riskFlags ?? undefined,
          aiSummary,
          bestalScore: output.bestalScore ?? undefined,
          clientBillRate: clientBillRate ?? undefined,
          candidatePayRate: candidatePayRate ?? undefined,
          grossMargin,
          primarySkillCommunityId: primarySkillCommunityId
            ? BigInt(primarySkillCommunityId)
            : undefined,
          profileStatus: hasScreeningSignal ? 'AI_SCREENED' : 'SOURCED',
          aiScreeningStatus: 'COMPLETED',
          ...(normalizedSkills?.length
            ? {
                skills: {
                  create: normalizedSkills.map((skill) => ({
                    skillCommunityId:
                      skill.skillCommunityId != null
                        ? BigInt(skill.skillCommunityId)
                        : null,
                    skillName: skill.skillName?.trim() || 'Skill',
                    skillCategory: skill.skillCategory,
                    proficiencyLevel: skill.proficiencyLevel ?? 'INTERMEDIATE',
                    yearsExperience: skill.yearsExperience,
                    isPrimary: skill.isPrimary ?? false,
                    notes: skill.notes,
                  })),
                },
              }
            : {}),
        },
      });

      if (output.bestalScore != null) {
        // Avoid duplicate score rows for the same automation job replay.
        const existingScore = await tx.candidateScore.findFirst({
          where: {
            candidateId: BigInt(candidateId!),
            organizationId: BigInt(organizationId),
            scoreSource: 'BESTAL_AI',
            deletedAt: null,
            bestalScore: output.bestalScore,
          },
          select: { id: true },
        });
        if (!existingScore) {
          await tx.candidateScore.create({
            data: {
              organizationId: BigInt(organizationId),
              candidateId: BigInt(candidateId!),
              bestalScore: output.bestalScore,
              scoreSource: 'BESTAL_AI',
              scoreDate: new Date(),
            },
          });
        }
      }

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
  }

  /**
   * Upload resume for a new screening job before a candidate row exists.
   * Document is stored with entityId 0; reassigned in applyResumeScreeningFromAutomation.
   */
  private async uploadResumePendingScreening(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    file: UploadAssetInput;
    uploadCategory: UploadCategory;
  }): Promise<{ documentId: number; signedUrl: string; durableFileUrl: string }> {
    const { authUser, organizationId, file, uploadCategory } = params;
    // Placeholder owner until callback creates the candidate and updates entityId.
    const pendingEntityId = 0;
    const storageKey = this.storageService.buildCandidateAssetKey(
      organizationId,
      pendingEntityId,
      uploadCategory,
      file.originalName,
    );

    let uploadResult;
    try {
      uploadResult = await this.storageService.upload(
        storageKey,
        {
          buffer: file.buffer,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        },
        {
          category: uploadCategory,
          organizationId,
          entityId: pendingEntityId,
        },
      );
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof ConflictError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'Resume upload failed',
          );
    }

    const durableFileUrl =
      uploadResult.url ??
      (await this.storageService.resolveFileUrl(
        uploadResult.key,
        uploadResult.bucket,
        file.mimeType,
      )) ??
      `s3://${uploadResult.bucket}/${uploadResult.key}`;

    const signedUrl =
      (await this.storageService.resolveFileUrl(
        uploadResult.key,
        uploadResult.bucket,
        file.mimeType,
      )) ?? durableFileUrl;

    const document = await this.candidateRepository.createDocument({
      organizationId,
      uploadedById: authUser.id,
      entityId: pendingEntityId,
      kind: 'RESUME',
      fileName: storageKey.split('/').pop() ?? file.originalName,
      originalName: file.originalName,
      s3Key: storageKey,
      s3Bucket: uploadResult.bucket,
      fileUrl: durableFileUrl,
      mimeType: file.mimeType,
      fileSize: file.size,
    });

    return {
      documentId: bigintToNumber(document.id),
      signedUrl,
      durableFileUrl,
    };
  }

  /** Upload resume to storage and link as the candidate's RESUME document (existing row required). */
  private async uploadResumeForDraft(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    candidate: NonNullable<Awaited<ReturnType<CandidateRepository['findById']>>>;
    candidateId: number;
    file: UploadAssetInput;
    uploadCategory: UploadCategory;
  }): Promise<{ documentId: number; signedUrl: string; durableFileUrl: string }> {
    const { authUser, organizationId, candidate, candidateId, file, uploadCategory } = params;
    const storageKey = this.storageService.buildCandidateAssetKey(
      organizationId,
      candidateId,
      uploadCategory,
      file.originalName,
    );

    let uploadResult;
    try {
      uploadResult = await this.storageService.upload(
        storageKey,
        {
          buffer: file.buffer,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        },
        {
          category: uploadCategory,
          organizationId,
          entityId: candidateId,
        },
      );
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof ConflictError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'Resume upload failed',
          );
    }

    const durableFileUrl =
      uploadResult.url ??
      (await this.storageService.resolveFileUrl(
        uploadResult.key,
        uploadResult.bucket,
        file.mimeType,
      )) ??
      `s3://${uploadResult.bucket}/${uploadResult.key}`;

    const signedUrl =
      (await this.storageService.resolveFileUrl(
        uploadResult.key,
        uploadResult.bucket,
        file.mimeType,
      )) ?? durableFileUrl;

    await this.registerCandidateAsset({
      authUser,
      organizationId,
      candidate,
      id: candidateId,
      kind: 'RESUME',
      documentKind: 'RESUME',
      uploadCategory,
      storageKey: uploadResult.key,
      bucket: uploadResult.bucket,
      fileUrl: durableFileUrl,
      file,
    });

    const refreshed = await this.getCandidateOrThrow(organizationId, candidateId);
    const documentId = refreshed.resumeDocumentId
      ? bigintToNumber(refreshed.resumeDocumentId)
      : null;
    if (documentId == null) {
      throw new BadRequestError('Resume document was not linked to the candidate');
    }

    return { documentId, signedUrl, durableFileUrl };
  }

  /** Applies sync Python/static extraction fields onto an existing candidate row. */
  private async applyExtractionToDraft(
    organizationId: number,
    candidateId: number,
    draftEmail: string,
    extraction: ResumeExtractionResponse,
  ) {
    const extracted = extraction.candidate;
    const firstName = extracted.firstName?.trim() ?? '';
    const lastName = extracted.lastName?.trim() ?? '';
    if (!firstName && !lastName) {
      throw new BadRequestError(
        'Resume extraction did not identify a candidate name',
      );
    }
    let email = extracted.email?.trim().toLowerCase() || draftEmail;

    if (email !== draftEmail) {
      const existing = await this.candidateRepository.findByEmail(organizationId, email);
      if (existing && bigintToNumber(existing.id) !== candidateId) {
        extraction.warnings = [
          ...(extraction.warnings ?? []),
          `Email ${email} already exists — draft kept temporary email until you change it.`,
        ];
        email = draftEmail;
      }
    }

    const communities = await this.prisma.skillCommunity.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    });

    const matchCommunityId = (skillName: string): number | null => {
      const normalized = skillName.toLowerCase().trim();
      if (!normalized) return null;
      const exact = communities.find((c) => c.name.toLowerCase() === normalized);
      if (exact) return Number(exact.id);
      const partial = communities.find(
        (c) =>
          normalized.includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(normalized),
      );
      return partial ? Number(partial.id) : null;
    };

    const communityFromExtraction = extraction.community
      ? matchCommunityId(extraction.community)
      : null;

    const fallbackCommunityId = communities[0] ? Number(communities[0].id) : null;
    const mappedSkills = (extraction.skills ?? [])
      .map((skill, index) => {
        // Match each skill first; community-wide fallback only when no name match.
        const skillCommunityId =
          matchCommunityId(skill.name) ??
          communityFromExtraction ??
          fallbackCommunityId;
        if (!skillCommunityId) return null;
        const skillLabel = skill.name.trim().slice(0, 150);
        return {
          skillCommunityId,
          skillName: skillLabel,
          proficiencyLevel: skill.proficiencyLevel,
          yearsExperience: skill.yearsExperience ?? undefined,
          isPrimary: skill.isPrimary || index === 0,
          notes: skillLabel,
        };
      })
      .filter((skill): skill is NonNullable<typeof skill> => skill !== null);

    const normalizedSkills = normalizeSkillsForPersistence(mappedSkills);
    const primarySkillCommunityId =
      communityFromExtraction ??
      normalizedSkills?.find((s) => s.isPrimary)?.skillCommunityId ??
      normalizedSkills?.[0]?.skillCommunityId ??
      fallbackCommunityId ??
      undefined;

    const latestJob = extraction.experience?.[0];
    const education = (extraction.education ?? [])
      .map((entry) =>
        [entry.degree, entry.fieldOfStudy, entry.institution, entry.graduationYear]
          .filter((part) => part != null && part !== '')
          .join(', '),
      )
      .filter(Boolean)
      .join('; ');

    const aiSummary =
      extraction.aiSummary ??
      extracted.summary ??
      extraction.rawSections?.summary ??
      undefined;
    const hasScreeningSignal =
      extraction.bestalScore != null ||
      Boolean(extraction.aiSummary?.trim()) ||
      Boolean(extraction.strengths?.trim());

    const clientBillRate = extraction.recommendedClientRate;
    const candidatePayRate = extraction.recommendedCandidateRate;
    const grossMargin =
      clientBillRate != null && candidatePayRate != null
        ? clientBillRate - candidatePayRate
        : undefined;

    await this.prisma.candidateSkill.deleteMany({
      where: {
        candidateId: BigInt(candidateId),
      },
    });

    return this.prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: {
        firstName,
        lastName,
        email,
        phone: extracted.phone ?? undefined,
        location: extracted.location ?? undefined,
        linkedinUrl: extracted.linkedinUrl ?? undefined,
        headline: extracted.headline ?? extraction.primaryRole ?? undefined,
        summary: extracted.summary ?? extraction.rawSections?.summary ?? undefined,
        yearsExperience: extracted.yearsExperience ?? undefined,
        displayName: `${firstName} ${lastName}`.trim(),
        primaryRole:
          extraction.primaryRole ?? latestJob?.title ?? extracted.headline ?? undefined,
        currentCompany: latestJob?.company ?? undefined,
        education: education || undefined,
        clientProfileSummary:
          extracted.summary ?? extraction.rawSections?.summary ?? undefined,
        strengths: extraction.strengths ?? extraction.rawSections?.skills ?? undefined,
        weaknesses: extraction.weaknesses ?? undefined,
        riskFlags: extraction.riskFlags ?? undefined,
        aiSummary,
        bestalScore: extraction.bestalScore ?? undefined,
        clientBillRate: clientBillRate ?? undefined,
        candidatePayRate: candidatePayRate ?? undefined,
        grossMargin,
        primarySkillCommunityId: primarySkillCommunityId
          ? BigInt(primarySkillCommunityId)
          : undefined,
        profileStatus: hasScreeningSignal ? 'AI_SCREENED' : 'SOURCED',
        ...(normalizedSkills?.length
          ? {
              skills: {
                create: normalizedSkills.map((skill) => ({
                  skillCommunityId:
                    skill.skillCommunityId != null
                      ? BigInt(skill.skillCommunityId)
                      : null,
                  skillName: skill.skillName?.trim() || 'Skill',
                  skillCategory: skill.skillCategory,
                  proficiencyLevel: skill.proficiencyLevel ?? 'INTERMEDIATE',
                  yearsExperience: skill.yearsExperience,
                  isPrimary: skill.isPrimary ?? false,
                  notes: skill.notes,
                })),
              },
            }
          : {}),
      },
      include: {
        primarySkillCommunity: { select: { id: true, name: true } },
        resumeDocument: true,
        profileImageDocument: true,
        introVideoDocument: true,
        skills: {
          where: { deletedAt: null },
          include: { skillCommunity: { select: { name: true } } },
        },
      },
    });
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateCandidateInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    await this.getCandidateOrThrow(organizationId, id);

    if (input.email) {
      const existing = await this.candidateRepository.findByEmail(
        organizationId,
        input.email,
      );
      if (existing && bigintToNumber(existing.id) !== id) {
        throw new ConflictError('A candidate with this email already exists');
      }
    }

    await this.validateSkillCommunity(input.primarySkillCommunityId);

    const canFullWrite = roleHasPermission(authUser.role, PERMISSIONS.CANDIDATES_WRITE);
    const canLimitedWrite = roleHasPermission(
      authUser.role,
      PERMISSIONS.CANDIDATES_EDIT_LIMITED,
    );

    if (!canFullWrite && canLimitedWrite) {
      assertSalesLimitedCandidateUpdate(input);
      const candidate = await this.candidateRepository.update(
        organizationId,
        id,
        this.stripWorkflowFields(input),
      );
      return this.toDto(candidate, authUser);
    }

    if (!canFullWrite) {
      throw new AuthorizationError('You do not have permission to update candidates');
    }

    if (input.skills?.length) {
      for (const skill of input.skills) {
        await this.validateSkillCommunity(skill.skillCommunityId);
      }
    }

    const candidate = await this.candidateRepository.update(organizationId, id, {
      ...input,
      skills:
        input.skills !== undefined ? normalizeCandidateSkills(input.skills) : undefined,
    });
    return this.toDto(candidate, authUser);
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = this.requireOrganization(authUser);
    await this.getCandidateOrThrow(organizationId, id);
    await this.candidateRepository.softDelete(organizationId, id);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListCandidatesQuery,
  ): Promise<{ data: CandidateListItemDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const organizationId = this.requireOrganization(authUser);
    const clientView = authUser.role === ROLES.CLIENT;

    const { items, total } = await this.candidateRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      status: query.status,
      visibility: clientView ? undefined : query.visibility,
      approvalStatus: clientView ? undefined : query.approvalStatus,
      source: query.source,
      primarySkillCommunityId: query.primarySkillCommunityId,
      skillCommunityId: query.skillCommunityId,
      clientView,
      pendingApproval: query.pendingApproval,
    });

    const data = await Promise.all(
      items.map((item) =>
        mapCandidateToListItemAsync(item, (key, bucket, mimeType) =>
          this.storageService.resolveFileUrl(key, bucket, mimeType),
        ),
      ),
    );

    return {
      data,
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    if (authUser.role === ROLES.CLIENT) {
      if (
        candidate.visibility !== 'CLIENT_VISIBLE' ||
        candidate.approvalStatus !== 'APPROVED'
      ) {
        throw new NotFoundError('Candidate not found');
      }
    }

    return this.toDto(candidate, authUser);
  }

  async uploadAsset(
    authUser: AuthenticatedUser,
    id: number,
    kind: CandidateAssetKind,
    file: UploadAssetInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    const documentKind = kind as DocumentKind;
    const uploadCategory = this.storageService.uploadCategoryFromDocumentKind(documentKind);

    this.storageService.validateFile(uploadCategory, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    const storageKey = this.storageService.buildCandidateAssetKey(
      organizationId,
      id,
      uploadCategory,
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
        category: uploadCategory,
        organizationId,
        entityId: id,
      },
    );

    return this.registerCandidateAsset({
      authUser,
      organizationId,
      candidate,
      id,
      kind,
      documentKind,
      uploadCategory,
      storageKey,
      bucket: uploadResult.bucket,
      file,
    });
  }

  private async registerCandidateAsset(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    candidate: NonNullable<Awaited<ReturnType<CandidateRepository['findById']>>>;
    id: number;
    kind: CandidateAssetKind;
    documentKind: DocumentKind;
    uploadCategory: UploadCategory;
    storageKey: string;
    bucket: string;
    fileUrl?: string | null;
    file: Pick<UploadAssetInput, 'originalName' | 'mimeType' | 'size'>;
  }): Promise<CandidateDto> {
    const {
      authUser,
      organizationId,
      candidate,
      id,
      kind,
      documentKind,
      storageKey,
      bucket,
      fileUrl,
      file,
    } = params;

    const existingDocId = this.getExistingDocumentId(candidate, kind);

    const resolvedFileUrl =
      fileUrl ??
      (await this.storageService.resolveFileUrl(storageKey, bucket, file.mimeType)) ??
      `s3://${bucket}/${storageKey}`;

    const document = await this.candidateRepository.createDocument({
      organizationId,
      uploadedById: authUser.id,
      entityId: id,
      kind: documentKind,
      fileName: storageKey.split('/').pop() ?? file.originalName,
      originalName: file.originalName,
      s3Key: storageKey,
      s3Bucket: bucket,
      fileUrl: resolvedFileUrl,
      mimeType: file.mimeType,
      fileSize: file.size,
    });

    if (existingDocId) {
      const oldDoc = await this.candidateRepository.findDocumentById(existingDocId);
      if (oldDoc) {
        await this.storageService.safeDelete(oldDoc.s3Key, oldDoc.s3Bucket);
        await this.candidateRepository.softDeleteDocument(existingDocId);
      }
    }

    const updated = await this.candidateRepository.linkDocument(
      organizationId,
      id,
      documentKind,
      document.id,
    );

    return this.toDto(updated, authUser);
  }

  async publish(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    assertCanPublish(this.toPipelineSnapshot(candidate));

    const updated = await this.candidateRepository.publish(organizationId, id);
    return this.toDto(updated, authUser);
  }

  async hide(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    await this.getCandidateOrThrow(organizationId, id);
    const updated = await this.candidateRepository.hide(organizationId, id);
    return this.toDto(updated, authUser);
  }

  async approve(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    assertCanApprove(this.toPipelineSnapshot(candidate));

    const updated = await this.candidateRepository.approve(
      organizationId,
      id,
      authUser.id,
    );
    return this.toDto(updated, authUser);
  }

  async reject(
    authUser: AuthenticatedUser,
    id: number,
    input: RejectCandidateInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    await this.getCandidateOrThrow(organizationId, id);
    const updated = await this.candidateRepository.reject(
      organizationId,
      id,
      authUser.id,
      input.reason,
    );
    return this.toDto(updated, authUser);
  }

  async sendBack(
    authUser: AuthenticatedUser,
    id: number,
    reason?: string,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    if (!candidate.submittedForApprovalAt) {
      throw new BadRequestError('Candidate has not been submitted for approval');
    }
    if (candidate.approvalStatus !== 'PENDING') {
      throw new BadRequestError('Only pending candidates can be sent back to recruiter');
    }

    const updated = await this.candidateRepository.updatePipelineState(
      organizationId,
      id,
      {
        approvalStatus: 'PENDING',
        submittedForApprovalAt: null,
        profileStatus: 'RECRUITER_SCREENED',
        rejectionReason: reason?.trim() || null,
      },
    );
    return this.toDto(updated, authUser);
  }

  async runAiScreening(
    authUser: AuthenticatedUser,
    id: number,
    input: RunAiScreeningInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    assertCanRunAiScreening(this.toPipelineSnapshot(candidate));

    const updated = await this.candidateRepository.updatePipelineState(
      organizationId,
      id,
      {
        profileStatus: 'AI_SCREENED',
        ...(input.aiSummary !== undefined ? { aiSummary: input.aiSummary } : {}),
        ...(input.strengths !== undefined ? { strengths: input.strengths } : {}),
        ...(input.weaknesses !== undefined ? { weaknesses: input.weaknesses } : {}),
        ...(input.riskFlags !== undefined ? { riskFlags: input.riskFlags } : {}),
      },
    );

    return this.toDto(updated, authUser);
  }

  async completeRecruiterReview(
    authUser: AuthenticatedUser,
    id: number,
    input: CompleteRecruiterReviewInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    assertCanCompleteRecruiterReview(this.toPipelineSnapshot(candidate));

    const updated = await this.candidateRepository.updatePipelineState(
      organizationId,
      id,
      {
        profileStatus: 'RECRUITER_SCREENED',
        ...(input.clientProfileSummary !== undefined
          ? { clientProfileSummary: input.clientProfileSummary }
          : {}),
      },
    );

    return this.toDto(updated, authUser);
  }

  async completePricingAndAvailability(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    assertCanCompletePricing(this.toPipelineSnapshot(candidate));

    if (!isPricingComplete(this.toPipelineSnapshot(candidate))) {
      throw new BadRequestError(
        'Complete pricing requires client bill rate, availability status, and available-from date',
      );
    }

    const updated = await this.candidateRepository.updatePipelineState(
      organizationId,
      id,
      { profileStatus: 'PROFILE_DRAFT' },
    );

    return this.toDto(updated, authUser);
  }

  async submitForApproval(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    assertCanSubmitForApproval(this.toPipelineSnapshot(candidate));

    const updated = await this.candidateRepository.updatePipelineState(
      organizationId,
      id,
      {
        approvalStatus: 'PENDING',
        profileStatus: 'PENDING_APPROVAL',
        submittedForApprovalAt: new Date(),
      },
    );

    void notifyCandidatePendingApproval(this.prisma, this.fastify.config, {
      organizationId,
      candidateId: id,
      candidateName: `${updated.firstName} ${updated.lastName}`.trim(),
    });

    return this.toDto(updated, authUser);
  }

  private stripWorkflowFields(input: UpdateCandidateInput): UpdateCandidateInput {
    const {
      profileStatus: _profileStatus,
      visibility: _visibility,
      evaluationStatus: _evaluationStatus,
      bgvStatus: _bgvStatus,
      ...rest
    } = input;
    return rest;
  }

  private toPipelineSnapshot(
    candidate: NonNullable<Awaited<ReturnType<CandidateRepository['findById']>>>,
  ): PipelineCandidateSnapshot {
    return {
      profileStatus: candidate.profileStatus,
      approvalStatus: candidate.approvalStatus,
      visibility: candidate.visibility,
      resumeDocumentId: candidate.resumeDocumentId,
      evaluationStatus: candidate.evaluationStatus,
      bgvStatus: candidate.bgvStatus,
      aiSummary: candidate.aiSummary,
      clientBillRate: candidate.clientBillRate,
      availabilityStatus: candidate.availabilityStatus,
      availableFrom: candidate.availableFrom,
      submittedForApprovalAt: candidate.submittedForApprovalAt,
    };
  }

  private requireOrganization(authUser: AuthenticatedUser): number {
    if (authUser.organizationId === null) {
      throw new AuthorizationError('Organization context is required');
    }
    return authUser.organizationId;
  }

  private async getCandidateOrThrow(organizationId: number, id: number) {
    const candidate = await this.candidateRepository.findById(organizationId, id);
    if (!candidate) {
      throw new NotFoundError('Candidate not found');
    }
    return candidate;
  }

  private async validateSkillCommunity(skillCommunityId?: number): Promise<void> {
    if (skillCommunityId === undefined) {
      return;
    }

    const exists = await this.candidateRepository.skillCommunityExists(skillCommunityId);

    if (!exists) {
      throw new BadRequestError('Primary skill community not found');
    }
  }

  private getExistingDocumentId(
    candidate: Awaited<ReturnType<CandidateRepository['findById']>>,
    kind: CandidateAssetKind,
  ): bigint | null {
    if (!candidate) {
      return null;
    }

    switch (kind) {
      case 'RESUME':
        return candidate.resumeDocumentId;
      case 'PROFILE_IMAGE':
        return candidate.profileImageDocumentId;
      case 'INTRO_VIDEO':
        return candidate.introVideoDocumentId;
      default:
        return null;
    }
  }

  private async toDto(
    candidate: NonNullable<Awaited<ReturnType<CandidateRepository['findById']>>>,
    authUser: AuthenticatedUser,
  ): Promise<CandidateDto> {
    const dto = await mapCandidateToDtoAsync(candidate, (key, bucket, mimeType) =>
      this.storageService.resolveFileUrl(key, bucket, mimeType),
    );

    const bgvVerified = isClearBgvStatus(candidate.bgvStatus);
    dto.bgvVerified = bgvVerified;

    if (bgvVerified) {
      const clearCheck = await this.prisma.backgroundCheck.findFirst({
        where: {
          organizationId: candidate.organizationId,
          candidateId: candidate.id,
          status: { in: ['CLEAR', 'COMPLETED_CLEAR'] },
          deletedAt: null,
        },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true, aiSummary: true, resultSummary: true },
      });
      dto.bgvCompletedAt = clearCheck?.completedAt?.toISOString() ?? null;
      dto.bgvSummary = clearCheck?.aiSummary ?? clearCheck?.resultSummary ?? null;
    } else {
      dto.bgvCompletedAt = null;
      dto.bgvSummary = null;
    }

    // Clients never receive document assets beyond public profile media already on DTO.
    if (authUser.role === ROLES.CLIENT) {
      return {
        ...redactCandidateForClient(dto),
        resume: null,
      };
    }

    return redactCandidatePayFields(dto, authUser.role);
  }
}
