import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requireAnyPermission, requirePermission } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { CandidateController } from './candidate.controller.js';
import { CandidateImportService } from './candidate-import.service.js';
import { CandidateService } from './candidate.service.js';
import {
  candidateIdParamSchema,
  candidateListResponseSchema,
  candidateResponseSchema,
  createCandidateBodySchema,
  listCandidatesQuerySchema,
  messageResponseSchema,
  rejectCandidateBodySchema,
  sendBackCandidateBodySchema,
  runAiScreeningBodySchema,
  completeRecruiterReviewBodySchema,
  resumeExtractionDraftResponseSchema,
  updateCandidateBodySchema,
} from './candidate.validator.js';

const importBatchIdParamSchema = z.object({
  batchId: z.coerce.number().int().positive(),
});

const importListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export async function candidateRoutes(fastify: FastifyInstance): Promise<void> {
  const candidateService = new CandidateService(fastify);
  const candidateImportService = new CandidateImportService(fastify);
  const candidateController = new CandidateController(
    candidateService,
    candidateImportService,
  );
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/imports/template',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Download the standard BesTal candidate import Excel template',
        security: [{ bearerAuth: [] }],
      },
    },
    candidateController.downloadImportTemplate,
  );

  app.post(
    '/imports',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Upload a candidate import workbook (fire-and-forget)',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
      },
    },
    candidateController.enqueueImport,
  );

  app.get(
    '/imports',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'List candidate import history for the organization',
        security: [{ bearerAuth: [] }],
        querystring: importListQuerySchema,
      },
    },
    candidateController.listImportHistory,
  );

  app.post(
    '/imports/preview',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Validate and preview a standard candidate import workbook',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
      },
    },
    candidateController.previewImport,
  );

  app.post(
    '/imports/:batchId/confirm',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Confirm and execute a previewed candidate import batch',
        security: [{ bearerAuth: [] }],
        params: importBatchIdParamSchema,
      },
    },
    candidateController.confirmImport,
  );

  app.get(
    '/imports/:batchId',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Get candidate import batch status and summary',
        security: [{ bearerAuth: [] }],
        params: importBatchIdParamSchema,
      },
    },
    candidateController.getImportBatch,
  );

  app.get(
    '/imports/:batchId/errors',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'List per-record candidate import errors for a batch',
        security: [{ bearerAuth: [] }],
        params: importBatchIdParamSchema,
        querystring: importListQuerySchema,
      },
    },
    candidateController.listImportErrors,
  );

  app.get(
    '/imports/:batchId/error-report',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Download candidate import validation/error report',
        security: [{ bearerAuth: [] }],
        params: importBatchIdParamSchema,
      },
    },
    candidateController.downloadImportErrorReport,
  );

  app.get(
    '/imports/:batchId/file',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Download the original uploaded candidate import workbook',
        security: [{ bearerAuth: [] }],
        params: importBatchIdParamSchema,
      },
    },
    candidateController.downloadImportSourceFile,
  );

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Create a new candidate',
        security: [{ bearerAuth: [] }],
        body: createCandidateBodySchema,
        response: { 201: candidateResponseSchema },
      },
    },
    candidateController.create,
  );

  /**
   * Resume upload + AI screening entry point.
   *
   * Multipart body:
   * - `file` (required) — resume PDF/DOCX
   * - `candidateId` (optional) — re-screen an existing candidate; omit for a new upload
   *
   * Response shape (201 for new upload, 200 when `candidateId` is supplied):
   * - Sync (n8n not configured): `{ candidate, extraction }` — candidate exists immediately
   * - Async (n8n configured): `{ jobId, status, candidateId, documentId }` — poll
   *   `GET /automation/jobs/:id`; `candidateId` is null until screening completes
   */
  app.post(
    '/extract-resume',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary:
          'Upload resume and start AI screening (async n8n when configured; otherwise sync Python/static)',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        response: { 201: resumeExtractionDraftResponseSchema },
      },
    },
    candidateController.extractResume,
  );

  app.post(
    '/import-csv',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Legacy Oorwin/BesTal CSV import (prefer /imports/preview)',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
      },
    },
    candidateController.importCsv,
  );

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_READ)],
      schema: {
        tags: ['Candidates'],
        summary: 'List candidates with pagination, filtering, sorting, and search',
        security: [{ bearerAuth: [] }],
        querystring: listCandidatesQuerySchema,
        response: { 200: candidateListResponseSchema },
      },
    },
    candidateController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_READ)],
      schema: {
        tags: ['Candidates'],
        summary: 'Get candidate details by ID',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [
        authenticate,
        requireAnyPermission(
          PERMISSIONS.CANDIDATES_WRITE,
          PERMISSIONS.CANDIDATES_EDIT_LIMITED,
        ),
      ],
      schema: {
        tags: ['Candidates'],
        summary: 'Update candidate',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: updateCandidateBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_DELETE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Soft delete candidate',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: messageResponseSchema },
      },
    },
    candidateController.remove,
  );

  app.post(
    '/:id/resume',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Upload candidate resume',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        consumes: ['multipart/form-data'],
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.uploadResume,
  );

  app.post(
    '/:id/profile-image',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Upload candidate profile image',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        consumes: ['multipart/form-data'],
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.uploadProfileImage,
  );

  app.post(
    '/:id/intro-video',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Upload candidate intro video',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        consumes: ['multipart/form-data'],
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.uploadIntroVideo,
  );

  app.post(
    '/:id/publish',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_APPROVE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Publish candidate profile to clients',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.publish,
  );

  app.post(
    '/:id/hide',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_APPROVE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Hide candidate profile',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.hide,
  );

  app.post(
    '/:id/approve',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_APPROVE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Approve candidate profile',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.approve,
  );

  app.post(
    '/:id/reject',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_APPROVE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Reject candidate profile',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: rejectCandidateBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.reject,
  );

  app.post(
    '/:id/send-back',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_APPROVE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Send candidate back to recruiter for revisions',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: sendBackCandidateBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.sendBack,
  );

  app.post(
    '/:id/pipeline/ai-screening',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Run AI screening (SOURCED → AI_SCREENED)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: runAiScreeningBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.runAiScreening,
  );

  app.post(
    '/:id/pipeline/recruiter-review',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Complete recruiter review (AI_SCREENED → RECRUITER_SCREENED)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: completeRecruiterReviewBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.completeRecruiterReview,
  );

  app.post(
    '/:id/pipeline/pricing',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Complete pricing and availability (BGV_COMPLETE → PROFILE_DRAFT)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.completePricingAndAvailability,
  );

  app.post(
    '/:id/pipeline/submit',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Submit candidate for admin approval',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.submitForApproval,
  );
}
