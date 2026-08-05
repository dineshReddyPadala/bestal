import type { Prisma } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
  bigintToNumber,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { AuditService } from '../admin/audit.service.js';
import {
  AUTOMATION_JOB_STATUSES,
  AUTOMATION_JOB_TYPES,
  AUTOMATION_TERMINAL_STATUSES,
  DEFAULT_AUTOMATION_MAX_ATTEMPTS,
  DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES,
} from './automation.constants.js';
import { mapAutomationJobToDto } from './automation.mapper.js';
import { AutomationRepository } from './automation.repository.js';
import type {
  AutomationJobDto,
  CreateAutomationJobInput,
  N8nWorkflowTriggerInput,
  StartAutomationWorkflowInput,
  UpdateAutomationJobInput,
} from './automation.types.js';
import type {
  AutomationCallbackBody,
  ListAutomationJobsQuery,
} from './dto/automation-callback.dto.js';
import type { BgvAnalysisCallbackBody } from './dto/bgv-analysis-callback.dto.js';
import { bgvAnalysisOutputSchema } from './dto/bgv-analysis.dto.js';
import type { EvaluationAnalysisCallbackBody } from './dto/evaluation-analysis-callback.dto.js';
import { evaluationAnalysisOutputSchema } from './dto/evaluation-analysis.dto.js';
import type { ResumeScreeningCallbackBody } from './dto/resume-screening-callback.dto.js';
import { resumeScreeningOutputSchema } from './dto/resume-screening.dto.js';
import { N8nClient, N8nClientError } from './n8n.client.js';
import { readN8nConfig, readWorkflowsSettings, resolveWorkflowIdentity } from '../../services/system-settings.reader.js';

export type ResumeScreeningCallbackResult = {
  data: AutomationJobDto;
  alreadyProcessed: boolean;
};

export type EvaluationAnalysisCallbackResult = {
  data: AutomationJobDto;
  alreadyProcessed: boolean;
};

export type BgvAnalysisCallbackResult = {
  data: AutomationJobDto;
  alreadyProcessed: boolean;
};

export class AutomationService {
  private readonly automationRepository: AutomationRepository;
  /** Optional override for unit tests — production reads Platform Settings. */
  private readonly n8nClientOverride?: N8nClient;
  private readonly audit: AuditService;

  constructor(
    private readonly fastify: FastifyInstance,
    automationRepository?: AutomationRepository,
    n8nClient?: N8nClient,
  ) {
    this.automationRepository =
      automationRepository ?? new AutomationRepository(fastify.prisma);
    this.n8nClientOverride = n8nClient;
    this.audit = new AuditService(fastify.prisma);
  }

  private async getN8nClient(): Promise<N8nClient> {
    if (this.n8nClientOverride) {
      return this.n8nClientOverride;
    }
    const config = await readN8nConfig(this.fastify.prisma);
    return new N8nClient(
      config,
      this.fastify.log.child({ module: 'n8n-client' }),
    );
  }

  private async resolveWorkflowIdentity(
    jobType: (typeof AUTOMATION_JOB_TYPES)[keyof typeof AUTOMATION_JOB_TYPES],
  ): Promise<{ workflowName: string; workflowVersion: string }> {
    const settings = await readWorkflowsSettings(this.fastify.prisma);
    return resolveWorkflowIdentity(settings, jobType);
  }

  private buildN8nTriggerInput(
    job: AutomationJobDto,
    input: StartAutomationWorkflowInput,
    jobType: (typeof AUTOMATION_JOB_TYPES)[keyof typeof AUTOMATION_JOB_TYPES],
  ): N8nWorkflowTriggerInput {
    const defaults = DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES[jobType];
    return {
      jobId: job.id,
      candidateId: input.candidateId,
      documentId: input.documentId,
      requestedBy: input.requestedBy,
      documentUrl: input.documentUrl,
      workflowName: job.workflowName ?? defaults.name,
      workflowVersion: job.workflowVersion ?? defaults.version,
    };
  }

  async createJob(input: CreateAutomationJobInput): Promise<AutomationJobDto> {
    if (input.candidateId != null) {
      await this.assertCandidateExists(input.candidateId);
    }
    if (input.documentId != null) {
      await this.assertDocumentExists(input.documentId);
    }

    const job = await this.automationRepository.create({
      ...input,
      workflowName:
        input.workflowName ??
        DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES[
          input.jobType as keyof typeof DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES
        ].name,
      maxAttempts: input.maxAttempts ?? DEFAULT_AUTOMATION_MAX_ATTEMPTS,
    });

    return mapAutomationJobToDto(job);
  }

  /**
   * Create PENDING resume job and trigger n8n in the background.
   * Returns immediately — does not wait for OpenAI.
   */
  async enqueueResumeScreening(
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    this.assertStartInput(input);

    const identity = await this.resolveWorkflowIdentity(
      AUTOMATION_JOB_TYPES.RESUME_SCREENING,
    );

    const created = await this.createJob({
      candidateId: input.candidateId,
      documentId: input.documentId,
      jobType: AUTOMATION_JOB_TYPES.RESUME_SCREENING,
      requestedBy: input.requestedBy,
      workflowName: identity.workflowName,
      workflowVersion: input.workflowVersion ?? identity.workflowVersion,
      maxAttempts: input.maxAttempts,
      inputReference: {
        ...(input.inputReference ?? {}),
        candidateId: input.candidateId,
        documentId: input.documentId,
        hasDocumentUrl: true,
      },
    });

    void this.dispatchResumeScreening(created, input).catch((error) => {
      this.fastify.log.error(
        {
          jobId: created.id,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        },
        'Background n8n resume trigger failed',
      );
    });

    return created;
  }

