import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { ERROR_CODES, HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/index.js';
import type { ProblemDetail } from '../types/index.js';

function formatZodError(error: ZodError): ProblemDetail {
  return {
    type: 'https://bestal.com/errors/validation',
    title: 'Validation Error',
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    detail: 'Request validation failed',
    code: ERROR_CODES.VALIDATION_ERROR,
    errors: error.errors.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    })),
  };
}

function formatAppError(error: AppError, instance: string): ProblemDetail {
  return {
    type: `https://bestal.com/errors/${error.code.toLowerCase()}`,
    title: error.name,
    status: error.statusCode,
    detail: error.message,
    instance,
    code: error.code,
    errors: error.errors,
  };
}

async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler(
    (error: FastifyError | AppError | ZodError, request: FastifyRequest, reply: FastifyReply) => {
      const instance = request.url;

      if (error instanceof ZodError) {
        const problem = formatZodError(error);
        request.log.warn({ err: error, problem }, 'Validation error');
        return reply.status(problem.status).type('application/problem+json').send(problem);
      }

      if (error instanceof AppError) {
        const problem = formatAppError(error, instance);

        if (error.isOperational) {
          request.log.warn({ err: error, problem }, 'Operational error');
        } else {
          request.log.error({ err: error, problem }, 'Non-operational error');
        }

        return reply.status(problem.status).type('application/problem+json').send(problem);
      }

      if (error.validation) {
        const problem: ProblemDetail = {
          type: 'https://bestal.com/errors/validation',
          title: 'Validation Error',
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          detail: error.message,
          instance,
          code: ERROR_CODES.VALIDATION_ERROR,
        };

        request.log.warn({ err: error, problem }, 'Fastify validation error');
        return reply.status(problem.status).type('application/problem+json').send(problem);
      }

      const statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const problem: ProblemDetail = {
        type: 'https://bestal.com/errors/internal',
        title: 'Internal Server Error',
        status: statusCode >= 500 ? HTTP_STATUS.INTERNAL_SERVER_ERROR : statusCode,
        detail:
          fastify.config.isProduction && statusCode >= 500
            ? 'An unexpected error occurred'
            : error.message,
        instance,
        code: ERROR_CODES.INTERNAL_ERROR,
      };

      request.log.error({ err: error, problem }, 'Unhandled error');
      return reply.status(problem.status).type('application/problem+json').send(problem);
    },
  );

  fastify.setNotFoundHandler((request, reply) => {
    const problem: ProblemDetail = {
      type: 'https://bestal.com/errors/not-found',
      title: 'Not Found',
      status: HTTP_STATUS.NOT_FOUND,
      detail: `Route ${request.method} ${request.url} not found`,
      instance: request.url,
      code: ERROR_CODES.NOT_FOUND,
    };

    return reply.status(problem.status).type('application/problem+json').send(problem);
  });
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
});
