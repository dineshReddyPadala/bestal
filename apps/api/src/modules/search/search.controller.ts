import type { FastifyReply, FastifyRequest } from 'fastify';
import { SearchService } from './search.service.js';
import type { SearchQuery } from './search.validator.js';

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.searchService.search(
      request.authUser!,
      request.query as SearchQuery,
    );
    return reply.status(200).send(result);
  };
}