  /**
   * Create PENDING evaluation job and trigger n8n in the background.
   * Returns immediately — does not wait for OpenAI.
   */
  async enqueueEvaluationAnalysis(
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    this.assertStartInput(input, { requireCandidate: true });

    const identity = await this.resolveWorkflowIdentity(
      AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
    );

    const created = await this.createJob({
      candidateId: input.candidateId,
      documentId: input.documentId,
      jobType: AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
      requestedBy: input.requestedBy,
      workflowName: identity.workflowName,
      workflowVersion: input.workflowVersion ?? identity.workflowVersion,
      maxAttempts: input.maxAttempts,
      inputReference: {
        ...(input.inputReference ?? {}),
        candidateId: input.candidateId,
        documentId: input.documentId,
        hasDocumentUrl: true,
      },
    });

    void this.dispatchEvaluationAnalysis(created, input).catch((error) => {
      this.fastify.log.error(
        {
          jobId: created.id,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        },
        'Background n8n evaluation trigger failed',
      );
    });

    return created;
  }

  /**
   * Create PENDING BGV job and trigger n8n in the background.
   * Returns immediately — does not wait for OpenAI.
   */
  async enqueueBgvAnalysis(
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    this.assertStartInput(input, { requireCandidate: true });

    const identity = await this.resolveWorkflowIdentity(
      AUTOMATION_JOB_TYPES.BGV_ANALYSIS,
    );

    const created = await this.createJob({
      candidateId: input.candidateId,
      documentId: input.documentId,
      jobType: AUTOMATION_JOB_TYPES.BGV_ANALYSIS,
      requestedBy: input.requestedBy,
      workflowName: identity.workflowName,
      workflowVersion: input.workflowVersion ?? identity.workflowVersion,
      maxAttempts: input.maxAttempts,
      inputReference: {
        ...(input.inputReference ?? {}),
        candidateId: input.candidateId,
        documentId: input.documentId,
        hasDocumentUrl: true,
      },
    });

    void this.dispatchBgvAnalysis(created, input).catch((error) => {
      this.fastify.log.error(
        {
          jobId: created.id,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        },
        'Background n8n BGV trigger failed',
      );
    });

    return created;
  }

  async startResumeScreening(
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    return this.startWorkflow(AUTOMATION_JOB_TYPES.RESUME_SCREENING, input);
  }

  async startEvaluationAnalysis(
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    return this.startWorkflow(AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS, input);
  }

  async startBgvAnalysis(
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    return this.startWorkflow(AUTOMATION_JOB_TYPES.BGV_ANALYSIS, input);
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<AutomationJobDto> {
    const organizationId = requireOrganization(authUser);
    const job = await this.automationRepository.findByIdForOrganization(
      organizationId,
      id,
    );
    if (!job) {
      throw new NotFoundError('Automation job not found');
    }
    return mapAutomationJobToDto(job);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListAutomationJobsQuery,
  ): Promise<{
    data: AutomationJobDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const { items, total } = await this.automationRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      candidateId: query.candidateId,
      documentId: query.documentId,
      jobType: query.jobType,
      status: query.status,
    });

