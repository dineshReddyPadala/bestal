import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { notifyContactMessageSubmitted } from '../../services/notification-events.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapContactMessageToDto,
  mapContactMessageToListItem,
} from './contact-message.mapper.js';
import { ContactMessageRepository } from './contact-message.repository.js';
import type {
  ContactMessageDto,
  ContactMessageListItemDto,
  UpdateContactMessageInput,
} from './contact-message.types.js';
import type {
  CreatePublicContactMessageBody,
  ListContactMessagesQuery,
  UpdateContactMessageBody,
} from './contact-message.validator.js';

const DEFAULT_INTAKE_ORG_SLUG = 'amnet-digital';

function generateReferenceCode(): string {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `MSG-${new Date().getFullYear()}-${suffix}`;
}

export class ContactMessageService {
  private readonly repository: ContactMessageRepository;
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance, repository?: ContactMessageRepository) {
    this.fastify = fastify;
    this.repository = repository ?? new ContactMessageRepository(fastify.prisma);
  }

  async submitPublic(
    input: CreatePublicContactMessageBody,
  ): Promise<{ id: number; referenceCode: string; message: string }> {
    if (input.websiteConfirm) {
      return {
        id: 0,
        referenceCode: '',
        message: 'Message received — we reply within one business day.',
      };
    }

    const organizationId = await this.resolvePublicIntakeOrganizationId();
    const referenceCode = await this.generateUniqueReferenceCode();
    const { websiteConfirm: _honeypot, ...payload } = input;

    const record = await this.repository.create(organizationId, {
      referenceCode,
      ...payload,
    });

    const contactMessageId = bigintToNumber(record.id);

    void notifyContactMessageSubmitted(this.fastify.prisma, this.fastify.config, {
      organizationId,
      contactMessageId,
      referenceCode,
      fullName: payload.fullName,
      email: payload.email,
      topic: payload.topic,
    });

    return {
      id: contactMessageId,
      referenceCode,
      message: 'Message received — we reply within one business day.',
    };
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListContactMessagesQuery,
  ): Promise<{
    data: ContactMessageListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const { items, total } = await this.repository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      status: query.status,
      topic: query.topic,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return {
      data: items.map(mapContactMessageToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<ContactMessageDto> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getOrThrow(organizationId, id);
    return mapContactMessageToDto(record);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateContactMessageBody,
  ): Promise<ContactMessageDto> {
    const organizationId = requireOrganization(authUser);
    await this.getOrThrow(organizationId, id);

    const updateInput: UpdateContactMessageInput = {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.internalNotes !== undefined ? { internalNotes: input.internalNotes } : {}),
    };

    const record = await this.repository.update(organizationId, id, updateInput);
    return mapContactMessageToDto(record);
  }

  private async generateUniqueReferenceCode(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const referenceCode = generateReferenceCode();
      const exists = await this.repository.referenceCodeExists(referenceCode);
      if (!exists) return referenceCode;
    }
    throw new BadRequestError('Unable to generate a unique reference code');
  }

  private async getOrThrow(organizationId: number, id: number) {
    const record = await this.repository.findById(organizationId, id);
    if (!record) {
      throw new NotFoundError('Contact message not found');
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
      throw new BadRequestError('Public contact intake is not configured');
    }

    return bigintToNumber(org.id);
  }
}
