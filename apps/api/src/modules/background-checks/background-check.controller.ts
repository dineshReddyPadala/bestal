import type { FastifyReply, FastifyRequest } from 'fastify';
import type { BgvDocumentKindLabel } from './background-check-workflow.js';
import { BackgroundCheckService } from './background-check.service.js';
import type {
  AssignVendorBody,
  CreateBackgroundCheckBody,
  ListBackgroundChecksQuery,
  ReviewNotesBody,
  UpdateBackgroundCheckBody,
} from './background-check.validator.js';
import { BadRequestError } from '../../utils/index.js';
import {
  UPLOAD_CATEGORIES,
  validateUploadFile,
} from '../../services/storage.service.js';

export class BackgroundCheckController {
  constructor(private readonly backgroundCheckService: BackgroundCheckService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.backgroundCheckService.create(
      request.authUser!,
      request.body as CreateBackgroundCheckBody,
    );
    return reply.status(201).send({ data });
  };

  extractBgv = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('Background verification file is required');
    }

    const buffer = await file.toBuffer();
    validateUploadFile(UPLOAD_CATEGORIES.BACKGROUND_CHECK, {
      mimeType: file.mimetype,
      size: buffer.length,
      originalName: file.filename,
    });

    const candidateIdField = file.fields?.candidateId;
    const candidateIdValue =
      candidateIdField &&
      !Array.isArray(candidateIdField) &&
      'value' in candidateIdField
        ? String((candidateIdField as { value: unknown }).value)
        : undefined;
    const candidateId = candidateIdValue ? Number(candidateIdValue) : undefined;

    const data = await this.backgroundCheckService.extractBgvDocument(
      request.authUser!,
      {
        buffer,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: buffer.length,
      },
      candidateId && Number.isFinite(candidateId) ? candidateId : undefined,
    );

    return reply.status(200).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.backgroundCheckService.list(
      request.authUser!,
      request.query as ListBackgroundChecksQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.update(
      request.authUser!,
      id,
      request.body as UpdateBackgroundCheckBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.backgroundCheckService.delete(request.authUser!, id);
    return reply.status(200).send({
      data: { message: 'Background check deleted successfully' },
    });
  };

  confirmConsent = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.confirmConsent(
      request.authUser!,
      id,
    );
    return reply.status(200).send({ data });
  };

  assignVendor = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as AssignVendorBody;
    const data = await this.backgroundCheckService.assignVendor(
      request.authUser!,
      id,
      body.provider,
    );
    return reply.status(200).send({ data });
  };

  startVerification = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.startVerification(
      request.authUser!,
      id,
    );
    return reply.status(200).send({ data });
  };

  uploadDocument = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const queryKind = (request.query as { kind?: string } | undefined)?.kind;
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('File is required');
    }

    const kindField = file.fields?.kind;
    const kindEntry = Array.isArray(kindField) ? kindField[0] : kindField;
    const kindFromField =
      kindEntry && typeof kindEntry === 'object' && 'value' in kindEntry
        ? String((kindEntry as { value: unknown }).value)
        : undefined;
    const kind = (kindFromField ?? queryKind ?? 'SUPPORTING') as BgvDocumentKindLabel;
    if (!['CONSENT', 'SUPPORTING', 'REPORT'].includes(kind)) {
      throw new BadRequestError('kind must be CONSENT, SUPPORTING, or REPORT');
    }

    const buffer = await file.toBuffer();
    const data = await this.backgroundCheckService.uploadDocument(
      request.authUser!,
      id,
      kind,
      {
        buffer,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: buffer.length,
      },
    );
    return reply.status(200).send({ data });
  };

  extractAi = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.extractAi(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  submitForReview = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.submitForReview(
      request.authUser!,
      id,
    );
    return reply.status(200).send({ data });
  };

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.approve(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = (request.body ?? {}) as ReviewNotesBody;
    const data = await this.backgroundCheckService.reject(
      request.authUser!,
      id,
      body.notes,
    );
    return reply.status(200).send({ data });
  };

  requestClarification = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as ReviewNotesBody;
    const data = await this.backgroundCheckService.requestClarification(
      request.authUser!,
      id,
      body.notes ?? '',
    );
    return reply.status(200).send({ data });
  };

  reopen = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.reopen(request.authUser!, id);
    return reply.status(200).send({ data });
  };
}