    return {
      data: items.map(mapAutomationJobToDto),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  /**
   * Secure internal Resume AI Screening callback (n8n → Fastify).
   * Payload uses `result` (not user-facing). Idempotent by numeric jobId.
   */
  async applyResumeScreeningInternalCallback(
    body: ResumeScreeningCallbackBody,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<ResumeScreeningCallbackResult> {
    if (!Number.isInteger(body.jobId) || body.jobId <= 0) {
      throw new BadRequestError('jobId must be a positive integer');
    }

    const existing = await this.automationRepository.findById(body.jobId);
    if (!existing) {
      throw new NotFoundError('Automation job not found');
    }

    if (existing.jobType !== AUTOMATION_JOB_TYPES.RESUME_SCREENING) {
      throw new BadRequestError(
        `Automation job ${body.jobId} is type ${existing.jobType}, expected RESUME_SCREENING`,
      );
    }

    const jobCandidateId =
      existing.candidateId != null ? bigintToNumber(existing.candidateId) : null;
    if (jobCandidateId != null) {
      if (
        body.candidateId != null &&
        body.candidateId > 0 &&
        body.candidateId !== jobCandidateId
      ) {
        throw new BadRequestError(
          `candidateId ${body.candidateId} does not match automation job ${body.jobId}`,
        );
      }
    }

    if (AUTOMATION_TERMINAL_STATUSES.has(existing.status)) {
      this.fastify.log.info(
        { jobId: body.jobId, status: existing.status },
        'Idempotent resume callback — job already terminal',
      );
      return {
        data: mapAutomationJobToDto(existing),
        alreadyProcessed: true,
      };
    }

    if (body.status === AUTOMATION_JOB_STATUSES.COMPLETED) {
      const data = await this.applyResumeScreeningCompletedCallback(
        {
          jobId: body.jobId,
          jobType: AUTOMATION_JOB_TYPES.RESUME_SCREENING,
          status: body.status,
          candidateId: body.candidateId,
          n8nExecutionId: body.n8nExecutionId,
          errorCode: body.errorCode,
          errorMessage: body.errorMessage,
          output: body.result,
        },
        existing.id,
      );

      await this.writeAutomationAudit({
        job: data,
        description: jobCandidateId
          ? `Resume AI screening completed for candidate ${jobCandidateId}`
          : `Resume AI screening completed for job ${body.jobId}`,
        metadata: {
          jobId: body.jobId,
          candidateId: jobCandidateId ?? data.candidateId,
          status: 'COMPLETED',
          source: 'n8n-internal-callback',
        },
        ctx,
      });

      return { data, alreadyProcessed: false };
    }

    const now = new Date();
    const isTerminal =
      body.status === AUTOMATION_JOB_STATUSES.FAILED ||
      body.status === AUTOMATION_JOB_STATUSES.CANCELLED;
    const attempts =
      body.status === AUTOMATION_JOB_STATUSES.RETRYING ||
      body.status === AUTOMATION_JOB_STATUSES.FAILED
        ? existing.attempts + 1
        : existing.attempts;

    const updated = await this.automationRepository.update(body.jobId, {
      status: body.status,
      n8nExecutionId: body.n8nExecutionId ?? existing.n8nExecutionId,
      errorCode: body.errorCode ?? (isTerminal ? 'N8N_CALLBACK_FAILED' : null),
      errorMessage: body.errorMessage ?? null,
      attempts,
      startedAt:
        existing.startedAt ??
        (body.status === AUTOMATION_JOB_STATUSES.PROCESSING ? now : existing.startedAt),
      completedAt: isTerminal ? now : null,
      outputReference:
        body.result && Object.keys(body.result).length > 0
          ? (body.result as Prisma.InputJsonValue)
          : undefined,
    });

    const data = mapAutomationJobToDto(updated);

    if (isTerminal) {
      await this.writeAutomationAudit({
        job: data,
        description: jobCandidateId
          ? `Resume AI screening ${body.status.toLowerCase()} for candidate ${jobCandidateId}`
          : `Resume AI screening ${body.status.toLowerCase()} for job ${body.jobId}`,
        metadata: {
          jobId: body.jobId,
          candidateId: jobCandidateId ?? body.candidateId ?? null,
          status: body.status,
          errorCode: data.errorCode,
          source: 'n8n-internal-callback',
        },
        ctx,
      });
    }

    return { data, alreadyProcessed: false };
  }

  /**
   * Secure internal Evaluation AI Analysis callback (n8n → Fastify).
   * Payload uses `result`. Idempotent by numeric jobId.
   */
  async applyEvaluationAnalysisInternalCallback(
    body: EvaluationAnalysisCallbackBody,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<EvaluationAnalysisCallbackResult> {
    if (!Number.isInteger(body.jobId) || body.jobId <= 0) {
      throw new BadRequestError('jobId must be a positive integer');
    }
    if (!Number.isInteger(body.candidateId) || body.candidateId <= 0) {
      throw new BadRequestError('candidateId must be a positive integer');
    }

    const existing = await this.automationRepository.findById(body.jobId);
    if (!existing) {
      throw new NotFoundError('Automation job not found');
    }

    if (existing.jobType !== AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS) {
      throw new BadRequestError(
        `Automation job ${body.jobId} is type ${existing.jobType}, expected EVALUATION_ANALYSIS`,
      );
    }

    if (
      existing.candidateId == null ||
      bigintToNumber(existing.candidateId) !== body.candidateId
    ) {
      throw new BadRequestError(
        `candidateId ${body.candidateId} does not match automation job ${body.jobId}`,
      );
    }

    if (AUTOMATION_TERMINAL_STATUSES.has(existing.status)) {
      this.fastify.log.info(
        { jobId: body.jobId, status: existing.status },
        'Idempotent evaluation callback — job already terminal',
      );
      return {
        data: mapAutomationJobToDto(existing),
        alreadyProcessed: true,
      };
    }

    if (body.status === AUTOMATION_JOB_STATUSES.COMPLETED) {
      const data = await this.applyEvaluationAnalysisCompletedCallback(
        body,
        existing.id,
      );

      await this.writeAutomationAudit({
        job: data,
        description: `Evaluation AI analysis completed for candidate ${body.candidateId}`,
        metadata: {
          jobId: body.jobId,
          candidateId: body.candidateId,
          status: 'COMPLETED',
          source: 'n8n-internal-callback',
        },
        ctx,
      });

      return { data, alreadyProcessed: false };
    }

    const now = new Date();
    const isTerminal =
      body.status === AUTOMATION_JOB_STATUSES.FAILED ||
      body.status === AUTOMATION_JOB_STATUSES.CANCELLED;
    const attempts =
      body.status === AUTOMATION_JOB_STATUSES.RETRYING ||
      body.status === AUTOMATION_JOB_STATUSES.FAILED
        ? existing.attempts + 1
        : existing.attempts;

    const updated = await this.automationRepository.update(body.jobId, {
      status: body.status,
      n8nExecutionId: body.n8nExecutionId ?? existing.n8nExecutionId,
      errorCode: body.errorCode ?? (isTerminal ? 'N8N_CALLBACK_FAILED' : null),
      errorMessage: body.errorMessage ?? null,
      attempts,
      startedAt:
        existing.startedAt ??
        (body.status === AUTOMATION_JOB_STATUSES.PROCESSING
          ? now
          : existing.startedAt),
      completedAt: isTerminal ? now : null,
      outputReference:
        body.result && Object.keys(body.result).length > 0
          ? (body.result as Prisma.InputJsonValue)
          : undefined,
    });

    const data = mapAutomationJobToDto(updated);

    if (isTerminal) {
      await this.writeAutomationAudit({
        job: data,
        description: `Evaluation AI analysis ${body.status.toLowerCase()} for candidate ${body.candidateId}`,
        metadata: {
          jobId: body.jobId,
          candidateId: body.candidateId,
          status: body.status,
          errorCode: data.errorCode,
          source: 'n8n-internal-callback',
        },
        ctx,
      });
    }

    return { data, alreadyProcessed: false };
  }

  /**
   * Secure internal BGV AI Analysis callback (n8n → Fastify).
   * Payload uses `result`. Idempotent by numeric jobId.
   */
  async applyBgvAnalysisInternalCallback(
    body: BgvAnalysisCallbackBody,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<BgvAnalysisCallbackResult> {
    if (!Number.isInteger(body.jobId) || body.jobId <= 0) {
      throw new BadRequestError('jobId must be a positive integer');
    }
    if (!Number.isInteger(body.candidateId) || body.candidateId <= 0) {
      throw new BadRequestError('candidateId must be a positive integer');
    }

    const existing = await this.automationRepository.findById(body.jobId);
    if (!existing) {
      throw new NotFoundError('Automation job not found');
    }

    if (existing.jobType !== AUTOMATION_JOB_TYPES.BGV_ANALYSIS) {
      throw new BadRequestError(
        `Automation job ${body.jobId} is type ${existing.jobType}, expected BGV_ANALYSIS`,
      );
    }

    if (
      existing.candidateId == null ||
      bigintToNumber(existing.candidateId) !== body.candidateId
    ) {
      throw new BadRequestError(
        `candidateId ${body.candidateId} does not match automation job ${body.jobId}`,
      );
    }

    if (AUTOMATION_TERMINAL_STATUSES.has(existing.status)) {
      this.fastify.log.info(
        { jobId: body.jobId, status: existing.status },
        'Idempotent BGV callback — job already terminal',
      );
      return {
        data: mapAutomationJobToDto(existing),
        alreadyProcessed: true,
      };
    }

    if (body.status === AUTOMATION_JOB_STATUSES.COMPLETED) {
      const data = await this.applyBgvAnalysisCompletedCallback(body, existing.id);

      await this.writeAutomationAudit({
        job: data,
        description: `BGV AI analysis completed for candidate ${body.candidateId}`,
        metadata: {
          jobId: body.jobId,
          candidateId: body.candidateId,
          status: 'COMPLETED',
          source: 'n8n-internal-callback',
        },
        ctx,
      });

      return { data, alreadyProcessed: false };
    }

    const now = new Date();
    const isTerminal =
      body.status === AUTOMATION_JOB_STATUSES.FAILED ||
      body.status === AUTOMATION_JOB_STATUSES.CANCELLED;
    const attempts =
      body.status === AUTOMATION_JOB_STATUSES.RETRYING ||
      body.status === AUTOMATION_JOB_STATUSES.FAILED
        ? existing.attempts + 1
        : existing.attempts;

    const updated = await this.automationRepository.update(body.jobId, {
      status: body.status,
      n8nExecutionId: body.n8nExecutionId ?? existing.n8nExecutionId,
      errorCode: body.errorCode ?? (isTerminal ? 'N8N_CALLBACK_FAILED' : null),
      errorMessage: body.errorMessage ?? null,
      attempts,
      startedAt:
        existing.startedAt ??
        (body.status === AUTOMATION_JOB_STATUSES.PROCESSING
          ? now
          : existing.startedAt),
      completedAt: isTerminal ? now : null,
      outputReference:
        body.result && Object.keys(body.result).length > 0
          ? (body.result as Prisma.InputJsonValue)
          : undefined,
    });

    const data = mapAutomationJobToDto(updated);

    if (isTerminal) {
      await this.writeAutomationAudit({
        job: data,
        description: `BGV AI analysis ${body.status.toLowerCase()} for candidate ${body.candidateId}`,
        metadata: {
          jobId: body.jobId,
          candidateId: body.candidateId,
          status: body.status,
          errorCode: data.errorCode,
          source: 'n8n-internal-callback',
        },
        ctx,
      });
    }

    return { data, alreadyProcessed: false };
  }

  /**
   * Legacy/generic n8n callback — idempotent by numeric jobId.
   * RESUME_SCREENING COMPLETED validates AI output and persists candidate/skills.
   */
  async applyCallback(body: AutomationCallbackBody): Promise<AutomationJobDto> {
    const existing = await this.automationRepository.findById(body.jobId);
    if (!existing) {
      throw new NotFoundError('Automation job not found');
    }

    if (existing.jobType !== body.jobType) {
      throw new BadRequestError(
        `Callback jobType ${body.jobType} does not match job ${body.jobId} type ${existing.jobType}`,
      );
    }

    if (AUTOMATION_TERMINAL_STATUSES.has(existing.status)) {
      this.fastify.log.info(
        { jobId: body.jobId, status: existing.status },
        'Ignoring duplicate automation callback for terminal job',
      );
      return mapAutomationJobToDto(existing);
    }

    if (
      body.status === AUTOMATION_JOB_STATUSES.COMPLETED &&
      body.jobType === AUTOMATION_JOB_TYPES.RESUME_SCREENING
    ) {
      return this.applyResumeScreeningCompletedCallback(body, existing.id);
    }

    if (
      body.status === AUTOMATION_JOB_STATUSES.COMPLETED &&
      body.jobType === AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS
    ) {
      const data = await this.applyEvaluationAnalysisCompletedCallback(
        {
          jobId: body.jobId,
          candidateId: body.candidateId ?? bigintToNumber(existing.candidateId!),
          status: body.status,
          result: body.output ?? {},
          n8nExecutionId: body.n8nExecutionId,
        },
        existing.id,
      );
      return data;
    }

    if (
      body.status === AUTOMATION_JOB_STATUSES.COMPLETED &&
      body.jobType === AUTOMATION_JOB_TYPES.BGV_ANALYSIS
    ) {
      return this.applyBgvAnalysisCompletedCallback(
        {
          jobId: body.jobId,
          candidateId: body.candidateId ?? bigintToNumber(existing.candidateId!),
          status: body.status,
          result: body.output ?? {},
          n8nExecutionId: body.n8nExecutionId,
        },
        existing.id,
      );
    }

    const now = new Date();
    const isTerminal =
      body.status === AUTOMATION_JOB_STATUSES.FAILED ||
      body.status === AUTOMATION_JOB_STATUSES.CANCELLED;

    const attempts =
      body.status === AUTOMATION_JOB_STATUSES.RETRYING ||
      body.status === AUTOMATION_JOB_STATUSES.FAILED
        ? existing.attempts + 1
        : existing.attempts;

    const patch: UpdateAutomationJobInput = {
      status: body.status,
      n8nExecutionId: body.n8nExecutionId ?? existing.n8nExecutionId,
      workflowName: body.workflowName ?? existing.workflowName,
      workflowVersion: body.workflowVersion ?? existing.workflowVersion,
      errorCode: body.errorCode ?? null,
      errorMessage: body.errorMessage ?? null,
      attempts,
      startedAt:
        existing.startedAt ??
        (body.status === AUTOMATION_JOB_STATUSES.PROCESSING ? now : existing.startedAt),
      completedAt: isTerminal ? now : null,
    };

    if (body.output != null) {
      patch.outputReference = body.output as Prisma.InputJsonValue;
    }

    const updated = await this.automationRepository.update(body.jobId, patch);
    return mapAutomationJobToDto(updated);
  }

  verifyCallbackSecret(providedSecret: string | undefined): boolean {
    const expected = this.fastify.config.automation.callbackSecret;
    if (!expected || !providedSecret) {
      return false;
    }
    return timingSafeEqualString(providedSecret, expected);
  }

  isCallbackSecretConfigured(): boolean {
    return Boolean(this.fastify.config.automation.callbackSecret);
  }

  private async applyResumeScreeningCompletedCallback(
    body: AutomationCallbackBody,
    jobIdBigInt: bigint,
  ): Promise<AutomationJobDto> {
    const jobId = bigintToNumber(jobIdBigInt);
    const parsed = resumeScreeningOutputSchema.safeParse(body.output ?? {});
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .slice(0, 5)
        .join('; ');
      await this.automationRepository.update(jobId, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'AI_OUTPUT_VALIDATION_FAILED',
        errorMessage: message || 'Invalid AI screening output',
        n8nExecutionId: body.n8nExecutionId,
        completedAt: new Date(),
        outputReference: (body.output ?? null) as Prisma.InputJsonValue | null,
      });
      throw new BadRequestError(
        `AI screening output failed validation: ${message || 'invalid payload'}`,
      );
    }

    const job = await this.automationRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Automation job not found');
    }

    const organizationId = await this.resolveOrganizationIdForResumeJob(job);

    try {
      const { CandidateService } = await import(
        '../candidates/candidate.service.js'
      );
      const candidateService = new CandidateService(this.fastify);
      await candidateService.applyResumeScreeningFromAutomation({
        organizationId,
        candidateId:
          job.candidateId != null ? bigintToNumber(job.candidateId) : null,
        documentId:
          job.documentId != null ? bigintToNumber(job.documentId) : undefined,
        createdById: bigintToNumber(job.requestedById),
        automationJobId: jobId,
        output: parsed.data,
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to apply AI screening';
      await this.automationRepository.update(jobId, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'AI_RESULT_PERSIST_FAILED',
        errorMessage: message,
        n8nExecutionId: body.n8nExecutionId ?? job.n8nExecutionId,
        completedAt: new Date(),
      });
      throw new BadRequestError(message);
    }

    const completed = await this.automationRepository.findById(jobId);
    if (!completed) {
      throw new NotFoundError('Automation job not found');
    }
    return mapAutomationJobToDto(completed);
  }

  private async dispatchResumeScreening(
    job: AutomationJobDto,
    input: StartAutomationWorkflowInput,
  ): Promise<void> {
    const n8nClient = await this.getN8nClient();
    if (!n8nClient.isResumeConfigured()) {
      this.fastify.log.warn(
        { jobId: job.id },
        'n8n resume workflow not configured — job left PENDING',
      );
      return;
    }

    await this.automationRepository.update(job.id, {
      status: AUTOMATION_JOB_STATUSES.PROCESSING,
      startedAt: new Date(),
      attempts: job.attempts + 1,
    });

    try {
      const result = await n8nClient.triggerResumeScreening(
        this.buildN8nTriggerInput(
          job,
          input,
          AUTOMATION_JOB_TYPES.RESUME_SCREENING,
        ),
      );
      await this.automationRepository.update(job.id, {
        n8nExecutionId: result.n8nExecutionId,
      });
    } catch (error) {
      const message =
        error instanceof N8nClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'n8n trigger failed';
      await this.automationRepository.update(job.id, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'N8N_TRIGGER_FAILED',
        errorMessage: message,
        completedAt: new Date(),
      });
      this.fastify.log.error(
        { jobId: job.id, errorCode: 'N8N_TRIGGER_FAILED' },
        'Failed to trigger n8n resume screening',
      );
    }
  }

  private async dispatchEvaluationAnalysis(
    job: AutomationJobDto,
    input: StartAutomationWorkflowInput,
  ): Promise<void> {
    const n8nClient = await this.getN8nClient();
    if (!n8nClient.isEvaluationConfigured()) {
      this.fastify.log.warn(
        { jobId: job.id },
        'n8n evaluation workflow not configured — job left PENDING',
      );
      return;
    }

    await this.automationRepository.update(job.id, {
      status: AUTOMATION_JOB_STATUSES.PROCESSING,
      startedAt: new Date(),
      attempts: job.attempts + 1,
    });

    try {
      const result = await n8nClient.triggerEvaluationAnalysis(
        this.buildN8nTriggerInput(
          job,
          input,
          AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
        ),
      );
      await this.automationRepository.update(job.id, {
        n8nExecutionId: result.n8nExecutionId,
      });
    } catch (error) {
      const message =
        error instanceof N8nClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'n8n trigger failed';
      await this.automationRepository.update(job.id, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'N8N_TRIGGER_FAILED',
        errorMessage: message,
        completedAt: new Date(),
      });
      this.fastify.log.error(
        { jobId: job.id, errorCode: 'N8N_TRIGGER_FAILED' },
        'Failed to trigger n8n evaluation analysis',
      );
    }
  }

