import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { notifyJobRequestSubmitted } from '../../services/notification-events.js';
import { StorageService, UPLOAD_CATEGORIES } from '../../services/storage.service.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  deriveCompanyDomain,
  generateReferenceCode,
  mapWizardExperience,
  mapWizardResources,
  parseSkillsInput,
} from './job-request.enquiry.utils.js';
import {
  mapJobRequestToDto,
  mapJobRequestToListItem,
} from './job-request.mapper.js';
import { JobRequestRepository } from './job-request.repository.js';
import type {
  ClientEnquiryAttachment,
  ClientEnquiryJobEntry,
  ClientEnquiryUploadFile,
  JobRequestDto,
  JobRequestListItemDto,
  UpdateJobRequestInput,
} from './job-request.types.js';
import type {
  CreateClientEnquiryBody,
  CreatePublicJobRequestBody,
  ListJobRequestsQuery,
  UpdateJobRequestBody,
} from './job-request.validator.js';

const DEFAULT_INTAKE_ORG_SLUG = 'bestal';

export class JobRequestService {
  private readonly jobRequestRepository: JobRequestRepository;
  private readonly fastify: FastifyInstance;
  private readonly storageService: StorageService;

  constructor(fastify: FastifyInstance, jobRequestRepository?: JobRequestRepository) {
    this.fastify = fastify;
    this.jobRequestRepository =
      jobRequestRepository ?? new JobRequestRepository(fastify.prisma);
    this.storageService = new StorageService(fastify.config, fastify.prisma);
  }

  async submitPublic(input: CreatePublicJobRequestBody): Promise<{ id: number; message: string }> {
    if (input.websiteConfirm) {
      return {
        id: 0,
        message: 'Request received — our team will follow up within [FACT: SLA].',
      };
    }

    const organizationId = await this.resolvePublicIntakeOrganizationId();
    const { websiteConfirm: _honeypot, ...payload } = input;
    const referenceCode = await this.generateUniqueReferenceCode();

    const record = await this.jobRequestRepository.createPublic(organizationId, {
      referenceCode,
      ...payload,
    });
    const dto = mapJobRequestToDto(record);

    void notifyJobRequestSubmitted(this.fastify.prisma, this.fastify.config, {
      organizationId,
      jobRequestId: dto.id,
      companyName: dto.companyName,
      jobTitle: dto.jobTitle,
    });

    return {
      id: dto.id,
      message: 'Request received — our team will follow up within [FACT: SLA].',
    };
  }

