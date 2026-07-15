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
  redactCandidatePayFields,
} from './candidate-access.js';
import { normalizeCandidateSkills } from './candidate-skills.js';
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
import { StorageService } from '../../services/storage.service.js';
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
  mapCandidateToListItem,
} from './candidate.mapper.js';
import { CandidateRepository } from './candidate.repository.js';
import type {
  CandidateAssetKind,
  CandidateDto,
  CandidateListItemDto,
  CompleteRecruiterReviewInput,
  CreateCandidateInput,
  RejectCandidateInput,
  ResumeExtractionDraftResult,
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

  constructor(
    fastify: FastifyInstance,
    candidateRepository?: CandidateRepository,
  ) {
    this.candidateRepository = candidateRepository ?? new CandidateRepository(
      fastify.prisma,
    );
    this.storageService = new StorageService(fastify.config);
    this.resumeExtractionClient = new ResumeExtractionClient(
      fastify.config.aiExtractionUrl,
    );
    this.prisma = fastify.prisma;
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
   * Always uploads the resume to storage and saves the file link on the draft.
   * Extraction uses static JSON when AI_EXTRACTION_URL is unset; otherwise calls Python.
   */
  async extractResumeAndCreateDraft(
    authUser: AuthenticatedUser,
    file: UploadAssetInput,
    existingCandidateId?: number,
  ): Promise<ResumeExtractionDraftResult> {
    const organizationId = this.requireOrganization(authUser);
    const uploadCategory = this.storageService.uploadCategoryFromDocumentKind('RESUME');

    this.storageService.validateFile(uploadCategory, {
      mimeType: file.mimeType,
      size: file.size,
      originalName: file.originalName,
    });

    let candidateId: number;
    let fallbackEmail: string;
    let createdNewDraft = false;

    if (existingCandidateId != null && existingCandidateId > 0) {
      const existing = await this.getCandidateOrThrow(organizationId, existingCandidateId);
      candidateId = existingCandidateId;
      fallbackEmail = existing.email;
    } else {
      const draftEmail = `draft-${randomUUID()}@draft.bestal.local`;
      const draft = await this.candidateRepository.create(organizationId, {
        firstName: 'Draft',
        lastName: 'Candidate',
        email: draftEmail,
        source: 'JOB_BOARD',
        profileStatus: 'SOURCED',
        visibility: 'INTERNAL_ONLY',
        createdById: authUser.id,
      });
      candidateId = bigintToNumber(draft.id);
      fallbackEmail = draftEmail;
      createdNewDraft = true;
    }

    const candidate = await this.getCandidateOrThrow(organizationId, candidateId);
    const content = bufferToBase64(file.buffer);

    try {
      await this.uploadResumeForDraft({
        authUser,
        organizationId,
        candidate,
        candidateId,
        file,
        uploadCategory,
      });

      const extraction = await this.resumeExtractionClient.extract({
        fileName: file.originalName,
        mimeType: file.mimeType,
        content,
      });

      const updated = await this.applyExtractionToDraft(
        organizationId,
        candidateId,
        fallbackEmail,
        extraction,
      );

      return {
        candidate: await this.toDto(updated, authUser),
        extraction,
      };
    } catch (error) {
      if (createdNewDraft) {
        await this.candidateRepository.softDelete(organizationId, candidateId).catch(() => undefined);
      }
      throw error instanceof BadRequestError || error instanceof ConflictError
        ? error
        : new BadRequestError(
            error instanceof Error ? error.message : 'Resume extraction failed',
          );
    }
  }

  private async uploadResumeForDraft(params: {
    authUser: AuthenticatedUser;
    organizationId: number;
    candidate: NonNullable<Awaited<ReturnType<CandidateRepository['findById']>>>;
    candidateId: number;
    file: UploadAssetInput;
    uploadCategory: UploadCategory;
  }): Promise<void> {
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
  }

  private async applyExtractionToDraft(
    organizationId: number,
    candidateId: number,
    draftEmail: string,
    extraction: ResumeExtractionResponse,
  ) {
    const extracted = extraction.candidate;
    const firstName = extracted.firstName?.trim() || 'Draft';
    const lastName = extracted.lastName?.trim() || 'Candidate';
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
        const skillCommunityId =
          communityFromExtraction ??
          matchCommunityId(skill.name) ??
          fallbackCommunityId;
        if (!skillCommunityId) return null;
        return {
          skillCommunityId,
          skillName: skill.name,
          proficiencyLevel: skill.proficiencyLevel,
          yearsExperience: skill.yearsExperience ?? undefined,
          isPrimary: skill.isPrimary || index === 0,
          notes: skill.name,
        };
      })
      .filter((skill): skill is NonNullable<typeof skill> => skill !== null);

    const normalizedSkills = normalizeCandidateSkills(mappedSkills);
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
                  skillCommunityId: BigInt(skill.skillCommunityId),
                  skillName: skill.skillName,
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
    });

    return {
      data: items.map((item) => mapCandidateToListItem(item)),
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
      { submittedForApprovalAt: new Date() },
    );

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

    const bgvVerified = candidate.bgvStatus === 'CLEAR';
    dto.bgvVerified = bgvVerified;

    if (bgvVerified) {
      const clearCheck = await this.prisma.backgroundCheck.findFirst({
        where: {
          organizationId: candidate.organizationId,
          candidateId: candidate.id,
          status: 'CLEAR',
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
        ...redactCandidatePayFields(dto, authUser.role),
        resume: null,
        // Keep photo for profile cards; never expose BGV report links (not on DTO today).
      };
    }

    return redactCandidatePayFields(dto, authUser.role);
  }
}
