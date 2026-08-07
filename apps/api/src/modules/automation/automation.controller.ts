import type { FastifyReply, FastifyRequest } from 'fastify';
import { AutomationService } from './automation.service.js';
import type {
  AutomationCallbackBody,
  ListAutomationJobsQuery,
} from './dto/automation-callback.dto.js';
import type { EvaluationAnalysisCallbackBody } from './dto/evaluation-analysis-callback.dto.js';
import type { BgvAnalysisCallbackBody } from './dto/bgv-analysis-callback.dto.js';
import type { ResumeScreeningCallbackBody } from './dto/resume-screening-callback.dto.js';

export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.automationService.list(
      request.authUser!,
      request.query as ListAutomationJobsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.automationService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  /** Legacy generic callback (kept for compatibility). Prefer typed internal callbacks. */
  callback = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.automationService.applyCallback(
      request.body as AutomationCallbackBody,
    );
    return reply.status(200).send({ data });
  };

  /** Internal Resume AI Screening callback for n8n (Bearer service auth). */
  resumeScreeningCallback = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.automationService.applyResumeScreeningInternalCallback(
      request.body as ResumeScreeningCallbackBody,
      {
        ipAddress: request.ip,
        userAgent:
          typeof request.headers['user-agent'] === 'string'
            ? request.headers['user-agent']
            : null,
      },
    );
    return reply.status(200).send(result);
  };

  /** Internal Evaluation AI Analysis callback for n8n (Bearer service auth). */
  evaluationAnalysisCallback = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result =
      await this.automationService.applyEvaluationAnalysisInternalCallback(
        request.body as EvaluationAnalysisCallbackBody,
        {
          ipAddress: request.ip,
          userAgent:
            typeof request.headers['user-agent'] === 'string'
              ? request.headers['user-agent']
              : null,
        },
      );
    return reply.status(200).send(result);
  };

  /** Internal BGV AI Analysis callback for n8n (Bearer service auth). */
  bgvAnalysisCallback = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.automationService.applyBgvAnalysisInternalCallback(
      request.body as BgvAnalysisCallbackBody,
      {
        ipAddress: request.ip,
        userAgent:
          typeof request.headers['user-agent'] === 'string'
            ? request.headers['user-agent']
            : null,
      },
    );
    return reply.status(200).send(result);
  };
}
