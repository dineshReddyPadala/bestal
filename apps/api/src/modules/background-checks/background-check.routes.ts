import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { BackgroundCheckController } from './background-check.controller.js';
import { BackgroundCheckService } from './background-check.service.js';
import {
  assignVendorBodySchema,
  backgroundCheckIdParamSchema,
  backgroundCheckListResponseSchema,
  backgroundCheckMessageResponseSchema,
  backgroundCheckResponseSchema,
  bgvExtractionResponseSchema,
  bgvExtractAiResponseSchema,
  clarificationBodySchema,
  createBackgroundCheckBodySchema,
  listBackgroundChecksQuerySchema,
  reviewNotesBodySchema,
  updateBackgroundCheckBodySchema,
} from './background-check.validator.js';

export async function backgroundCheckRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  const backgroundCheckService = new BackgroundCheckService(fastify);
  const backgroundCheckController = new BackgroundCheckController(
    backgroundCheckService,
  );
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  const writePre = [
    authenticate,
    requirePermission(PERMISSIONS.BACKGROUND_CHECKS_WRITE),
  ];
  const readPre = [
    authenticate,
    requirePermission(PERMISSIONS.BACKGROUND_CHECKS_READ),
  ];
  const approvePre = [
    authenticate,
    requirePermission(PERMISSIONS.BACKGROUND_CHECKS_APPROVE),
  ];

  app.post(
    '/',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Create a new background check (requires EVALUATION_COMPLETE)',
        security: [{ bearerAuth: [] }],
        body: createBackgroundCheckBodySchema,
        response: {
          201: backgroundCheckResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.create,
  );

  app.post(
    '/extract-bgv',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary:
          'Upload BGV PDF/DOCX and extract fields (async n8n when configured, else sync Python/static)',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        response: {
          200: bgvExtractionResponseSchema,
          401: errorResponses[401],
        },
      },
    },
    backgroundCheckController.extractBgv,
  );

  app.get(
    '/',
    {
      preHandler: readPre,
      schema: {
        tags: ['Background Checks'],
        summary: 'List background checks with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listBackgroundChecksQuerySchema,
        response: {
          200: backgroundCheckListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: readPre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Get background check details by ID',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Update background check (disposition statuses require admin approve routes)',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        body: updateBackgroundCheckBodySchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Soft delete background check',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.remove,
  );

  app.post(
    '/:id/confirm-consent',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Confirm candidate consent for BGV',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.confirmConsent,
  );

  app.post(
    '/:id/assign-vendor',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Assign verification vendor',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        body: assignVendorBodySchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.assignVendor,
  );

  app.post(
    '/:id/start-verification',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Mark verification in progress with vendor',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.startVerification,
  );

  app.post(
    '/:id/documents',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Upload consent, supporting, or final report document (multipart field kind)',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.uploadDocument,
  );

  app.post(
    '/:id/extract-ai',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Run AI extraction on uploaded BGV report (async n8n when configured)',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: bgvExtractAiResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.extractAi,
  );

  app.post(
    '/:id/submit-for-review',
    {
      preHandler: writePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Submit BGV package for admin review',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.submitForReview,
  );

  app.post(
    '/:id/approve',
    {
      preHandler: approvePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Admin approve verification (marks candidate BGV_COMPLETE)',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          403: errorResponses[403],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.approve,
  );

  app.post(
    '/:id/reject',
    {
      preHandler: approvePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Admin reject verification',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        body: reviewNotesBodySchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          403: errorResponses[403],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.reject,
  );

  app.post(
    '/:id/request-clarification',
    {
      preHandler: approvePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Admin request clarification (suspends check)',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        body: clarificationBodySchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          403: errorResponses[403],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.requestClarification,
  );

  app.post(
    '/:id/reopen',
    {
      preHandler: approvePre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Admin reopen a closed/suspended verification',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          403: errorResponses[403],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.reopen,
  );

  app.get(
    '/:id/report/download',
    {
      preHandler: readPre,
      schema: {
        tags: ['Background Checks'],
        summary: 'Download BGV report document',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    backgroundCheckController.downloadReport,
  );
}
