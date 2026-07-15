import type { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../../utils/index.js';
import {
  UPLOAD_CATEGORIES,
  validateUploadFile,
} from '../../services/storage.service.js';
import { CandidateService } from './candidate.service.js';
import type {
  CreateCandidateBody,
  ListCandidatesQuery,
  RejectCandidateBody,
  UpdateCandidateBody,
} from './candidate.validator.js';
import type { CandidateAssetKind } from './candidate.types.js';

const ASSET_UPLOAD_CATEGORY = {
  RESUME: UPLOAD_CATEGORIES.RESUME,
  PROFILE_IMAGE: UPLOAD_CATEGORIES.CANDIDATE_PHOTO,
  INTRO_VIDEO: UPLOAD_CATEGORIES.VIDEO,
} as const;

export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.candidateService.create(
      request.authUser!,
      request.body as CreateCandidateBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.candidateService.list(
      request.authUser!,
      request.query as ListCandidatesQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.update(
      request.authUser!,
      id,
      request.body as UpdateCandidateBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.candidateService.delete(request.authUser!, id);
    return reply.status(200).send({
      data: { message: 'Candidate deleted successfully' },
    });
  };

  uploadResume = async (request: FastifyRequest, reply: FastifyReply) => {
    return this.handleUpload(request, reply, 'RESUME');
  };

  uploadProfileImage = async (request: FastifyRequest, reply: FastifyReply) => {
    return this.handleUpload(request, reply, 'PROFILE_IMAGE');
  };

  uploadIntroVideo = async (request: FastifyRequest, reply: FastifyReply) => {
    return this.handleUpload(request, reply, 'INTRO_VIDEO');
  };

  extractResume = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('Resume file is required');
    }

    const buffer = await file.toBuffer();
    validateUploadFile(UPLOAD_CATEGORIES.RESUME, {
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
    const existingCandidateId = candidateIdValue ? Number(candidateIdValue) : undefined;

    const data = await this.candidateService.extractResumeAndCreateDraft(
      request.authUser!,
      {
        buffer,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: buffer.length,
      },
      existingCandidateId && Number.isFinite(existingCandidateId)
        ? existingCandidateId
        : undefined,
    );

    return reply.status(existingCandidateId ? 200 : 201).send({ data });
  };

  publish = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.publish(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  hide = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.hide(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.approve(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.reject(
      request.authUser!,
      id,
      request.body as RejectCandidateBody,
    );
    return reply.status(200).send({ data });
  };

  runAiScreening = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.runAiScreening(
      request.authUser!,
      id,
      (request.body ?? {}) as import('./candidate.validator.js').RunAiScreeningBody,
    );
    return reply.status(200).send({ data });
  };

  completeRecruiterReview = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.completeRecruiterReview(
      request.authUser!,
      id,
      (request.body ?? {}) as import('./candidate.validator.js').CompleteRecruiterReviewBody,
    );
    return reply.status(200).send({ data });
  };

  completePricingAndAvailability = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.completePricingAndAvailability(
      request.authUser!,
      id,
    );
    return reply.status(200).send({ data });
  };

  submitForApproval = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.submitForApproval(
      request.authUser!,
      id,
    );
    return reply.status(200).send({ data });
  };

  private async handleUpload(
    request: FastifyRequest,
    reply: FastifyReply,
    kind: CandidateAssetKind,
  ) {
    const { id } = request.params as { id: number };
    const file = await request.file();

    if (!file) {
      throw new BadRequestError('File is required');
    }

    const buffer = await file.toBuffer();
    const uploadCategory = ASSET_UPLOAD_CATEGORY[kind];

    validateUploadFile(uploadCategory, {
      mimeType: file.mimetype,
      size: buffer.length,
      originalName: file.filename,
    });

    const data = await this.candidateService.uploadAsset(
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
  }
}
