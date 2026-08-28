import type { FastifyBaseLogger } from 'fastify';
import type { N8nConfig } from '../../config/index.js';
import { ExternalServiceError } from '../../utils/index.js';
import { createModuleLogger } from '../../utils/logger.js';
import {
  AUTOMATION_JOB_TYPES,
  N8N_WEBHOOK_SECRET_HEADER,
} from './automation.constants.js';
import type { N8nTriggerResult, N8nWorkflowTriggerInput } from './automation.types.js';

export class N8nClientError extends ExternalServiceError {
  public readonly statusCodeHttp: number | null;
  public readonly timedOut: boolean;

  constructor(
    message: string,
    options?: { statusCodeHttp?: number | null; timedOut?: boolean },
  ) {
    super(message);
    this.name = 'N8nClientError';
    this.statusCodeHttp = options?.statusCodeHttp ?? null;
    this.timedOut = options?.timedOut ?? false;
  }
}

/**
 * Reusable outbound client for n8n webhook workflows.
 * Responsible only for HTTP communication — no domain persistence.
 *
 * Uses native `fetch` (same as resume/evaluation/BGV extraction clients).
 */
export class N8nClient {
  private readonly logger: FastifyBaseLogger;

  constructor(
    private readonly config: N8nConfig,
    log?: FastifyBaseLogger,
  ) {
    this.logger = log ?? createModuleLogger('n8n-client');
  }

  /** True when base URL + webhook secret are present (paths checked per workflow). */
  isConfigured(): boolean {
    return Boolean(this.config.baseUrl && this.config.webhookSecret);
  }

  isResumeConfigured(): boolean {
    return this.isConfigured() && Boolean(this.config.resumeWorkflowPath);
  }

  isEvaluationConfigured(): boolean {
    return this.isConfigured() && Boolean(this.config.evaluationWorkflowPath);
  }

  isBgvConfigured(): boolean {
    return this.isConfigured() && Boolean(this.config.bgvWorkflowPath);
  }

  async triggerResumeScreening(
    input: N8nWorkflowTriggerInput,
  ): Promise<N8nTriggerResult> {
    return this.trigger(
      AUTOMATION_JOB_TYPES.RESUME_SCREENING,
      this.requirePath(this.config.resumeWorkflowPath, 'resumeWorkflowPath'),
      input,
    );
  }

  async triggerEvaluationAnalysis(
    input: N8nWorkflowTriggerInput,
  ): Promise<N8nTriggerResult> {
    return this.trigger(
      AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
      this.requirePath(
        this.config.evaluationWorkflowPath,
        'evaluationWorkflowPath',
      ),
      input,
    );
  }

  async triggerBgvAnalysis(
    input: N8nWorkflowTriggerInput,
  ): Promise<N8nTriggerResult> {
    return this.trigger(
      AUTOMATION_JOB_TYPES.BGV_ANALYSIS,
      this.requirePath(this.config.bgvWorkflowPath, 'bgvWorkflowPath'),
      input,
    );
  }

  private requirePath(path: string | null, settingName: string): string {
    if (!this.config.baseUrl) {
      throw new N8nClientError('n8n is not configured (base URL missing in Platform Settings)');
    }
    if (!this.config.webhookSecret) {
      throw new N8nClientError(
        'n8n is not configured (webhook secret missing in Platform Settings)',
      );
    }
    if (!path) {
      throw new N8nClientError(`n8n workflow path is not configured (${settingName})`);
    }
    return path;
  }

  private async trigger(
    workflow: string,
    path: string,
    input: N8nWorkflowTriggerInput,
  ): Promise<N8nTriggerResult> {
    this.assertNumericIds(input);

    const url = this.joinUrl(this.config.baseUrl!, path);
    const body: Record<string, unknown> = {
      jobId: input.jobId,
      documentId: input.documentId,
      requestedBy: input.requestedBy,
      documentUrl: input.documentUrl,
      workflowName: input.workflowName,
      workflowVersion: input.workflowVersion,
    };
    if (input.fileName?.trim()) {
      body.fileName = input.fileName;
    }
    if (input.mimeType?.trim()) {
      body.mimeType = input.mimeType;
    }
    if (input.candidateId != null) {
      body.candidateId = input.candidateId;
    }
    if (input.previousBestalScore != null) {
      body.previousBestalScore = input.previousBestalScore;
    }

    this.logger.info(
      {
        workflow,
        jobId: input.jobId,
        candidateId: input.candidateId,
        documentId: input.documentId,
        requestedBy: input.requestedBy,
        // Never log documentUrl (signed), webhook secret, or full URL query strings.
        targetHost: this.safeHost(url),
      },
      'Triggering n8n workflow',
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.config.requestTimeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Shared secret for n8n webhook auth (Header Auth / custom header in n8n).
          [N8N_WEBHOOK_SECRET_HEADER]: this.config.webhookSecret!,
          Authorization: `Bearer ${this.config.webhookSecret!}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      const timedOut =
        error instanceof Error &&
        (error.name === 'AbortError' || error.name === 'TimeoutError');
      this.logger.error(
        {
          workflow,
          jobId: input.jobId,
          timedOut,
          requestTimeoutMs: this.config.requestTimeoutMs,
          targetHost: this.safeHost(url),
          errorName: error instanceof Error ? error.name : 'UnknownError',
        },
        'n8n trigger request failed',
      );
      throw new N8nClientError(
        timedOut
          ? `n8n webhook did not acknowledge the trigger within ${this.config.requestTimeoutMs}ms — workflow should respond immediately after validation (Respond Trigger Accepted)`
          : 'n8n workflow trigger request failed',
        { timedOut },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // Read body for status context only — do not log raw body (may echo secrets).
      await response.text().catch(() => '');
      this.logger.error(
        {
          workflow,
          jobId: input.jobId,
          status: response.status,
        },
        'n8n workflow trigger returned error status',
      );
      throw new N8nClientError(
        `n8n workflow trigger failed with HTTP ${response.status}`,
        { statusCodeHttp: response.status },
      );
    }

    const executionId = await this.extractExecutionId(response);

    this.logger.info(
      {
        workflow,
        jobId: input.jobId,
        hasExecutionId: Boolean(executionId),
      },
      'n8n workflow trigger accepted',
    );

    return {
      accepted: true,
      n8nExecutionId: executionId,
      httpStatus: response.status,
    };
  }

  private assertNumericIds(input: N8nWorkflowTriggerInput): void {
    const fields: Array<[string, number]> = [
      ['jobId', input.jobId],
      ['documentId', input.documentId],
      ['requestedBy', input.requestedBy],
    ];
    if (input.candidateId != null) {
      fields.splice(1, 0, ['candidateId', input.candidateId]);
    }
    for (const [name, value] of fields) {
      if (!Number.isInteger(value) || value <= 0) {
        throw new N8nClientError(`Invalid numeric id for ${name}`);
      }
    }
    if (!input.documentUrl?.trim()) {
      throw new N8nClientError('documentUrl is required');
    }
  }

  private joinUrl(baseUrl: string, path: string): string {
    const base = baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  private safeHost(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return 'invalid-url';
    }
  }

  private async extractExecutionId(response: Response): Promise<string | null> {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    try {
      const json = (await response.json()) as Record<string, unknown>;
      const raw =
        json.executionId ??
        json.n8nExecutionId ??
        json.id ??
        (json.data && typeof json.data === 'object'
          ? (json.data as Record<string, unknown>).executionId
          : null);
      if (raw == null) return null;
      const text = String(raw).trim();
      return text || null;
    } catch {
      return null;
    }
  }
}
