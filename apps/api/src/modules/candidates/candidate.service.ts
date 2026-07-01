import type { DocumentKind } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { ROLES } from '../../constants/index.js';
import type { AuthenticatedUser } from '../../types/index.js';
import { StorageService } from '../../services/storage.service.js';
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
  CreateCandidateInput,
  RejectCandidateInput,
  UpdateCandidateInput,
  UploadAssetInput,
} from './candidate.types.js';
import type { ListCandidatesQuery } from './candidate.validator.js';

export class CandidateService {
  private readonly candidateRepository: CandidateRepository;
  private readonly storageService: StorageService;

  constructor(
    fastify: FastifyInstance,
    candidateRepository?: CandidateRepository,
  ) {
    this.candidateRepository = candidateRepository ?? new CandidateRepository(
      fastify.prisma,
    );
    this.storageService = new StorageService(fastify.config);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateCandidateInput,
  ): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);

    await this.validateSkillCommunity(organizationId, input.primarySkillCommunityId);

    const existing = await this.candidateRepository.findByEmail(
      organizationId,
      input.email,
    );

    if (existing) {
      throw new ConflictError('A candidate with this email already exists');
    }

    const candidate = await this.candidateRepository.create(organizationId, input);
    return this.toDto(candidate);
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

    await this.validateSkillCommunity(organizationId, input.primarySkillCommunityId);

    const candidate = await this.candidateRepository.update(
      organizationId,
      id,
      input,
    );
    return this.toDto(candidate);
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
      data: items.map(mapCandidateToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    if (authUser.role === ROLES.CLIENT) {
      if (
        candidate.visibility !== 'PUBLISHED' ||
        candidate.approvalStatus !== 'APPROVED'
      ) {
        throw new NotFoundError('Candidate not found');
      }
    }

    return this.toDto(candidate);
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

    const existingDocId = this.getExistingDocumentId(candidate, kind);

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

    const document = await this.candidateRepository.createDocument({
      organizationId,
      uploadedById: authUser.id,
      entityId: id,
      kind: documentKind,
      fileName: storageKey.split('/').pop() ?? file.originalName,
      originalName: file.originalName,
      s3Key: uploadResult.key,
      s3Bucket: uploadResult.bucket,
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

    return this.toDto(updated);
  }

  async publish(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    const candidate = await this.getCandidateOrThrow(organizationId, id);

    if (candidate.approvalStatus === 'REJECTED') {
      throw new BadRequestError('Rejected candidates cannot be published');
    }

    const updated = await this.candidateRepository.publish(organizationId, id);
    return this.toDto(updated);
  }

  async hide(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    await this.getCandidateOrThrow(organizationId, id);
    const updated = await this.candidateRepository.hide(organizationId, id);
    return this.toDto(updated);
  }

  async approve(authUser: AuthenticatedUser, id: number): Promise<CandidateDto> {
    const organizationId = this.requireOrganization(authUser);
    await this.getCandidateOrThrow(organizationId, id);
    const updated = await this.candidateRepository.approve(
      organizationId,
      id,
      authUser.id,
    );
    return this.toDto(updated);
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
    return this.toDto(updated);
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

  private async validateSkillCommunity(
    organizationId: number,
    skillCommunityId?: number,
  ): Promise<void> {
    if (skillCommunityId === undefined) {
      return;
    }

    const exists = await this.candidateRepository.skillCommunityExists(
      organizationId,
      skillCommunityId,
    );

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
  ): Promise<CandidateDto> {
    return mapCandidateToDtoAsync(candidate, (key, bucket, mimeType) =>
      this.storageService.resolveFileUrl(key, bucket, mimeType),
    );
  }
}
