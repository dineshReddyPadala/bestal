import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { DeploymentController } from './deployment.controller.js';
import { DeploymentService } from './deployment.service.js';
import {
  approveDeploymentBodySchema,
  createDeploymentBodySchema,
  deploymentIdParamSchema,
  deploymentListResponseSchema,
  deploymentMessageResponseSchema,
  deploymentResponseSchema,
  listDeploymentsQuerySchema,
  requestDeploymentBodySchema,
  terminateDeploymentBodySchema,
  updateDeploymentBodySchema,
} from './deployment.validator.js';

export async function deploymentRoutes(fastify: FastifyInstance): Promise<void> {
  const deploymentService = new DeploymentService(fastify);
  const deploymentController = new DeploymentController(deploymentService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Create a new deployment',
        security: [{ bearerAuth: [] }],
        body: createDeploymentBodySchema,
        response: {
          201: deploymentResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.create,
  );

  app.post(
    '/request',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_REQUEST),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Client submits a deployment request (non-commercial fields)',
        security: [{ bearerAuth: [] }],
        body: requestDeploymentBodySchema,
        response: {
          201: deploymentResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.request,
  );

  app.get(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_READ),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'List deployments with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listDeploymentsQuerySchema,
        response: {
          200: deploymentListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_READ),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Get deployment details by ID',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Update deployment',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        body: updateDeploymentBodySchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Soft delete deployment',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        response: {
          200: deploymentMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.remove,
  );

  app.post(
    '/:id/approve',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Approve a pending client deployment request with commercial details',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        body: approveDeploymentBodySchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.approve,
  );

  app.post(
    '/:id/activate',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Activate deployment',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.activate,
  );

  app.post(
    '/:id/terminate',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Terminate deployment',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        body: terminateDeploymentBodySchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    deploymentController.terminate,
  );

  app.post(
    '/:id/pause',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Pause deployment (ON_HOLD)',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    deploymentController.pause,
  );

  app.post(
    '/:id/resume',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Resume paused deployment',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    deploymentController.resume,
  );

  app.post(
    '/:id/complete',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Mark deployment completed',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    deploymentController.complete,
  );

  app.post(
    '/:id/extend',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_WRITE),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Extend deployment end date',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        body: z.object({ endDate: z.string().min(1) }),
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    deploymentController.extend,
  );

  app.post(
    '/:id/request-extension',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.DEPLOYMENTS_REQUEST),
      ],
      schema: {
        tags: ['Deployments'],
        summary: 'Client requests a deployment end-date extension',
        security: [{ bearerAuth: [] }],
        params: deploymentIdParamSchema,
        body: z.object({
          endDate: z.string().min(1),
          reason: z.string().max(500).optional(),
        }),
        response: {
          200: deploymentResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    deploymentController.requestExtension,
  );
}
