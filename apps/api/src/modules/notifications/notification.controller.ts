import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotificationService } from './notification.service.js';
import type { ListNotificationsQuery } from './notification.validator.js';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.notificationService.list(
      request.authUser!,
      request.query as ListNotificationsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.notificationService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  markAsRead = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.notificationService.markAsRead(
      request.authUser!,
      id,
    );
    return reply.status(200).send({ data });
  };

  markAllAsRead = async (request: FastifyRequest, reply: FastifyReply) => {
    const { count } = await this.notificationService.markAllAsRead(
      request.authUser!,
    );
    return reply.status(200).send({
      data: { message: `${count} notification(s) marked as read` },
    });
  };
}
