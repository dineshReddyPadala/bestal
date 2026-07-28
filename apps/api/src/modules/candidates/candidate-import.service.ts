import { createHash } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import {
  IMPORT_SKILL_COMMUNITIES,
  slugifySkillCommunity,
} from '@bestal/shared-utils';
import type {
  BackgroundCheckStatus,
  CandidateImportRowAction,
  Prisma,
} from '@prisma/client';
import { BadRequestError, NotFoundError, bigintToNumber } from '../../utils/index.js';
import type { AuthenticatedUser } from '../../types/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  deriveImportedProfileStatus,
  formatImportRowErrorMessage,
} from './candidate-import-status.js';
import {
  buildCandidateImportErrorReport,
  buildCandidateImportTemplate,
} from './candidate-import.template.js';
import type {
  CandidateImportBatchStatusDto,
  CandidateImportErrorDto,
  CandidateImportHistoryItemDto,
  CandidateImportPreviewResult,
  CandidateImportPreviewRow,
  ImportValidationError,
  NormalizedCandidateImport,
} from './candidate-import.types.js';
import {
  IMPORT_LIMITS,
  parseAndValidateCandidateWorkbook,
} from './candidate-import.validator.js';

const STRUCTURE_ERROR_CODES = [
  'MISSING_SHEET',
  'INVALID_HEADERS',
  'INVALID_HEADER',
  'EMPTY_CANDIDATE_SHEET',
  'TOO_MANY_CANDIDATES',
  'TOO_MANY_RELATED_ROWS',
  'CORRUPT_WORKBOOK',
] as const;

function requireOrganization(authUser: AuthenticatedUser): number {
  if (!authUser.organizationId) {
    throw new BadRequestError('Organization context is required');
  }
  return authUser.organizationId;
}

function checksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function mapBgvStatus(status: string): BackgroundCheckStatus {
  switch (status) {
    case 'NOT_STARTED':
      return 'NOT_STARTED';
    case 'CONSENT_PENDING':
      return 'CONSENT_PENDING';
    case 'INITIATED':
      return 'INITIATED';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'CLEAR':
    case 'COMPLETED_CLEAR':
      return 'COMPLETED_CLEAR';
    case 'COMPLETED_WITH_CONCERN':
      return 'COMPLETED_WITH_CONCERN';
    case 'FAILED':
      return 'FAILED';
    case 'EXPIRED':
      return 'EXPIRED';
    default:
      return 'NOT_STARTED';
  }
}

