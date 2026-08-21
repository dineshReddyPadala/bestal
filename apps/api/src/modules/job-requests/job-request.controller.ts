import type { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../../utils/index.js';
import { JobRequestService } from './job-request.service.js';
import type {
  CreatePublicJobRequestBody,
  ListJobRequestsQuery,
  UpdateJobRequestBody,
} from './job-request.validator.js';
import { createClientEnquiryBodySchema } from './job-request.validator.js';
import type { ClientEnquiryUploadFile } from './job-request.types.js';

export class JobRequestController {
  constructor(private readonly jobRequestService: JobRequestService) {}

  submitPublic = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.jobRequestService.submitPublic(
      request.body as CreatePublicJobRequestBody,
    );
    return reply.status(201).send({ data });
  };

  submitClientEnquiry = async (request: FastifyRequest, reply: FastifyReply) => {
    let payloadJson: string | undefined;
    const files: ClientEnquiryUploadFile[] = [];

    for await (const part of request.parts()) {
      if (part.type === 'field' && part.fieldname === 'data') {
        payloadJson = String(part.value);
        continue;
      }

      if (part.type === 'file' && part.fieldname === 'attachments') {
        const buffer = await part.toBuffer();
        files.push({
          buffer,
          originalName: part.filename,
          mimeType: part.mimetype,
          size: buffer.length,
        });
      }
    }

    if (!payloadJson) {
      throw new BadRequestError('Enquiry payload is required');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payloadJson);
    } catch {
      throw new BadRequestError('Invalid enquiry payload JSON');
    }

    const body = createClientEnquiryBodySchema.parse(parsed);
    const data = await this.jobRequestService.submitClientEnquiry(body, files);
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.jobRequestService.list(
      request.authUser!,
      request.query as ListJobRequestsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.jobRequestService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.jobRequestService.update(
      request.authUser!,
      id,
      request.body as UpdateJobRequestBody,
    );
    return reply.status(200).send({ data });
  };
}
