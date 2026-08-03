import type { FastifyReply, FastifyRequest } from 'fastify';
import { ClientService } from './client.service.js';
import type { CreateClientBody, ListClientsQuery, UpdateClientBody } from './client.validator.js';

export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.clientService.create(
      request.authUser!,
      request.body as CreateClientBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.clientService.list(
      request.authUser!,
      request.query as ListClientsQuery,
    );
    return reply.status(200).send(result);
  };

  listAccountManagers = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.clientService.listAccountManagers(request.authUser!);
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.clientService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.clientService.update(
      request.authUser!,
      id,
      request.body as UpdateClientBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.clientService.delete(request.authUser!, id);
    return reply.status(200).send({
      data: { message: 'Client deleted successfully' },
    });
  };
}