  private async dispatchBgvAnalysis(
    job: AutomationJobDto,
    input: StartAutomationWorkflowInput,
  ): Promise<void> {
    const n8nClient = await this.getN8nClient();
    if (!n8nClient.isBgvConfigured()) {
      this.fastify.log.warn(
        { jobId: job.id },
        'n8n BGV workflow not configured — job left PENDING',
      );
      return;
    }

    await this.automationRepository.update(job.id, {
      status: AUTOMATION_JOB_STATUSES.PROCESSING,
      startedAt: new Date(),
      attempts: job.attempts + 1,
    });

    try {
      const result = await n8nClient.triggerBgvAnalysis(
        this.buildN8nTriggerInput(job, input, AUTOMATION_JOB_TYPES.BGV_ANALYSIS),
      );
      await this.automationRepository.update(job.id, {
        n8nExecutionId: result.n8nExecutionId,
      });
    } catch (error) {
      const message =
        error instanceof N8nClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'n8n trigger failed';
      await this.automationRepository.update(job.id, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'N8N_TRIGGER_FAILED',
        errorMessage: message,
        completedAt: new Date(),
      });
      this.fastify.log.error(
        { jobId: job.id, errorCode: 'N8N_TRIGGER_FAILED' },
        'Failed to trigger n8n BGV analysis',
      );
    }
  }

  private async applyEvaluationAnalysisCompletedCallback(
    body: EvaluationAnalysisCallbackBody,
    jobIdBigInt: bigint,
  ): Promise<AutomationJobDto> {
    const jobId = bigintToNumber(jobIdBigInt);
    const parsed = evaluationAnalysisOutputSchema.safeParse(body.result ?? {});
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .slice(0, 5)
        .join('; ');
      await this.automationRepository.update(jobId, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'AI_OUTPUT_VALIDATION_FAILED',
        errorMessage: message || 'Invalid AI evaluation output',
        n8nExecutionId: body.n8nExecutionId,
        completedAt: new Date(),
        outputReference: (body.result ?? null) as Prisma.InputJsonValue | null,
      });
      throw new BadRequestError(
        `AI evaluation output failed validation: ${message || 'invalid payload'}`,
      );
    }

    const job = await this.automationRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Automation job not found');
    }
    if (!job.candidateId) {
      throw new BadRequestError('Automation job is missing candidateId');
    }

    const candidateId = bigintToNumber(job.candidateId);
    const candidate = await this.fastify.prisma.candidate.findFirst({
      where: { id: job.candidateId, deletedAt: null },
      select: { organizationId: true },
    });
    if (!candidate) {
      throw new NotFoundError('Candidate not found');
    }

    const inputRef =
      job.inputReference && typeof job.inputReference === 'object'
        ? (job.inputReference as Record<string, unknown>)
        : {};
    const evaluationId = Number(inputRef.evaluationId);
    if (!Number.isInteger(evaluationId) || evaluationId <= 0) {
      throw new BadRequestError(
        'Automation job is missing numeric evaluationId in inputReference',
      );
    }

    try {
      const { EvaluationService } = await import(
        '../evaluations/evaluation.service.js'
      );
      const evaluationService = new EvaluationService(this.fastify);
      await evaluationService.applyEvaluationAnalysisFromAutomation({
        organizationId: bigintToNumber(candidate.organizationId),
        candidateId,
        evaluationId,
        automationJobId: jobId,
        output: parsed.data,
        requestedBy: bigintToNumber(job.requestedById),
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to apply AI evaluation analysis';
      await this.automationRepository.update(jobId, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'AI_RESULT_PERSIST_FAILED',
        errorMessage: message,
        n8nExecutionId: body.n8nExecutionId ?? job.n8nExecutionId,
        completedAt: new Date(),
      });
      throw new BadRequestError(message);
    }

    const completed = await this.automationRepository.findById(jobId);
    if (!completed) {
      throw new NotFoundError('Automation job not found');
    }
    return mapAutomationJobToDto(completed);
  }

  private async applyBgvAnalysisCompletedCallback(
    body: BgvAnalysisCallbackBody,
    jobIdBigInt: bigint,
  ): Promise<AutomationJobDto> {
    const jobId = bigintToNumber(jobIdBigInt);
    const parsed = bgvAnalysisOutputSchema.safeParse(body.result ?? {});
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .slice(0, 5)
        .join('; ');
      await this.automationRepository.update(jobId, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'AI_OUTPUT_VALIDATION_FAILED',
        errorMessage: message || 'Invalid AI BGV output',
        n8nExecutionId: body.n8nExecutionId,
        completedAt: new Date(),
        outputReference: (body.result ?? null) as Prisma.InputJsonValue | null,
      });
      throw new BadRequestError(
        `AI BGV output failed validation: ${message || 'invalid payload'}`,
      );
    }

    const job = await this.automationRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Automation job not found');
    }
    if (!job.candidateId) {
      throw new BadRequestError('Automation job is missing candidateId');
    }

    const candidateId = bigintToNumber(job.candidateId);
    const candidate = await this.fastify.prisma.candidate.findFirst({
      where: { id: job.candidateId, deletedAt: null },
      select: { organizationId: true },
    });
    if (!candidate) {
      throw new NotFoundError('Candidate not found');
    }

    const inputRef =
      job.inputReference && typeof job.inputReference === 'object'
        ? (job.inputReference as Record<string, unknown>)
        : {};
    const backgroundCheckId = Number(inputRef.backgroundCheckId);
    if (!Number.isInteger(backgroundCheckId) || backgroundCheckId <= 0) {
      throw new BadRequestError(
        'Automation job is missing numeric backgroundCheckId in inputReference',
      );
    }

    try {
      const { BackgroundCheckService } = await import(
        '../background-checks/background-check.service.js'
      );
      const backgroundCheckService = new BackgroundCheckService(this.fastify);
      await backgroundCheckService.applyBgvAnalysisFromAutomation({
        organizationId: bigintToNumber(candidate.organizationId),
        candidateId,
        backgroundCheckId,
        automationJobId: jobId,
        output: parsed.data,
        requestedBy: bigintToNumber(job.requestedById),
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to apply AI BGV analysis';
      await this.automationRepository.update(jobId, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'AI_RESULT_PERSIST_FAILED',
        errorMessage: message,
        n8nExecutionId: body.n8nExecutionId ?? job.n8nExecutionId,
        completedAt: new Date(),
      });
      throw new BadRequestError(message);
    }

    const completed = await this.automationRepository.findById(jobId);
    if (!completed) {
      throw new NotFoundError('Automation job not found');
    }
    return mapAutomationJobToDto(completed);
  }

  private async startWorkflow(
    jobType: (typeof AUTOMATION_JOB_TYPES)[keyof typeof AUTOMATION_JOB_TYPES],
    input: StartAutomationWorkflowInput,
  ): Promise<AutomationJobDto> {
    this.assertStartInput(input, {
      requireCandidate: jobType !== AUTOMATION_JOB_TYPES.RESUME_SCREENING,
    });

    const identity = await this.resolveWorkflowIdentity(jobType);

    const created = await this.createJob({
      candidateId: input.candidateId,
      documentId: input.documentId,
      jobType,
      requestedBy: input.requestedBy,
      workflowName: identity.workflowName,
      workflowVersion: input.workflowVersion ?? identity.workflowVersion,
      maxAttempts: input.maxAttempts,
      inputReference: {
        ...(input.inputReference ?? {}),
        candidateId: input.candidateId,
        documentId: input.documentId,
        hasDocumentUrl: true,
      },
    });

    const n8nClient = await this.getN8nClient();
    const configured =
      jobType === AUTOMATION_JOB_TYPES.RESUME_SCREENING
        ? n8nClient.isResumeConfigured()
        : jobType === AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS
          ? n8nClient.isEvaluationConfigured()
          : n8nClient.isBgvConfigured();

    if (!configured) {
      this.fastify.log.warn(
        { jobId: created.id, jobType },
        'n8n workflow not configured — automation job left PENDING',
      );
      return created;
    }

    await this.automationRepository.update(created.id, {
      status: AUTOMATION_JOB_STATUSES.PROCESSING,
      startedAt: new Date(),
      attempts: created.attempts + 1,
    });

    try {
      const triggerInput = this.buildN8nTriggerInput(
        created,
        input,
        jobType,
      );

      const result =
        jobType === AUTOMATION_JOB_TYPES.RESUME_SCREENING
          ? await n8nClient.triggerResumeScreening(triggerInput)
          : jobType === AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS
            ? await n8nClient.triggerEvaluationAnalysis(triggerInput)
            : await n8nClient.triggerBgvAnalysis(triggerInput);

      const updated = await this.automationRepository.update(created.id, {
        n8nExecutionId: result.n8nExecutionId,
      });
      return mapAutomationJobToDto(updated);
    } catch (error) {
      const message =
        error instanceof N8nClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'n8n trigger failed';

      const failed = await this.automationRepository.update(created.id, {
        status: AUTOMATION_JOB_STATUSES.FAILED,
        errorCode: 'N8N_TRIGGER_FAILED',
        errorMessage: message,
        completedAt: new Date(),
      });

      this.fastify.log.error(
        { jobId: created.id, jobType, errorCode: 'N8N_TRIGGER_FAILED' },
        'Failed to trigger n8n workflow',
      );

      return mapAutomationJobToDto(failed);
    }
  }

  private assertStartInput(
    input: StartAutomationWorkflowInput,
    options?: { requireCandidate?: boolean },
  ): void {
    const requireCandidate = options?.requireCandidate ?? false;
    if (requireCandidate) {
      if (
        input.candidateId == null ||
        !Number.isInteger(input.candidateId) ||
        input.candidateId <= 0
      ) {
        throw new BadRequestError('Invalid numeric id for candidateId');
      }
    } else if (
      input.candidateId != null &&
      (!Number.isInteger(input.candidateId) || input.candidateId <= 0)
    ) {
      throw new BadRequestError('Invalid numeric id for candidateId');
    }
    for (const [name, value] of [
      ['documentId', input.documentId],
      ['requestedBy', input.requestedBy],
    ] as const) {
      if (!Number.isInteger(value) || value <= 0) {
        throw new BadRequestError(`Invalid numeric id for ${name}`);
      }
    }
    if (!input.documentUrl?.trim()) {
      throw new BadRequestError('documentUrl is required');
    }
  }

  private async resolveOrganizationIdForResumeJob(
    job: NonNullable<Awaited<ReturnType<AutomationRepository['findById']>>>,
  ): Promise<number> {
    const ref = job.inputReference as Record<string, unknown> | null;
    const fromRef = ref?.organizationId;
    if (typeof fromRef === 'number' && Number.isInteger(fromRef) && fromRef > 0) {
      return fromRef;
    }

    if (job.documentId != null) {
      const document = await this.fastify.prisma.document.findFirst({
        where: { id: job.documentId, deletedAt: null },
        select: { organizationId: true },
      });
      if (document) {
        return bigintToNumber(document.organizationId);
      }
    }

    if (job.candidateId != null) {
      const candidate = await this.fastify.prisma.candidate.findFirst({
        where: { id: job.candidateId, deletedAt: null },
        select: { organizationId: true },
      });
      if (candidate) {
        return bigintToNumber(candidate.organizationId);
      }
    }

    throw new BadRequestError(
      'Cannot resolve organization for resume screening job',
    );
  }

  private async assertCandidateExists(candidateId: number): Promise<void> {
    const candidate = await this.fastify.prisma.candidate.findFirst({
      where: { id: BigInt(candidateId), deletedAt: null },
      select: { id: true },
    });
    if (!candidate) {
      throw new BadRequestError('Candidate not found');
    }
  }

  private async assertDocumentExists(documentId: number): Promise<void> {
    const document = await this.fastify.prisma.document.findFirst({
      where: { id: BigInt(documentId), deletedAt: null },
      select: { id: true },
    });
    if (!document) {
      throw new BadRequestError('Document not found');
    }
  }

  private async writeAutomationAudit(params: {
    job: AutomationJobDto;
    description: string;
    metadata: Prisma.InputJsonValue;
    ctx?: { ipAddress?: string | null; userAgent?: string | null };
  }): Promise<void> {
    const organizationId =
      params.job.candidateId != null
        ? await this.fastify.prisma.candidate
            .findFirst({
              where: { id: BigInt(params.job.candidateId), deletedAt: null },
              select: { organizationId: true },
            })
            .then((row) =>
              row ? bigintToNumber(row.organizationId) : null,
            )
        : null;

    await this.audit.write({
      organizationId,
      actorId: params.job.requestedBy,
      action: 'UPDATE',
      resourceType: 'AutomationJob',
      resourceId: params.job.id,
      description: params.description,
      metadata: params.metadata,
      ipAddress: params.ctx?.ipAddress,
      userAgent: params.ctx?.userAgent,
    });
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}
