import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const backgroundCheckStatusEnum = z.enum([
  'NOT_STARTED',
  'PENDING',
  'IN_PROGRESS',
  'CLEAR',
  'CONSIDER',
  'SUSPENDED',
  'FAILED',
  'CANCELLED',
]);

const backgroundCheckTypeEnum = z.enum([
  'CRIMINAL',
  'EMPLOYMENT',
  'EDUCATION',
  'REFERENCE',
  'IDENTITY',
  'CREDIT',
  'COMPREHENSIVE',
]);

export const createBackgroundCheckBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  type: backgroundCheckTypeEnum,
  status: backgroundCheckStatusEnum.optional(),
  provider: z.string().max(100).optional(),
  externalReferenceId: z.string().max(255).optional(),
  resultSummary: z.string().max(5000).optional(),
  aiSummary: z.string().max(10000).optional(),
  reviewNotes: z.string().max(5000).optional(),
  initiatedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateBackgroundCheckBodySchema = z.object({
  type: backgroundCheckTypeEnum.optional(),
  status: backgroundCheckStatusEnum.optional(),
  provider: z.string().max(100).optional(),
  externalReferenceId: z.string().max(255).optional(),
  resultSummary: z.string().max(5000).optional(),
  initiatedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const assignVendorBodySchema = z.object({
  provider: z.string().min(1).max(100),
});

export const reviewNotesBodySchema = z.object({
  notes: z.string().max(5000).optional(),
});

export const clarificationBodySchema = z.object({
  notes: z.string().min(1).max(5000),
});

export const listBackgroundChecksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|type|initiatedAt|completedAt))(,-?(createdAt|updatedAt|status|type|initiatedAt|completedAt))*$/,
      'Invalid sort format',
    )
    .optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  status: backgroundCheckStatusEnum.optional(),
  type: backgroundCheckTypeEnum.optional(),
});

export const backgroundCheckIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateBackgroundCheckBody = z.infer<typeof createBackgroundCheckBodySchema>;
export type UpdateBackgroundCheckBody = z.infer<typeof updateBackgroundCheckBodySchema>;
export type ListBackgroundChecksQuery = z.infer<typeof listBackgroundChecksQuerySchema>;
export type AssignVendorBody = z.infer<typeof assignVendorBodySchema>;
export type ReviewNotesBody = z.infer<typeof reviewNotesBodySchema>;

const backgroundCheckDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  requestedById: z.number(),
  requestedByName: z.string(),
  type: z.string(),
  status: z.string(),
  provider: z.string().nullable(),
  externalReferenceId: z.string().nullable(),
  resultSummary: z.string().nullable(),
  aiSummary: z.string().nullable(),
  reviewNotes: z.string().nullable(),
  consentConfirmedAt: z.string().nullable(),
  vendorAssignedAt: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  hasConsentDocument: z.boolean(),
  hasReportDocument: z.boolean(),
  supportingDocumentCount: z.number(),
  documents: z
    .array(
      z.object({
        id: z.number(),
        fileName: z.string(),
        originalName: z.string(),
        mimeType: z.string(),
        description: z.string().nullable(),
        url: z.string().nullable(),
        createdAt: z.string(),
      }),
    )
    .optional(),
  initiatedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backgroundCheckResponseSchema = z.object({
  data: backgroundCheckDtoSchema,
});

export const backgroundCheckListItemSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  type: z.string(),
  status: z.string(),
  provider: z.string().nullable(),
  consentConfirmedAt: z.string().nullable().optional(),
  aiSummary: z.string().nullable().optional(),
  hasReportDocument: z.boolean().optional(),
  initiatedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backgroundCheckListResponseSchema = z.object({
  data: z.array(backgroundCheckListItemSchema),
  meta: paginationMetaSchema,
});

export const backgroundCheckMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

export const bgvExtractionResponseSchema = z.object({
  data: z.object({
    liveAi: z.boolean(),
    extraction: z
      .object({
        jobId: z.string(),
        confidence: z.number(),
        extractedAt: z.string(),
        id: z.string().optional(),
        candidateId: z.string().optional(),
        vendorName: z.string().optional(),
        status: z.string().optional(),
        idCheckStatus: z.string().optional(),
        addressCheckStatus: z.string().optional(),
        employmentCheckStatus: z.string().optional(),
        educationCheckStatus: z.string().optional(),
        criminalCheckStatus: z.string().optional(),
        referenceCheckStatus: z.string().optional(),
        reportUrl: z.string().nullable().optional(),
        aiBgvSummary: z.string(),
        concernNotes: z.string().optional(),
        initiatedDate: z.string().optional(),
        completedDate: z.string().optional(),
        checkType: z.string().optional(),
        warnings: z.array(z.string()),
      })
      .passthrough(),
  }),
});