function hasAiScreeningFields(candidate: NormalizedCandidateImport): boolean {
  return Boolean(
    candidate.aiSummary?.trim() ||
      candidate.strengths?.trim() ||
      candidate.weaknesses?.trim() ||
      candidate.evaluations.some((e) => e.aiEvaluationSummary?.trim()) ||
      candidate.scores.some((s) => s.scoreSource === 'ATS_AI' || s.scoreSource === 'BESTAL_AI'),
  );
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let next = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await worker(items[index]!);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

type StagedImportRow = {
  rowNumber: number;
  sourceCandidateId: string;
  email: string | null;
  action: CandidateImportRowAction;
  errorMessage: string | null;
  payload: NormalizedCandidateImport;
  existingCandidateId: number | null;
};

/** Shared across service instances in this process (routes + boot reclaim). */
const runningBatches = new Set<number>();

export class CandidateImportService {
  constructor(private readonly fastify: FastifyInstance) {}

  async getTemplateBuffer(): Promise<Buffer> {
    await this.ensureSkillCommunities();
    return buildCandidateImportTemplate();
  }

  /**
   * Fire-and-forget upload: persist file, return immediately, validate+process in background.
   */
  async enqueue(
    authUser: AuthenticatedUser,
    fileName: string,
    fileBuffer: Buffer,
  ): Promise<CandidateImportBatchStatusDto> {
    const organizationId = requireOrganization(authUser);
    this.assertWorkbookFile(fileName, fileBuffer);

    const expiresAt = new Date(
      Date.now() + IMPORT_LIMITS.previewExpiryHours * 60 * 60 * 1000,
    );

    const batch = await this.fastify.prisma.candidateImportBatch.create({
      data: {
        organizationId: BigInt(organizationId),
        createdById: BigInt(authUser.id),
        fileName,
        fileChecksum: checksum(fileBuffer),
        fileContent: new Uint8Array(fileBuffer),
        status: 'QUEUED',
        expiresAt,
        confirmedAt: new Date(),
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const batchId = bigintToNumber(batch.id);
    void this.runQueuedBatch(batchId).catch((error) => {
      this.fastify.log.error({ err: error, batchId }, 'Queued candidate import crashed');
    });

    return this.mapBatch(batch, true);
  }

  async listHistory(
    authUser: AuthenticatedUser,
    query: { page?: number; limit?: number },
  ): Promise<{
    data: CandidateImportHistoryItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit && query.limit > 0 ? query.limit : 20, 100);
    const skip = (page - 1) * limit;

    const where = { organizationId: BigInt(organizationId) };
    const [total, batches] = await Promise.all([
      this.fastify.prisma.candidateImportBatch.count({ where }),
      this.fastify.prisma.candidateImportBatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { errors: true } },
        },
      }),
    ]);

    const sourceFileIds = await this.findBatchIdsWithSourceFile(batches.map((b) => b.id));

    return {
      data: batches.map((batch) =>
        this.mapHistoryItem(batch, sourceFileIds.has(bigintToNumber(batch.id))),
      ),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getBatch(
    authUser: AuthenticatedUser,
    batchId: number,
  ): Promise<CandidateImportBatchStatusDto> {
    const organizationId = requireOrganization(authUser);
    const batch = await this.fastify.prisma.candidateImportBatch.findFirst({
      where: {
        id: BigInt(batchId),
        organizationId: BigInt(organizationId),
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { errors: true } },
      },
    });
    if (!batch) {
      throw new NotFoundError('Import batch not found');
    }
    const sourceFileIds = await this.findBatchIdsWithSourceFile([batch.id]);
    return this.mapBatch(batch, sourceFileIds.has(batchId));
  }

  async getSourceFile(
    authUser: AuthenticatedUser,
    batchId: number,
  ): Promise<{ fileName: string; buffer: Buffer }> {
    const organizationId = requireOrganization(authUser);
    const batch = await this.fastify.prisma.candidateImportBatch.findFirst({
      where: {
        id: BigInt(batchId),
        organizationId: BigInt(organizationId),
      },
      select: {
        id: true,
        fileName: true,
        fileContent: true,
      },
    });
    if (!batch) {
      throw new NotFoundError('Import batch not found');
    }
    if (!batch.fileContent) {
      throw new NotFoundError('Original uploaded workbook is no longer available for this import');
    }
    return {
      fileName: batch.fileName,
      buffer: Buffer.from(batch.fileContent),
    };
  }

  async listErrors(
    authUser: AuthenticatedUser,
    batchId: number,
    query: { page?: number; limit?: number },
  ): Promise<{
    data: CandidateImportErrorDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const batch = await this.fastify.prisma.candidateImportBatch.findFirst({
      where: {
        id: BigInt(batchId),
        organizationId: BigInt(organizationId),
      },
      select: { id: true },
    });
    if (!batch) {
      throw new NotFoundError('Import batch not found');
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit && query.limit > 0 ? query.limit : 50, 200);
    const skip = (page - 1) * limit;

    const where = { batchId: batch.id };
    const [total, errors] = await Promise.all([
      this.fastify.prisma.candidateImportError.count({ where }),
      this.fastify.prisma.candidateImportError.findMany({
        where,
        orderBy: [{ sheetName: 'asc' }, { rowNumber: 'asc' }, { id: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: errors.map((error) => ({
        id: bigintToNumber(error.id),
        sheetName: error.sheetName,
        rowNumber: error.rowNumber,
        sourceCandidateId: error.sourceCandidateId,
        columnName: error.columnName,
        suppliedValue: error.suppliedValue,
        errorCode: error.errorCode,
        message: error.message,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async preview(
    authUser: AuthenticatedUser,
    fileName: string,
    fileBuffer: Buffer,
  ): Promise<CandidateImportPreviewResult> {
    const organizationId = requireOrganization(authUser);
    this.assertWorkbookFile(fileName, fileBuffer);

    const staged = await this.buildStagedRows(organizationId, fileBuffer);
    const expiresAt = new Date(
      Date.now() + IMPORT_LIMITS.previewExpiryHours * 60 * 60 * 1000,
    );
    const hasStructureError = staged.rowErrors.some((e) =>
      STRUCTURE_ERROR_CODES.includes(e.errorCode as (typeof STRUCTURE_ERROR_CODES)[number]),
    );
    const confirmable =
      !hasStructureError && staged.stagedRows.some((row) => row.action !== 'FAIL');

    const batch = await this.fastify.prisma.candidateImportBatch.create({
      data: {
        organizationId: BigInt(organizationId),
        createdById: BigInt(authUser.id),
        fileName,
        fileChecksum: checksum(fileBuffer),
        fileContent: new Uint8Array(fileBuffer),
        status: 'PREVIEWED',
        createdCount: staged.created,
        updatedCount: staged.updated,
        skippedCount: staged.skipped,
        failedCount: staged.failed,
        totalCount: staged.stagedRows.length,
        errorSummary:
          staged.rowErrors.length > 0
            ? `${staged.rowErrors.length} validation issue(s) found`
            : null,
        previewPayload: {
          sheetCounts: staged.sheetCounts,
          errors: staged.rowErrors,
        } as Prisma.InputJsonValue,
        expiresAt,
        rows: {
          create: staged.stagedRows.map((row) => ({
            rowNumber: row.rowNumber,
            sourceCandidateId: row.sourceCandidateId,
            email: row.email,
            candidateId:
              row.existingCandidateId != null ? BigInt(row.existingCandidateId) : null,
            action: row.action,
            errorMessage: row.errorMessage,
            normalizedPayload: row.payload as unknown as Prisma.InputJsonValue,
            processedAt: row.action === 'FAIL' ? new Date() : null,
          })),
        },
        errors: {
          create: staged.rowErrors.map((error) => this.toErrorCreate(error)),
        },
      },
    });

    return {
      batchId: bigintToNumber(batch.id),
      fileName,
      expiresAt: expiresAt.toISOString(),
      canConfirm: confirmable,
      sheetCounts: staged.sheetCounts,
      created: staged.created,
      updated: staged.updated,
      skipped: staged.skipped,
      failed: staged.failed,
      errors: staged.rowErrors.slice(0, 200),
      rows: staged.previewRows.slice(0, 200),
    };
  }

  async confirm(
    authUser: AuthenticatedUser,
    batchId: number,
  ): Promise<CandidateImportBatchStatusDto> {
    const organizationId = requireOrganization(authUser);
    const batch = await this.fastify.prisma.candidateImportBatch.findFirst({
      where: {
        id: BigInt(batchId),
        organizationId: BigInt(organizationId),
      },
      include: { errors: true },
    });
    if (!batch) {
      throw new NotFoundError('Import batch not found');
    }
    if (batch.expiresAt.getTime() < Date.now()) {
      await this.fastify.prisma.candidateImportBatch.update({
        where: { id: batch.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestError('Import preview has expired. Please upload again.');
    }
    if (
      batch.status === 'COMPLETED' ||
      batch.status === 'PROCESSING' ||
      batch.status === 'QUEUED' ||
      batch.status === 'VALIDATING'
    ) {
      return this.mapBatch(batch);
    }
    if (batch.status !== 'PREVIEWED') {
      throw new BadRequestError(`Import batch cannot be confirmed from status ${batch.status}`);
    }

    const hasStructureError = batch.errors.some((error) =>
      STRUCTURE_ERROR_CODES.includes(
        error.errorCode as (typeof STRUCTURE_ERROR_CODES)[number],
      ),
    );
    if (hasStructureError) {
      throw new BadRequestError('Workbook has structural validation errors and cannot be imported.');
    }

    const actionableCount = await this.fastify.prisma.candidateImportRow.count({
      where: {
        batchId: batch.id,
        action: { in: ['CREATE', 'UPDATE', 'SKIP'] },
        processedAt: null,
      },
    });
    if (actionableCount === 0) {
      throw new BadRequestError('No valid candidate rows available to import.');
    }

    await this.fastify.prisma.candidateImportBatch.update({
      where: { id: batch.id },
      data: {
        status: 'PROCESSING',
        confirmedAt: new Date(),
      },
    });

    void this.processBatch(bigintToNumber(batch.id)).catch((error) => {
      this.fastify.log.error({ err: error, batchId }, 'Candidate import batch failed');
    });

    const refreshed = await this.fastify.prisma.candidateImportBatch.findFirstOrThrow({
      where: { id: batch.id },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { errors: true } },
      },
    });
    const sourceFileIds = await this.findBatchIdsWithSourceFile([batch.id]);
    return this.mapBatch(refreshed, sourceFileIds.has(bigintToNumber(batch.id)));
  }

  async getErrorReport(
    authUser: AuthenticatedUser,
    batchId: number,
  ): Promise<{ fileName: string; buffer: Buffer }> {
    const organizationId = requireOrganization(authUser);
    const batch = await this.fastify.prisma.candidateImportBatch.findFirst({
      where: {
        id: BigInt(batchId),
        organizationId: BigInt(organizationId),
      },
      include: { errors: { orderBy: [{ sheetName: 'asc' }, { rowNumber: 'asc' }] } },
    });
    if (!batch) {
      throw new NotFoundError('Import batch not found');
    }
    const buffer = await buildCandidateImportErrorReport(batch.errors);
    return {
      fileName: `candidate-import-errors-${batchId}.xlsx`,
      buffer,
    };
  }

  /** Reclaim orphaned QUEUED/PROCESSING batches after API restart. */
  async reclaimOrphanedBatches(): Promise<void> {
    const stuck = await this.fastify.prisma.candidateImportBatch.findMany({
      where: {
        status: { in: ['QUEUED', 'VALIDATING', 'PROCESSING'] },
      },
      select: { id: true, status: true, fileContent: true },
      take: 50,
    });

    for (const batch of stuck) {
      const batchId = bigintToNumber(batch.id);
      if (runningBatches.has(batchId)) continue;

      if (batch.status === 'QUEUED' || batch.status === 'VALIDATING') {
        if (!batch.fileContent) {
          await this.fastify.prisma.candidateImportBatch.update({
            where: { id: batch.id },
            data: {
              status: 'FAILED',
              errorSummary: 'Import interrupted before validation completed. Please upload again.',
              completedAt: new Date(),
            },
          });
          continue;
        }
        void this.runQueuedBatch(batchId).catch((error) => {
          this.fastify.log.error({ err: error, batchId }, 'Failed reclaiming queued import');
        });
        continue;
      }

      void this.processBatch(batchId).catch((error) => {
        this.fastify.log.error({ err: error, batchId }, 'Failed reclaiming processing import');
      });
    }

    // Purge retained workbooks older than 30 days (keep batch metadata/errors).
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.fastify.prisma.candidateImportBatch.updateMany({
      where: {
        createdAt: { lt: cutoff },
        fileContent: { not: null },
      },
      data: { fileContent: null },
    });
  }

  private async runQueuedBatch(batchId: number): Promise<void> {
    if (runningBatches.has(batchId)) return;
    runningBatches.add(batchId);

    try {
      const batch = await this.fastify.prisma.candidateImportBatch.findUnique({
        where: { id: BigInt(batchId) },
      });
      if (!batch || !batch.fileContent) {
        await this.failBatch(batchId, 'Uploaded workbook content is missing.');
        return;
      }
      if (batch.status !== 'QUEUED' && batch.status !== 'VALIDATING') {
        return;
      }

      await this.fastify.prisma.candidateImportBatch.update({
        where: { id: batch.id },
        data: { status: 'VALIDATING' },
      });

      const organizationId = bigintToNumber(batch.organizationId);
      const fileBuffer = Buffer.from(batch.fileContent);

      let staged: Awaited<ReturnType<CandidateImportService['buildStagedRows']>>;
      try {
        staged = await this.buildStagedRows(organizationId, fileBuffer);
      } catch (error) {
        await this.failBatch(
          batchId,
          error instanceof Error ? error.message : 'Workbook could not be parsed.',
        );
        return;
      }

      const structureErrors = staged.rowErrors.filter((e) =>
        STRUCTURE_ERROR_CODES.includes(e.errorCode as (typeof STRUCTURE_ERROR_CODES)[number]),
      );

      if (structureErrors.length > 0) {
        await this.fastify.prisma.candidateImportBatch.update({
          where: { id: batch.id },
          data: {
            status: 'FAILED',
            failedCount: structureErrors.length,
            totalCount: staged.stagedRows.length,
            errorSummary: structureErrors[0]?.message ?? 'Workbook has structural errors.',
            completedAt: new Date(),
            previewPayload: {
              sheetCounts: staged.sheetCounts,
              errors: staged.rowErrors,
            } as Prisma.InputJsonValue,
            errors: {
              create: staged.rowErrors.map((error) => this.toErrorCreate(error)),
            },
          },
        });
        return;
      }

      await this.fastify.prisma.$transaction(async (tx) => {
        await tx.candidateImportError.deleteMany({ where: { batchId: batch.id } });
        await tx.candidateImportRow.deleteMany({ where: { batchId: batch.id } });
        await tx.candidateImportBatch.update({
          where: { id: batch.id },
          data: {
            status: 'PROCESSING',
            createdCount: staged.created,
            updatedCount: staged.updated,
            skippedCount: staged.skipped,
            failedCount: staged.failed,
            processedCount: staged.failed,
            totalCount: staged.stagedRows.length,
            errorSummary:
              staged.failed > 0
                ? `${staged.failed} row(s) failed validation`
                : null,
            previewPayload: {
              sheetCounts: staged.sheetCounts,
              errors: staged.rowErrors,
            } as Prisma.InputJsonValue,
            rows: {
              create: staged.stagedRows.map((row) => ({
                rowNumber: row.rowNumber,
                sourceCandidateId: row.sourceCandidateId,
                email: row.email,
                candidateId:
                  row.existingCandidateId != null
                    ? BigInt(row.existingCandidateId)
                    : null,
                action: row.action,
                errorMessage: row.errorMessage,
                normalizedPayload: row.payload as unknown as Prisma.InputJsonValue,
                processedAt: row.action === 'FAIL' ? new Date() : null,
              })),
            },
            errors: {
              create: staged.rowErrors.map((error) => this.toErrorCreate(error)),
            },
          },
        });
      });

      const actionable = staged.stagedRows.some((row) => row.action !== 'FAIL');
      if (!actionable) {
        await this.fastify.prisma.candidateImportBatch.update({
          where: { id: batch.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            errorSummary:
              staged.failed > 0
                ? `${staged.failed} row(s) failed validation; no candidates imported`
                : 'No candidate rows to import',
          },
        });
        return;
      }

      await this.processBatch(batchId);
    } finally {
      runningBatches.delete(batchId);
    }
  }

  private async processBatch(batchId: number): Promise<void> {
    const wasTracked = runningBatches.has(batchId);
    if (!wasTracked) runningBatches.add(batchId);

    try {
      const batch = await this.fastify.prisma.candidateImportBatch.findUnique({
        where: { id: BigInt(batchId) },
      });
      if (!batch) return;
      if (batch.status === 'COMPLETED' || batch.status === 'FAILED') return;

      const organizationId = bigintToNumber(batch.organizationId);
      const actorId = bigintToNumber(batch.createdById);
      const communities = await this.ensureSkillCommunities();

      let created = 0;
      let updated = 0;
      let skipped = 0;
      let failed = 0;
      let processed = 0;

      const prior = await this.fastify.prisma.candidateImportRow.groupBy({
        by: ['action'],
        where: { batchId: batch.id, processedAt: { not: null } },
        _count: { _all: true },
      });
      created = prior.find((p) => p.action === 'CREATE')?._count._all ?? 0;
      updated = prior.find((p) => p.action === 'UPDATE')?._count._all ?? 0;
      skipped = prior.find((p) => p.action === 'SKIP')?._count._all ?? 0;
      failed = prior.find((p) => p.action === 'FAIL')?._count._all ?? 0;
      processed = created + updated + skipped + failed;

      await this.fastify.prisma.candidateImportBatch.update({
        where: { id: batch.id },
        data: { status: 'PROCESSING' },
      });

      for (;;) {
        const page = await this.fastify.prisma.candidateImportRow.findMany({
          where: {
            batchId: batch.id,
            action: { in: ['CREATE', 'UPDATE', 'SKIP'] },
            processedAt: null,
          },
          orderBy: { rowNumber: 'asc' },
          take: IMPORT_LIMITS.chunkSize,
        });
        if (page.length === 0) break;

        const pageOutcomes = await mapPool(page, IMPORT_LIMITS.rowConcurrency, async (row) => {
          const payload = row.normalizedPayload as unknown as NormalizedCandidateImport;
          try {
            const outcome = await this.fastify.prisma.$transaction(async (tx) =>
              this.importCandidateRow(tx, {
                row,
                payload,
                organizationId,
                actorId,
                communities,
              }),
            );
            return outcome;
          } catch (error) {
            const rawMessage =
              error instanceof Error ? error.message : 'Import row failed';
            const message = formatImportRowErrorMessage({
              sheetName: 'Candidate',
              rowNumber: row.rowNumber,
              sourceCandidateId: row.sourceCandidateId,
              message: this.humanizeDbError(rawMessage),
            });
            await this.fastify.prisma.candidateImportRow.update({
              where: { id: row.id },
              data: {
                action: 'FAIL',
                errorMessage: message,
                processedAt: new Date(),
              },
            });
            await this.fastify.prisma.candidateImportError.create({
              data: {
                batchId: batch.id,
                sheetName: 'Candidate',
                rowNumber: row.rowNumber,
                sourceCandidateId: row.sourceCandidateId,
                errorCode: 'IMPORT_ROW_FAILED',
                message,
              },
            });
            return 'FAIL' as const;
          }
        });

        for (const outcome of pageOutcomes) {
          if (outcome === 'CREATE') created += 1;
          else if (outcome === 'UPDATE') updated += 1;
          else if (outcome === 'SKIP') skipped += 1;
          else failed += 1;
          processed += 1;
        }

        await this.fastify.prisma.candidateImportBatch.update({
          where: { id: batch.id },
          data: {
            createdCount: created,
            updatedCount: updated,
            skippedCount: skipped,
            failedCount: failed,
            processedCount: processed,
          },
        });
      }

      await this.fastify.prisma.candidateImportBatch.update({
        where: { id: batch.id },
        data: {
          status: 'COMPLETED',
          createdCount: created,
          updatedCount: updated,
          skippedCount: skipped,
          failedCount: failed,
          processedCount: processed,
          completedAt: new Date(),
          errorSummary:
            failed > 0 ? `${failed} row(s) failed during import` : null,
        },
      });

      const { notifyImportBatchFinished } = await import(
        '../../services/notification-events.js'
      );
      void notifyImportBatchFinished(this.fastify.prisma, this.fastify.config, {
        organizationId: bigintToNumber(batch.organizationId),
        batchId,
        status: 'COMPLETED',
        uploadedById: bigintToNumber(batch.createdById),
        successCount: created + updated,
        failCount: failed,
        skipCount: skipped,
      });
    } catch (error) {
      this.fastify.log.error({ err: error, batchId }, 'Candidate import processBatch failed');
      await this.failBatch(
        batchId,
        error instanceof Error ? error.message : 'Import failed',
      );
    } finally {
      if (!wasTracked) runningBatches.delete(batchId);
    }
  }

  private async importCandidateRow(
    tx: Prisma.TransactionClient,
    input: {
      row: { id: bigint; action: CandidateImportRowAction; candidateId: bigint | null };
      payload: NormalizedCandidateImport;
      organizationId: number;
      actorId: number;
      communities: Map<string, bigint>;
    },
  ): Promise<'CREATE' | 'UPDATE' | 'SKIP'> {
    const { row, payload, organizationId, actorId, communities } = input;

    if (row.action === 'SKIP') {
      await tx.candidateImportRow.update({
        where: { id: row.id },
        data: { processedAt: new Date() },
      });
      return 'SKIP';
    }

    const communityId = payload.skillCommunity
      ? communities.get(payload.skillCommunity) ?? null
      : null;
    const profileStatus = deriveImportedProfileStatus(payload);

    const importedFields = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: `${payload.firstName} ${payload.lastName}`.trim(),
      phone: payload.phone,
      source: payload.source,
      sourceCandidateId: payload.sourceCandidateId,
      headline: payload.headline,
      primaryRole: payload.primaryRole,
      summary: payload.summary,
      location: payload.location,
      country: payload.country,
      timezone: payload.timezone,
      yearsExperience: payload.yearsExperience,
      currentCompany: payload.currentCompany,
      currentTitle: payload.currentTitle,
      noticePeriod: payload.noticePeriod,
      portfolioUrl: payload.portfolioUrl,
      resumeUrl: payload.resumeUrl,
      availableFrom: payload.availableFrom
        ? new Date(`${payload.availableFrom}T00:00:00.000Z`)
        : null,
      availabilityStatus: payload.availabilityStatus,
      timezoneOverlap: payload.timezoneOverlap,
      preferredShift: payload.preferredShift,
      clientBillRate: payload.billRate,
      candidatePayRate: payload.payRate,
      linkedinUrl: payload.linkedinUrl,
      githubUrl: payload.githubUrl,
      aiSummary: payload.aiSummary,
      strengths: payload.strengths,
      weaknesses: payload.weaknesses,
      primarySkillCommunityId: communityId,
      status: 'IMPORTED' as const,
      visibility: 'INTERNAL_ONLY' as const,
      approvalStatus: 'PENDING' as const,
      submittedForApprovalAt: null,
      profileStatus,
      aiScreeningStatus: hasAiScreeningFields(payload)
        ? ('IMPORTED' as const)
        : ('NOT_SCREENED' as const),
      evaluationStatus: payload.evaluations.length ? 'COMPLETED' : null,
      bgvStatus: payload.bgv ? mapBgvStatus(payload.bgv.bgvStatus) : null,
      bestalScore: payload.scores[0]?.bestalScore ?? null,
      technicalScore:
        payload.scores[0]?.technicalScore ?? payload.evaluations[0]?.technicalScore ?? null,
      communicationScore:
        payload.scores[0]?.communicationScore ??
        payload.evaluations[0]?.communicationScore ??
        null,
      reliabilityScore: payload.scores[0]?.reliabilityScore ?? null,
    };

    let candidateId = row.candidateId;
    let outcome: 'CREATE' | 'UPDATE';

    if (row.action === 'CREATE') {
      const email =
        payload.email ??
        `import+${payload.source.toLowerCase()}-${payload.sourceCandidateId}@imported.bestal.local`;
      const createdCandidate = await tx.candidate.create({
        data: {
          ...importedFields,
          organizationId: BigInt(organizationId),
          createdById: BigInt(actorId),
          oorwinCandidateId:
            payload.source === 'OORWIN' ? payload.sourceCandidateId : null,
          email,
          currency: payload.currency ?? 'USD',
        },
      });
      candidateId = createdCandidate.id;
      outcome = 'CREATE';
    } else {
      if (!candidateId) {
        throw new Error('Missing existing candidate id for update');
      }
      await tx.candidate.update({
        where: { id: candidateId },
        data: {
          ...importedFields,
          email: payload.email ?? undefined,
          currency: payload.currency,
        },
      });
      outcome = 'UPDATE';
    }

    await tx.candidateSkill.deleteMany({ where: { candidateId } });
    if (payload.skills.length) {
      await tx.candidateSkill.createMany({
        data: payload.skills.map((skill) => ({
          candidateId: candidateId!,
          skillCommunityId:
            (skill.skillCommunityName && communities.get(skill.skillCommunityName)) ||
            communityId,
          skillName: skill.skillName,
          skillCategory: skill.skillCategory,
          proficiencyLevel: skill.proficiency,
          yearsExperience: skill.yearsExperience,
          isPrimary: skill.isPrimary,
        })),
      });
    }

    await tx.evaluation.deleteMany({ where: { candidateId } });
    for (const evaluation of payload.evaluations) {
      await tx.evaluation.create({
        data: {
          organizationId: BigInt(organizationId),
          candidateId,
          evaluatorName: evaluation.evaluatorName,
          evaluatorCompany: evaluation.evaluatorCompany,
          evaluationType: evaluation.evaluationType,
          evaluationDate: evaluation.evaluationDate
            ? new Date(`${evaluation.evaluationDate}T00:00:00.000Z`)
            : null,
          technicalScore: evaluation.technicalScore,
          communicationScore: evaluation.communicationScore,
          problemSolvingScore: evaluation.problemSolvingScore,
          architectureScore: evaluation.architectureScore,
          clientReadinessScore: evaluation.clientReadinessScore,
          recommendation: evaluation.recommendation,
          evaluationSummary: evaluation.evaluationSummary,
          evaluatorComments: evaluation.comments,
          aiEvaluationSummary: evaluation.aiEvaluationSummary,
        },
      });
    }

    await tx.backgroundCheck.deleteMany({ where: { candidateId } });
    if (payload.bgv) {
      await tx.backgroundCheck.create({
        data: {
          organizationId: BigInt(organizationId),
          candidateId,
          requestedById: BigInt(actorId),
          type: 'COMPREHENSIVE',
          status: mapBgvStatus(payload.bgv.bgvStatus),
          provider: payload.bgv.vendor,
          resultSummary: payload.bgv.bgvSummary,
          reviewNotes: payload.bgv.concernNotes,
          idCheckStatus: payload.bgv.idCheckStatus,
          addressCheckStatus: payload.bgv.addressCheckStatus,
          employmentCheckStatus: payload.bgv.employmentCheckStatus,
          educationCheckStatus: payload.bgv.educationCheckStatus,
          criminalCheckStatus: payload.bgv.criminalCheckStatus,
          referenceCheckStatus: payload.bgv.referenceCheckStatus,
          initiatedAt: payload.bgv.initiatedDate
            ? new Date(`${payload.bgv.initiatedDate}T00:00:00.000Z`)
            : null,
          completedAt: payload.bgv.completedDate
            ? new Date(`${payload.bgv.completedDate}T00:00:00.000Z`)
            : null,
        },
      });
    }

    await tx.candidateScore.deleteMany({ where: { candidateId } });
    if (payload.scores.length) {
      await tx.candidateScore.createMany({
        data: payload.scores.map((score) => ({
          organizationId: BigInt(organizationId),
          candidateId: candidateId!,
          bestalScore: score.bestalScore,
          technicalScore: score.technicalScore,
          communicationScore: score.communicationScore,
          problemSolvingScore: score.problemSolvingScore,
          architectureScore: score.architectureScore,
          reliabilityScore: score.reliabilityScore,
          clientReadinessScore: score.clientReadinessScore,
          scoreSource: score.scoreSource,
          scoreDate: score.scoreDate
            ? new Date(`${score.scoreDate}T00:00:00.000Z`)
            : null,
        })),
      });
    }

    await tx.candidateImportRow.update({
      where: { id: row.id },
      data: {
        candidateId,
        processedAt: new Date(),
        errorMessage: null,
      },
    });

    return outcome;
  }

  private async buildStagedRows(
    organizationId: number,
    fileBuffer: Buffer,
  ): Promise<{
    sheetCounts: Record<string, number>;
    stagedRows: StagedImportRow[];
    previewRows: CandidateImportPreviewRow[];
    rowErrors: ImportValidationError[];
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  }> {
    const parsed = await parseAndValidateCandidateWorkbook(fileBuffer);
    const existing = await this.fastify.prisma.candidate.findMany({
      where: {
        organizationId: BigInt(organizationId),
        deletedAt: null,
        OR: [
          {
            sourceCandidateId: {
              in: parsed.candidates.map((c) => c.sourceCandidateId),
            },
          },
          {
            email: {
              in: parsed.candidates
                .map((c) => c.email)
                .filter((email): email is string => Boolean(email)),
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        source: true,
        sourceCandidateId: true,
        firstName: true,
        lastName: true,
        yearsExperience: true,
        primaryRole: true,
        aiSummary: true,
        strengths: true,
        weaknesses: true,
      },
    });

    const bySourceId = new Map(
      existing
        .filter((row) => row.sourceCandidateId)
        .map((row) => [`${row.source}:${row.sourceCandidateId}`, row]),
    );
    const byEmail = new Map(
      existing
        .filter((row) => row.email)
        .map((row) => [row.email.toLowerCase(), row]),
    );

    const previewRows: CandidateImportPreviewRow[] = [];
    const rowErrors: ImportValidationError[] = parsed.errors.map((error) => ({
      ...error,
      message: formatImportRowErrorMessage({
        sheetName: error.sheetName,
        rowNumber: error.rowNumber,
        sourceCandidateId: error.sourceCandidateId,
        message: error.message,
      }),
    }));
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const stagedRows: StagedImportRow[] = [];

    for (const candidate of parsed.candidates) {
      const sourceKey = `${candidate.source}:${candidate.sourceCandidateId}`;
      const matchedBySource = bySourceId.get(sourceKey);
      const matchedByEmail = candidate.email
        ? byEmail.get(candidate.email.toLowerCase())
        : undefined;

      let action: CandidateImportRowAction = 'CREATE';
      let existingCandidateId: number | null = null;
      let errorMessage: string | null = null;

      if (matchedByEmail && !matchedBySource) {
        const sameIdentity =
          matchedByEmail.source === candidate.source &&
          matchedByEmail.sourceCandidateId === candidate.sourceCandidateId;
        if (!sameIdentity) {
          const message = formatImportRowErrorMessage({
            sheetName: 'Candidate',
            rowNumber: candidate.rowNumber,
            sourceCandidateId: candidate.sourceCandidateId,
            message:
              'Email already belongs to a different source identity in this organization.',
          });
          rowErrors.push({
            sheetName: 'Candidate',
            rowNumber: candidate.rowNumber,
            sourceCandidateId: candidate.sourceCandidateId,
            columnName: 'email',
            suppliedValue: candidate.email ?? undefined,
            errorCode: 'EMAIL_CONFLICT',
            message,
          });
          action = 'FAIL';
          errorMessage = message;
        }
      }

      if (action !== 'FAIL' && matchedBySource) {
        existingCandidateId = bigintToNumber(matchedBySource.id);
        const unchanged =
          matchedBySource.firstName === candidate.firstName &&
          matchedBySource.lastName === candidate.lastName &&
          (matchedBySource.email?.toLowerCase() ?? null) === candidate.email &&
          (matchedBySource.yearsExperience ?? null) === candidate.yearsExperience &&
          (matchedBySource.primaryRole ?? null) === candidate.primaryRole &&
          (matchedBySource.aiSummary ?? null) === candidate.aiSummary &&
          (matchedBySource.strengths ?? null) === candidate.strengths &&
          (matchedBySource.weaknesses ?? null) === candidate.weaknesses;
        action = unchanged ? 'SKIP' : 'UPDATE';
      }

      if (action !== 'FAIL') {
        const ownFieldErrors = rowErrors.filter(
          (error) =>
            error.sourceCandidateId === candidate.sourceCandidateId &&
            error.errorCode !== 'ORPHAN_RELATED_ROW',
        );
        if (ownFieldErrors.length > 0) {
          action = 'FAIL';
          errorMessage = ownFieldErrors[0]?.message ?? 'Validation failed';
        }
      }

      if (action === 'CREATE') created += 1;
      else if (action === 'UPDATE') updated += 1;
      else if (action === 'SKIP') skipped += 1;
      else failed += 1;

      previewRows.push({
        rowNumber: candidate.rowNumber,
        sourceCandidateId: candidate.sourceCandidateId,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        source: candidate.source,
        action,
        existingCandidateId,
        errorMessage,
      });

      stagedRows.push({
        rowNumber: candidate.rowNumber,
        sourceCandidateId: candidate.sourceCandidateId,
        email: candidate.email,
        action,
        errorMessage,
        payload: candidate,
        existingCandidateId,
      });
    }

    return {
      sheetCounts: parsed.sheetCounts,
      stagedRows,
      previewRows,
      rowErrors,
      created,
      updated,
      skipped,
      failed,
    };
  }

  private toErrorCreate(error: ImportValidationError) {
    return {
      sheetName: error.sheetName,
      rowNumber: error.rowNumber ?? null,
      sourceCandidateId: error.sourceCandidateId ?? null,
      columnName: error.columnName ?? null,
      suppliedValue: error.suppliedValue ?? null,
      errorCode: error.errorCode,
      message: error.message,
    };
  }

  private async failBatch(batchId: number, message: string): Promise<void> {
    const batch = await this.fastify.prisma.candidateImportBatch.update({
      where: { id: BigInt(batchId) },
      data: {
        status: 'FAILED',
        errorSummary: message,
        completedAt: new Date(),
      },
    });
    const { notifyImportBatchFinished } = await import(
      '../../services/notification-events.js'
    );
    void notifyImportBatchFinished(this.fastify.prisma, this.fastify.config, {
      organizationId: bigintToNumber(batch.organizationId),
      batchId,
      status: 'FAILED',
      uploadedById: bigintToNumber(batch.createdById),
      successCount: batch.createdCount + batch.updatedCount,
      failCount: batch.failedCount,
      skipCount: batch.skippedCount,
    });
  }

  private humanizeDbError(message: string): string {
    if (/Unique constraint/i.test(message) && /email/i.test(message)) {
      return 'Unique constraint on email (candidate already exists with a different identity)';
    }
    if (/Unique constraint/i.test(message)) {
      return message.replace(/^Invalid `.*?` invocation[\s\S]*?Unique constraint/, 'Unique constraint');
    }
    return message;
  }

  private async findBatchIdsWithSourceFile(ids: bigint[]): Promise<Set<number>> {
    if (ids.length === 0) return new Set();
    const rows = await this.fastify.prisma.candidateImportBatch.findMany({
      where: {
        id: { in: ids },
        fileContent: { not: null },
      },
      select: { id: true },
    });
    return new Set(rows.map((row) => bigintToNumber(row.id)));
  }

  private mapBatch(
    batch: {
      id: bigint;
      fileName: string;
      status: string;
      createdCount: number;
      updatedCount: number;
      skippedCount: number;
      failedCount: number;
      processedCount: number;
      totalCount: number;
      errorSummary: string | null;
      expiresAt: Date;
      confirmedAt: Date | null;
      completedAt: Date | null;
      createdAt?: Date;
      createdBy?: { firstName: string | null; lastName: string | null; email: string } | null;
      _count?: { errors: number };
    },
    hasSourceFile = false,
  ): CandidateImportBatchStatusDto {
    const uploadedBy = batch.createdBy
      ? [batch.createdBy.firstName, batch.createdBy.lastName].filter(Boolean).join(' ').trim() ||
        batch.createdBy.email
      : null;
    return {
      batchId: bigintToNumber(batch.id),
      fileName: batch.fileName,
      status: batch.status,
      created: batch.createdCount,
      updated: batch.updatedCount,
      skipped: batch.skippedCount,
      failed: batch.failedCount,
      processed: batch.processedCount,
      total: batch.totalCount,
      errorSummary: batch.errorSummary,
      expiresAt: batch.expiresAt.toISOString(),
      confirmedAt: batch.confirmedAt?.toISOString() ?? null,
      completedAt: batch.completedAt?.toISOString() ?? null,
      createdAt: batch.createdAt?.toISOString() ?? null,
      uploadedBy,
      hasErrorReport: (batch._count?.errors ?? batch.failedCount) > 0,
      hasSourceFile,
      canConfirm: batch.status === 'PREVIEWED' && batch.expiresAt.getTime() > Date.now(),
    };
  }

  private mapHistoryItem(
    batch: {
      id: bigint;
      fileName: string;
      status: string;
      createdCount: number;
      updatedCount: number;
      skippedCount: number;
      failedCount: number;
      processedCount: number;
      totalCount: number;
      errorSummary: string | null;
      createdAt: Date;
      completedAt: Date | null;
      createdBy: { firstName: string | null; lastName: string | null; email: string };
      _count: { errors: number };
    },
    hasSourceFile = false,
  ): CandidateImportHistoryItemDto {
    const uploadedBy =
      [batch.createdBy.firstName, batch.createdBy.lastName].filter(Boolean).join(' ').trim() ||
      batch.createdBy.email;
    return {
      batchId: bigintToNumber(batch.id),
      fileName: batch.fileName,
      status: batch.status,
      created: batch.createdCount,
      updated: batch.updatedCount,
      skipped: batch.skippedCount,
      failed: batch.failedCount,
      processed: batch.processedCount,
      total: batch.totalCount,
      errorSummary: batch.errorSummary,
      uploadedBy,
      createdAt: batch.createdAt.toISOString(),
      completedAt: batch.completedAt?.toISOString() ?? null,
      hasErrorReport: batch._count.errors > 0 || batch.failedCount > 0,
      hasSourceFile,
    };
  }

  private assertWorkbookFile(fileName: string, buffer: Buffer): void {
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestError('Only .xlsx workbooks are supported for candidate import.');
    }
    if (!buffer.length) {
      throw new BadRequestError('Uploaded workbook is empty.');
    }
    if (buffer.length > IMPORT_LIMITS.maxFileBytes) {
      throw new BadRequestError(
        `Workbook exceeds maximum size of ${Math.floor(IMPORT_LIMITS.maxFileBytes / (1024 * 1024))} MB.`,
      );
    }
  }

  private async ensureSkillCommunities(): Promise<Map<string, bigint>> {
    const map = new Map<string, bigint>();
    for (const name of IMPORT_SKILL_COMMUNITIES) {
      const slug = slugifySkillCommunity(name);
      const community = await this.fastify.prisma.skillCommunity.upsert({
        where: { slug },
        update: { name, isActive: true, deletedAt: null },
        create: { name, slug, description: `${name} skill community` },
      });
      map.set(name, community.id);
    }
    return map;
  }
}
