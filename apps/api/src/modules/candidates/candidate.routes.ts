import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requireAnyPermission, requirePermission } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { CandidateController } from './candidate.controller.js';
import { CandidateService } from './candidate.service.js';
import {
  assetUploadUrlResponseSchema,
  candidateIdParamSchema,
  candidateListResponseSchema,
  candidateResponseSchema,
  completeAssetUploadBodySchema,
  createCandidateBodySchema,
  listCandidatesQuerySchema,
  messageResponseSchema,
  prepareAssetUploadBodySchema,
  rejectCandidateBodySchema,
  runAiScreeningBodySchema,
  completeRecruiterReviewBodySchema,
  resumeExtractionDraftResponseSchema,
  updateCandidateBodySchema,
} from './candidate.validator.js';

export async function candidateRoutes(fastify: FastifyInstance): Promise<void> {
  const candidateService = new CandidateService(fastify);
  const candidateController = new CandidateController(candidateService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

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

  app.post(
    '/extract-resume',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary:
          'Upload resume to storage, extract via Python AI, and create a SOURCED draft candidate',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        response: { 201: resumeExtractionDraftResponseSchema },
      },
    },
    candidateController.extractResume,
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
        summary: 'Upload candidate resume via API (local storage only)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        consumes: ['multipart/form-data'],
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.uploadResume,
  );

  app.post(
    '/:id/resume/upload-url',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Get presigned S3 URL for resume upload (browser uploads directly to S3)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: prepareAssetUploadBodySchema,
        response: { 200: assetUploadUrlResponseSchema },
      },
    },
    candidateController.prepareResumeUpload,
  );

  app.post(
    '/:id/resume/complete',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Confirm resume upload after direct S3 PUT',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: completeAssetUploadBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.completeResumeUpload,
  );

  app.post(
    '/:id/profile-image',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Upload candidate profile image via API (local storage only)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        consumes: ['multipart/form-data'],
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.uploadProfileImage,
  );

  app.post(
    '/:id/profile-image/upload-url',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Get presigned S3 URL for profile image upload',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: prepareAssetUploadBodySchema,
        response: { 200: assetUploadUrlResponseSchema },
      },
    },
    candidateController.prepareProfileImageUpload,
  );

  app.post(
    '/:id/profile-image/complete',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Confirm profile image upload after direct S3 PUT',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: completeAssetUploadBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.completeProfileImageUpload,
  );

  app.post(
    '/:id/intro-video',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Upload candidate intro video via API (local storage only)',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        consumes: ['multipart/form-data'],
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.uploadIntroVideo,
  );

  app.post(
    '/:id/intro-video/upload-url',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Get presigned S3 URL for intro video upload',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: prepareAssetUploadBodySchema,
        response: { 200: assetUploadUrlResponseSchema },
      },
    },
    candidateController.prepareIntroVideoUpload,
  );

  app.post(
    '/:id/intro-video/complete',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_WRITE)],
      schema: {
        tags: ['Candidates'],
        summary: 'Confirm intro video upload after direct S3 PUT',
        security: [{ bearerAuth: [] }],
        params: candidateIdParamSchema,
        body: completeAssetUploadBodySchema,
        response: { 200: candidateResponseSchema },
      },
    },
    candidateController.completeIntroVideoUpload,
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