  async submitClientEnquiry(
    input: CreateClientEnquiryBody,
    files: ClientEnquiryUploadFile[],
  ): Promise<{ id: number; referenceCode: string; message: string }> {
    if (input.websiteConfirm) {
      return {
        id: 0,
        referenceCode: '',
        message: 'Request received — our team will follow up within [FACT: SLA].',
      };
    }

    if (files.length === 0) {
      throw new BadRequestError('At least one attachment is required');
    }

    const organizationId = await this.resolvePublicIntakeOrganizationId();
    const referenceCode = await this.generateUniqueReferenceCode();
    const jobs = this.normalizeClientEnquiryJobs(input.jobs);
    const primaryJob = jobs[0];

    const website =
      input.companyWebsite?.trim() ||
      `https://${deriveCompanyDomain(input.email, input.companyWebsite ?? '')}`;

    const record = await this.jobRequestRepository.createClientEnquiry(organizationId, {
      referenceCode,
      companyName: input.companyName,
      companyDomain:
        input.companyDomain?.trim() ||
        deriveCompanyDomain(input.email, input.companyWebsite ?? ''),
      location: input.location,
      timezone: input.timezone,
      website,
      contactName: input.contactPersonName,
      contactEmail: input.email,
      contactPhone: input.phone,
      additionalRequirements: input.additionalRequirements,
      jobs,
      attachments: [],
      jobTitle: primaryJob.jobTitle,
      jobDescription: primaryJob.jobDescription,
      requiredSkills: primaryJob.requiredSkills,
      experienceRequired: primaryJob.experienceRequired,
      numberOfResources: primaryJob.numberOfResources,
    });

    const enquiryId = bigintToNumber(record.id);
    const attachments = await this.uploadClientEnquiryFiles(organizationId, enquiryId, files);

    const updated = await this.jobRequestRepository.updateAttachments(
      organizationId,
      enquiryId,
      attachments as unknown as Prisma.InputJsonValue,
    );
    const dto = mapJobRequestToDto(updated);

    void notifyJobRequestSubmitted(this.fastify.prisma, this.fastify.config, {
      organizationId,
      jobRequestId: dto.id,
      companyName: dto.companyName,
      jobTitle: dto.jobTitle,
    });

    return {
      id: dto.id,
      referenceCode: dto.referenceCode,
      message: 'Request received — our team will follow up within [FACT: SLA].',
    };
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListJobRequestsQuery,
  ): Promise<{
    data: JobRequestListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const { items, total } = await this.jobRequestRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return {
      data: items.map(mapJobRequestToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<JobRequestDto> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getJobRequestOrThrow(organizationId, id);
    const dto = mapJobRequestToDto(record);
    dto.attachments = await this.resolveAttachmentUrls(dto.attachments);
    return dto;
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateJobRequestBody,
  ): Promise<JobRequestDto> {
    const organizationId = requireOrganization(authUser);
    await this.getJobRequestOrThrow(organizationId, id);

    if (input.assignedToId != null) {
      const exists = await this.jobRequestRepository.assigneeExists(
        organizationId,
        input.assignedToId,
      );
      if (!exists) {
        throw new BadRequestError('Assigned user must be an active admin or sales member');
      }
    }

    const updateInput: UpdateJobRequestInput = {
      ...(input.status !== undefined && { status: input.status }),
      ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
      ...(input.internalNotes !== undefined && { internalNotes: input.internalNotes }),
    };

    const record = await this.jobRequestRepository.update(organizationId, id, updateInput);
    const dto = mapJobRequestToDto(record);
    dto.attachments = await this.resolveAttachmentUrls(dto.attachments);
    return dto;
  }

  private normalizeClientEnquiryJobs(
    jobs: CreateClientEnquiryBody['jobs'],
  ): ClientEnquiryJobEntry[] {
    return jobs.map((job) => ({
      jobTitle: job.jobTitle,
      jobDescription: job.jobDescription,
      requiredSkills: parseSkillsInput(job.requiredSkills),
      experienceRequired: mapWizardExperience(job.experienceRequired),
      numberOfResources: mapWizardResources(job.numberOfResources),
    }));
  }

  private async uploadClientEnquiryFiles(
    organizationId: number,
    enquiryId: number,
    files: ClientEnquiryUploadFile[],
  ): Promise<ClientEnquiryAttachment[]> {
    const bucket = await this.storageService.getBucket();
    const attachments: ClientEnquiryAttachment[] = [];

    for (const file of files) {
      this.storageService.validateFile(UPLOAD_CATEGORIES.CLIENT_ENQUIRY, {
        mimeType: file.mimeType,
        size: file.size,
        originalName: file.originalName,
      });

      const storageKey = this.storageService.buildClientEnquiryAssetKey(
        organizationId,
        enquiryId,
        file.originalName,
      );

      await this.storageService.upload(
        storageKey,
        {
          buffer: file.buffer,
          mimeType: file.mimeType,
          size: file.size,
          originalName: file.originalName,
        },
        {
          category: UPLOAD_CATEGORIES.CLIENT_ENQUIRY,
          organizationId,
          entityId: enquiryId,
        },
      );

      attachments.push({
        fileName: file.originalName,
        fileSize: file.size,
        mimeType: file.mimeType,
        storageKey,
        bucket,
      });
    }

    return attachments;
  }

  private async resolveAttachmentUrls(
    attachments: ClientEnquiryAttachment[] | null,
  ): Promise<ClientEnquiryAttachment[] | null> {
    if (!attachments?.length) return attachments;

    const resolved = await Promise.all(
      attachments.map(async (attachment) => {
        const downloadUrl = await this.storageService.resolveFileUrl(
          attachment.storageKey,
          attachment.bucket,
          attachment.mimeType,
        );
        return { ...attachment, downloadUrl };
      }),
    );

    return resolved;
  }

  private async generateUniqueReferenceCode(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const referenceCode = generateReferenceCode();
      const exists = await this.jobRequestRepository.referenceCodeExists(referenceCode);
      if (!exists) return referenceCode;
    }
    throw new BadRequestError('Unable to generate a unique reference code');
  }

  private async getJobRequestOrThrow(organizationId: number, id: number) {
    const record = await this.jobRequestRepository.findById(organizationId, id);
    if (!record) {
      throw new NotFoundError('Client enquiry not found');
    }
    return record;
  }

  private async resolvePublicIntakeOrganizationId(): Promise<number> {
    const org =
      (await this.fastify.prisma.organization.findFirst({
        where: { slug: DEFAULT_INTAKE_ORG_SLUG, isActive: true, deletedAt: null },
        select: { id: true },
      })) ??
      (await this.fastify.prisma.organization.findFirst({
        where: { isActive: true, deletedAt: null },
        orderBy: { id: 'asc' },
        select: { id: true },
      }));

    if (!org) {
      throw new BadRequestError('Public job intake is not configured');
    }

    return bigintToNumber(org.id);
  }
}
