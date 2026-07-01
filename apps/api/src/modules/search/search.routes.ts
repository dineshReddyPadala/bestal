import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';
import { searchQuerySchema, searchResponseSchema } from './search.validator.js';

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  const searchService = new SearchService(fastify);
  const searchController = new SearchController(searchService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Search'],
        summary: 'Search across org-scoped entities',
        security: [{ bearerAuth: [] }],
        querystring: searchQuerySchema,
        response: {
          200: searchResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    searchController.search,
  );
}
