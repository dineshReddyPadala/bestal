/** Which fields users fill vs what the backend/system sets automatically. */

import type {
  EvaluationRecommendationValue,
  EvaluationTypeValue,
} from '@bestal/shared-utils';

export const SYSTEM_FIELDS_NOTE =
  'Status, audit timestamps, IDs, and workflow fields are set automatically by the system.';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function demoDocId(fileName: string): number {
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
  }
  return Math.abs(hash % 9000) + 1000;
}

const now = () => new Date().toISOString();

// ─── Client ───────────────────────────────────────────────────────────────────

export type ClientFormValues = {
  company: string;
  industry: string;
  primaryContact: string;
  email: string;
  phone: string;
  accountManager: string;
  companySize?: string;
  headquarters?: string;
  website?: string;
  paymentTerms?: string;
  logoFileName?: string;
  logoPreviewUrl?: string;
};

export type ClientPayload = ClientFormValues & {
  id?: number;
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'PREPAID';
  status: 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  organizationId: number;
  slug: string;
  candidateCount: number;
  deploymentCount: number;
  revenue: number;
  currency: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildClientPayload(
  form: ClientFormValues,
  existing?: Partial<ClientPayload>,
): ClientPayload {
  const ts = now();
  return {
    ...form,
    id: existing?.id,
    paymentTerms: existing?.paymentTerms ?? 'NET_30',
    status: existing?.status ?? 'PROSPECT',
    organizationId: existing?.organizationId ?? 1,
    slug: slugify(form.company),
    candidateCount: existing?.candidateCount ?? 0,
    deploymentCount: existing?.deploymentCount ?? 0,
    revenue: existing?.revenue ?? 0,
    currency: existing?.currency ?? 'USD',
    logoUrl: form.logoPreviewUrl ?? existing?.logoUrl ?? null,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

export type EvaluationFormValues = {
  candidateName: string;
  evaluatorName: string;
  evaluatorCompany?: string;
  evaluationType: EvaluationTypeValue;
  evaluatedDate: string;
  technicalScore?: number;
  communicationScore?: number;
  architectureScore?: number;
  problemSolvingScore?: number;
  clientReadinessScore?: number;
  recommendation?: EvaluationRecommendationValue;
  evaluatorComments?: string;
  aiEvaluationSummary?: string;
  recordingFileName?: string;
  pdfFileName?: string;
};

export type EvaluationPayload = EvaluationFormValues & {
  id?: number;
  candidateId: number;
  organizationId: number;
  evaluatorName: string;
  hasRecording: boolean;
  hasPdf: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildEvaluationPayload(
  form: EvaluationFormValues,
  existing?: Partial<EvaluationPayload>,
): EvaluationPayload {
  const ts = now();
  return {
    ...form,
    id: existing?.id,
    candidateId: existing?.candidateId ?? 1,
    organizationId: existing?.organizationId ?? 1,
    evaluatorName: form.evaluatorName,
    hasRecording: !!(form.recordingFileName ?? existing?.hasRecording),
    hasPdf: !!(form.pdfFileName ?? existing?.hasPdf),
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Deployment ───────────────────────────────────────────────────────────────

export type DeploymentFormValues = {
  clientName: string;
  candidateName: string;
  placementType: 'CONTRACT' | 'PERMANENT' | 'TEMP_TO_PERM' | 'FREELANCE';
  roleTitle: string;
  startDate: string;
  endDate?: string;
  billingRate: number;
  candidatePayRate?: number;
  grossMarginPerHour?: number;
  expectedHoursPerWeek?: number;
  timezone?: string;
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  currency: string;
  workLocation?: string;
  notes?: string;
};

export type DeploymentPayload = {
  id?: number;
  clientId: number;
  candidateId: number;
  organizationId: number;
  createdById: number;
  createdByName: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'ON_HOLD';
  placementType: DeploymentFormValues['placementType'];
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  billingRate: number;
  currency: string;
  workLocation: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildDeploymentPayload(
  form: DeploymentFormValues,
  existing?: Partial<DeploymentPayload>,
): DeploymentPayload {
  const ts = now();
  return {
    id: existing?.id,
    clientId: existing?.clientId ?? 1,
    candidateId: existing?.candidateId ?? 1,
    organizationId: existing?.organizationId ?? 1,
    createdById: existing?.createdById ?? 1,
    createdByName: existing?.createdByName ?? 'Current User',
    status: existing?.status ?? 'PENDING',
    placementType: form.placementType,
    roleTitle: form.roleTitle.trim(),
    startDate: form.startDate,
    endDate: form.endDate?.trim() || null,
    billingRate: form.billingRate,
    currency: form.currency,
    workLocation: form.workLocation?.trim() || null,
    notes: form.notes?.trim() || null,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── User invite ──────────────────────────────────────────────────────────────

export type UserInviteFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'RECRUITER' | 'SALES';
};

export type UserPayload = UserInviteFormValues & {
  id?: number;
  organizationId: number;
  isActive: boolean;
  photoUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildUserPayload(
  form: UserInviteFormValues,
  existing?: Partial<UserPayload>,
): UserPayload {
  const ts = now();
  return {
    ...form,
    id: existing?.id,
    organizationId: existing?.organizationId ?? 1,
    isActive: existing?.isActive ?? true,
    photoUrl: existing?.photoUrl ?? null,
    lastLoginAt: existing?.lastLoginAt ?? null,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Organization ─────────────────────────────────────────────────────────────

export type OrganizationFormValues = {
  name: string;
};

export type OrganizationPayload = OrganizationFormValues & {
  id?: number;
  slug: string;
  isActive: boolean;
  memberCount: number;
  clientCount: number;
  candidateCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildOrganizationPayload(
  form: OrganizationFormValues,
  existing?: Partial<OrganizationPayload>,
): OrganizationPayload {
  const ts = now();
  return {
    ...form,
    id: existing?.id,
    slug: slugify(form.name),
    isActive: existing?.isActive ?? true,
    memberCount: existing?.memberCount ?? 0,
    clientCount: existing?.clientCount ?? 0,
    candidateCount: existing?.candidateCount ?? 0,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Background verification ──────────────────────────────────────────────────

export type BgvCheckType =
  | 'COMPREHENSIVE'
  | 'CRIMINAL'
  | 'EMPLOYMENT'
  | 'EDUCATION'
  | 'REFERENCE'
  | 'IDENTITY'
  | 'CREDIT';

export type BgvCheckRequestStatus = 'NOT_STARTED' | 'PENDING';

export type BgvRequestFormValues = {
  candidateName: string;
  vendor: string;
  requestedByName: string;
  checkType: BgvCheckType;
  employment: BgvCheckRequestStatus;
  education: BgvCheckRequestStatus;
  reference: BgvCheckRequestStatus;
  address: BgvCheckRequestStatus;
  criminal: BgvCheckRequestStatus;
  notes?: string;
  consentFileName?: string;
  reportFileName?: string;
};

export type BgvPayload = BgvRequestFormValues & {
  id?: number;
  candidateId: number;
  organizationId: number;
  requestedById: number;
  requestedByName: string;
  status: 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'CLEAR' | 'CONSIDER' | 'FAILED';
  employment: string;
  education: string;
  reference: string;
  address: string;
  criminal: string;
  completedAt: string | null;
  hasReport: boolean;
  initiatedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

function initialCheckStatuses(checkType: BgvCheckType): {
  status: BgvPayload['status'];
  employment: string;
  education: string;
  reference: string;
  address: string;
  criminal: string;
} {
  const base = {
    employment: 'NOT_STARTED',
    education: 'NOT_STARTED',
    reference: 'NOT_STARTED',
    address: 'NOT_STARTED',
    criminal: 'NOT_STARTED',
  } as const;

  switch (checkType) {
    case 'COMPREHENSIVE':
      return {
        status: 'PENDING',
        employment: 'PENDING',
        education: 'PENDING',
        reference: 'NOT_STARTED',
        address: 'NOT_STARTED',
        criminal: 'PENDING',
      };
    case 'CRIMINAL':
      return { status: 'PENDING', ...base, criminal: 'PENDING' };
    case 'EMPLOYMENT':
      return { status: 'PENDING', ...base, employment: 'PENDING' };
    case 'EDUCATION':
      return { status: 'PENDING', ...base, education: 'PENDING' };
    case 'REFERENCE':
      return { status: 'PENDING', ...base, reference: 'PENDING' };
    case 'IDENTITY':
      return { status: 'PENDING', ...base, address: 'PENDING' };
    case 'CREDIT':
      return { status: 'PENDING', ...base, address: 'PENDING' };
    default:
      return { status: 'PENDING', ...base };
  }
}

export function getBgvChecksForType(
  checkType: BgvCheckType,
): Pick<
  BgvRequestFormValues,
  'employment' | 'education' | 'reference' | 'address' | 'criminal'
> {
  const checks = initialCheckStatuses(checkType);
  return {
    employment: checks.employment as BgvCheckRequestStatus,
    education: checks.education as BgvCheckRequestStatus,
    reference: checks.reference as BgvCheckRequestStatus,
    address: checks.address as BgvCheckRequestStatus,
    criminal: checks.criminal as BgvCheckRequestStatus,
  };
}

function deriveOverallStatus(form: Pick<
  BgvRequestFormValues,
  'employment' | 'education' | 'reference' | 'address' | 'criminal'
>): BgvPayload['status'] {
  const vals = [form.employment, form.education, form.reference, form.address, form.criminal];
  if (vals.every((v) => v === 'NOT_STARTED')) return 'NOT_STARTED';
  return 'PENDING';
}

export function buildBgvPayload(
  form: BgvRequestFormValues,
  candidateId: number,
  existing?: Partial<BgvPayload>,
): BgvPayload {
  const ts = now();
  const checks = existing?.status
    ? {
        status: existing.status,
        employment: existing.employment ?? 'NOT_STARTED',
        education: existing.education ?? 'NOT_STARTED',
        reference: existing.reference ?? 'NOT_STARTED',
        address: existing.address ?? 'NOT_STARTED',
        criminal: existing.criminal ?? 'NOT_STARTED',
      }
    : {
        status: deriveOverallStatus(form),
        employment: form.employment,
        education: form.education,
        reference: form.reference,
        address: form.address,
        criminal: form.criminal,
      };

  return {
    ...form,
    id: existing?.id,
    candidateId: existing?.candidateId ?? candidateId,
    organizationId: existing?.organizationId ?? 1,
    requestedById: existing?.requestedById ?? 1,
    requestedByName: form.requestedByName,
    ...checks,
    completedAt: existing?.completedAt ?? null,
    hasReport: !!(form.reportFileName ?? existing?.hasReport),
    initiatedAt: existing?.initiatedAt ?? ts,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Document upload (BGV, evaluation, etc.) ──────────────────────────────────

export type DocumentUploadFormValues = {
  fileName: string;
  kind: 'RESUME' | 'EVALUATION_FORM' | 'BGV_FORM' | 'RECORDING' | 'REPORT' | 'OTHER';
};

export type DocumentPayload = DocumentUploadFormValues & {
  id: number;
  organizationId: number;
  uploadedById: number;
  uploadedByName: string;
  entityType: string;
  entityId: number;
  originalName: string;
  s3Key: string;
  s3Bucket: string;
  mimeType: string;
  fileSize: number;
  status: 'PENDING' | 'UPLOADED';
  description: string | null;
  verifiedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildDocumentPayload(
  form: DocumentUploadFormValues,
  entityType: string,
  entityId: number,
): DocumentPayload {
  const ts = now();
  return {
    ...form,
    id: demoDocId(form.fileName),
    organizationId: 1,
    uploadedById: 1,
    uploadedByName: 'Current User',
    entityType,
    entityId,
    originalName: form.fileName,
    s3Key: `uploads/${entityType}/${entityId}/${form.fileName}`,
    s3Bucket: 'amnet-digital',
    mimeType: 'application/octet-stream',
    fileSize: 0,
    status: 'UPLOADED',
    description: null,
    verifiedAt: null,
    rejectedAt: null,
    rejectReason: null,
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
  };
}

// ─── Client interview request (InterviewRequest model / POST /trials-style API) ─

export type InterviewRequestType =
  | 'PHONE'
  | 'VIDEO'
  | 'IN_PERSON'
  | 'TECHNICAL'
  | 'PANEL'
  | 'FINAL'
  | 'HR';

export type InterviewRequestFormValues = {
  type: InterviewRequestType;
  preferredDate: string;
  preferredTime: string;
  durationMinutes: number;
  timezone?: string;
  location?: string;
  notes?: string;
};

export type InterviewRequestPayload = {
  id?: number;
  organizationId: number;
  candidateId: number;
  clientId: number;
  shortlistId: number | null;
  requestedById: number;
  type: InterviewRequestType;
  status: 'REQUESTED';
  scheduledAt: string | null;
  durationMinutes: number;
  timezone: string | null;
  location: string | null;
  notes: string | null;
  assignedToId: number | null;
  meetingLink: string | null;
  feedback: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

function combineDateAndTime(date: string, time: string): string | null {
  if (!date) return null;
  const t = time || '10:00';
  const parsed = new Date(`${date}T${t}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function buildInterviewRequestPayload(
  form: InterviewRequestFormValues,
  candidateId: number,
  clientId: number,
  existing?: Partial<InterviewRequestPayload>,
): InterviewRequestPayload {
  const ts = now();
  return {
    id: existing?.id,
    organizationId: existing?.organizationId ?? 1,
    candidateId,
    clientId,
    shortlistId: existing?.shortlistId ?? null,
    requestedById: existing?.requestedById ?? 1,
    type: form.type,
    status: 'REQUESTED',
    scheduledAt: combineDateAndTime(form.preferredDate, form.preferredTime),
    durationMinutes: form.durationMinutes,
    timezone: form.timezone?.trim() || null,
    location: form.type === 'IN_PERSON' ? form.location?.trim() || null : null,
    notes: form.notes?.trim() || null,
    assignedToId: existing?.assignedToId ?? null,
    meetingLink: existing?.meetingLink ?? null,
    feedback: existing?.feedback ?? null,
    completedAt: existing?.completedAt ?? null,
    cancelledAt: existing?.cancelledAt ?? null,
    cancelReason: existing?.cancelReason ?? null,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Client trial request (createTrialBodySchema) ─────────────────────────────

export type TrialRequestFormValues = {
  roleTitle: string;
  startDate: string;
  endDate: string;
  trialType?: string;
  maxTrialHours?: number;
  taskDescription?: string;
  successCriteria?: string;
  feedback?: string;
};

export type TrialRequestPayload = {
  id?: number;
  organizationId: number;
  candidateId: number;
  clientId: number;
  deploymentId: number | null;
  requestedById: number;
  status: 'REQUESTED';
  roleTitle: string;
  startDate: string;
  endDate: string;
  durationDays: number | null;
  feedback: string | null;
  outcome: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

function durationDaysInclusive(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

export function buildTrialRequestPayload(
  form: TrialRequestFormValues,
  candidateId: number,
  clientId: number,
  existing?: Partial<TrialRequestPayload>,
): TrialRequestPayload {
  const ts = now();
  return {
    id: existing?.id,
    organizationId: existing?.organizationId ?? 1,
    candidateId,
    clientId,
    deploymentId: existing?.deploymentId ?? null,
    requestedById: existing?.requestedById ?? 1,
    status: 'REQUESTED',
    roleTitle: form.roleTitle.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    durationDays: durationDaysInclusive(form.startDate, form.endDate),
    feedback: form.feedback?.trim() || null,
    outcome: existing?.outcome ?? null,
    approvedAt: existing?.approvedAt ?? null,
    rejectedAt: existing?.rejectedAt ?? null,
    rejectReason: existing?.rejectReason ?? null,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Trial workflow (sales review / complete) ─────────────────────────────────

export type TrialRejectFormValues = {
  reason?: string;
};

export type TrialCompleteFormValues = {
  outcome: string;
  feedback?: string;
};

// ─── Interview confirm (recruiter) ────────────────────────────────────────────

export type InterviewConfirmFormValues = {
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  timezone?: string;
  location?: string;
  meetingLink?: string;
};

export type InterviewCancelFormValues = {
  cancelReason?: string;
};

export function buildInterviewConfirmUpdate(
  form: InterviewConfirmFormValues,
  interviewType: InterviewRequestType,
): {
  status: 'SCHEDULED' | 'CONFIRMED';
  scheduledAt: string | null;
  durationMinutes: number;
  timezone: string | null;
  location: string | null;
  meetingLink: string | null;
} {
  return {
    status: 'CONFIRMED',
    scheduledAt: combineDateAndTime(form.scheduledDate, form.scheduledTime),
    durationMinutes: form.durationMinutes,
    timezone: form.timezone?.trim() || null,
    location: interviewType === 'IN_PERSON' ? form.location?.trim() || null : null,
    meetingLink: form.meetingLink?.trim() || null,
  };
}
