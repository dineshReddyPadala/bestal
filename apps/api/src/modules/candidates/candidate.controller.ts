import type { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../../utils/index.js';
import {
  UPLOAD_CATEGORIES,
  validateUploadFile,
} from '../../services/storage.service.js';
import { AdminOpsService } from '../admin/admin-ops.service.js';
import { CandidateImportService } from './candidate-import.service.js';
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
  constructor(
    private readonly candidateService: CandidateService,
    private readonly candidateImportService: CandidateImportService,
  ) {}

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

  listPublicFeatured = async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit } = request.query as { limit?: number };
    const result = await this.candidateService.listPublicFeatured(limit ?? 5);
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

  /**
   * Handles multipart resume upload for `/extract-resume`.
   * Delegates to {@link CandidateService.extractResumeAndCreateDraft}.
   */
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

    // Optional form field — when set, resume is attached to an existing candidate (re-screen).
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

    // 201 = new candidate path; 200 = re-screen on an existing record.
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

  archive = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.archive(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  unarchive = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.candidateService.unarchive(request.authUser!, id);
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

  sendBack = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = (request.body ?? {}) as { reason?: string };
    const data = await this.candidateService.sendBack(
      request.authUser!,
      id,
      body.reason,
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
  };

  importCsv = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('CSV file is required');
    }
    const buffer = await file.toBuffer();
    const ops = new AdminOpsService(request.server);
    const data = await ops.importOorwinCsv(
      request.authUser!,
      file.filename,
      buffer.toString('utf8'),
    );
    return reply.send({ data });
  };

  downloadImportTemplate = async (_request: FastifyRequest, reply: FastifyReply) => {
    const buffer = await this.candidateImportService.getTemplateBuffer();
    reply.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    reply.header(
      'Content-Disposition',
      'attachment; filename="bestal-candidate-import-template.xlsx"',
    );
    return reply.send(buffer);
  };

  enqueueImport = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('Excel workbook (.xlsx) is required');
    }
    const buffer = await file.toBuffer();
    const data = await this.candidateImportService.enqueue(
      request.authUser!,
      file.filename,
      buffer,
    );
    return reply.status(202).send({ data });
  };

  listImportHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { page?: number; limit?: number };
    const result = await this.candidateImportService.listHistory(request.authUser!, query);
    return reply.status(200).send(result);
  };

  listImportErrors = async (request: FastifyRequest, reply: FastifyReply) => {
    const { batchId } = request.params as { batchId: number };
    const query = request.query as { page?: number; limit?: number };
    const result = await this.candidateImportService.listErrors(
      request.authUser!,
      batchId,
      query,
    );
    return reply.status(200).send(result);
  };

  previewImport = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('Excel workbook (.xlsx) is required');
    }
    const buffer = await file.toBuffer();
    const data = await this.candidateImportService.preview(
      request.authUser!,
      file.filename,
      buffer,
    );
    return reply.status(200).send({ data });
  };

  confirmImport = async (request: FastifyRequest, reply: FastifyReply) => {
    const { batchId } = request.params as { batchId: number };
    const data = await this.candidateImportService.confirm(request.authUser!, batchId);
    return reply.status(202).send({ data });
  };

  getImportBatch = async (request: FastifyRequest, reply: FastifyReply) => {
    const { batchId } = request.params as { batchId: number };
    const data = await this.candidateImportService.getBatch(request.authUser!, batchId);
    return reply.status(200).send({ data });
  };

  downloadImportErrorReport = async (request: FastifyRequest, reply: FastifyReply) => {
    const { batchId } = request.params as { batchId: number };
    const report = await this.candidateImportService.getErrorReport(
      request.authUser!,
      batchId,
    );
    reply.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    reply.header(
      'Content-Disposition',
      `attachment; filename="${report.fileName}"`,
    );
    return reply.send(report.buffer);
  };

  downloadImportSourceFile = async (request: FastifyRequest, reply: FastifyReply) => {
    const { batchId } = request.params as { batchId: number };
    const file = await this.candidateImportService.getSourceFile(
      request.authUser!,
      batchId,
    );
    reply.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    reply.header(
      'Content-Disposition',
      `attachment; filename="${file.fileName}"`,
    );
    return reply.send(file.buffer);
  };
}
