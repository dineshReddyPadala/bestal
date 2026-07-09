import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service.js';
import type { BulkInviteBody, CreateUserBody, ListUsersQuery } from './user.validator.js';

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.userService.list(
      request.authUser!,
      request.query as ListUsersQuery,
    );
    return reply.status(200).send(result);
  };

  invite = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.userService.invite(
      request.authUser!,
      request.body as CreateUserBody,
    );
    return reply.status(201).send({ data });
  };

  inviteBulk = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as BulkInviteBody;
    const data = await this.userService.inviteBulk(request.authUser!, body.users);
    return reply.status(200).send({ data });
  };
}
