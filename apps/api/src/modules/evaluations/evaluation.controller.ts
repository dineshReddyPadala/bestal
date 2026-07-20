import type { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../../utils/index.js';
import {
  UPLOAD_CATEGORIES,
  validateUploadFile,
} from '../../services/storage.service.js';
import { EvaluationService } from './evaluation.service.js';
import type {
  CreateEvaluationBody,
  ListEvaluationsQuery,
  UpdateEvaluationBody,
} from './evaluation.validator.js';

export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.evaluationService.create(
      request.authUser!,
      request.body as CreateEvaluationBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.evaluationService.list(
      request.authUser!,
      request.query as ListEvaluationsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.evaluationService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.evaluationService.update(
      request.authUser!,
      id,
      request.body as UpdateEvaluationBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.evaluationService.delete(request.authUser!, id);
    return reply.status(200).send({
      data: { message: 'Evaluation deleted successfully' },
    });
  };

  extractEvaluation = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('Evaluation file is required');
    }

    const buffer = await file.toBuffer();
    validateUploadFile(UPLOAD_CATEGORIES.EVALUATION, {
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

    const data = await this.evaluationService.extractEvaluationDocument(
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
}
