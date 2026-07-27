import type { FastifyReply, FastifyRequest } from 'fastify';
import { DeploymentService } from './deployment.service.js';
import type {
  CreateDeploymentBody,
  ListDeploymentsQuery,
  TerminateDeploymentBody,
  UpdateDeploymentBody,
} from './deployment.validator.js';

export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.deploymentService.create(
      request.authUser!,
      request.body as CreateDeploymentBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.deploymentService.list(
      request.authUser!,
      request.query as ListDeploymentsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.update(
      request.authUser!,
      id,
      request.body as UpdateDeploymentBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.deploymentService.delete(request.authUser!, id);
    return reply.status(200).send({
      data: { message: 'Deployment deleted successfully' },
    });
  };

  activate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.activate(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  terminate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.terminate(
      request.authUser!,
      id,
      request.body as TerminateDeploymentBody,
    );
    return reply.status(200).send({ data });
  };

  pause = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.pause(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  resume = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.resume(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  complete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.deploymentService.complete(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  extend = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { endDate: string };
    const data = await this.deploymentService.extend(
      request.authUser!,
      id,
      body.endDate,
    );
    return reply.status(200).send({ data });
  };
}
