/** Which fields users fill vs what the backend/system sets automatically. */

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
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'PREPAID';
  accountManager: string;
  logoFileName?: string;
};

export type ClientPayload = ClientFormValues & {
  id?: number;
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
    status: existing?.status ?? 'PROSPECT',
    organizationId: existing?.organizationId ?? 1,
    slug: slugify(form.company),
    candidateCount: existing?.candidateCount ?? 0,
    deploymentCount: existing?.deploymentCount ?? 0,
    revenue: existing?.revenue ?? 0,
    currency: existing?.currency ?? 'USD',
    logoUrl: form.logoFileName ? `/uploads/logos/${form.logoFileName}` : (existing?.logoUrl ?? null),
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    deletedAt: existing?.deletedAt ?? null,
  };
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

export type EvaluationFormValues = {
  candidateName: string;
  evaluatorName: string;
  evaluationType: 'TECHNICAL' | 'BEHAVIORAL' | 'ARCHITECTURE' | 'FULL_STACK' | 'SECURITY';
  evaluatedDate: string;
  technicalScore?: number;
  communicationScore?: number;
  architectureScore?: number;
  problemSolvingScore?: number;
  recommendation?: 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  summary?: string;
  recordingFileName?: string;
  pdfFileName?: string;
};

export type EvaluationPayload = EvaluationFormValues & {
  id?: number;
  candidateId: number;
  organizationId: number;
  evaluatorId: number;
  evaluatorName: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
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
    evaluatorId: existing?.evaluatorId ?? demoDocId(form.evaluatorName),
    evaluatorName: form.evaluatorName,
    status: existing?.status ?? 'DRAFT',
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
  roleTitle: string;
  startDate: string;
  endDate?: string;
  billRate: number;
  payRate: number;
  currency: string;
  hoursPerWeek: number;
  timezone: string;
  notes?: string;
};

export type DeploymentPayload = DeploymentFormValues & {
  id?: number;
  clientId: number;
  candidateId: number;
  organizationId: number;
  createdById: number;
  createdByName: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'ON_HOLD';
  marginPercent: number;
  manager: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function buildDeploymentPayload(
  form: DeploymentFormValues,
  existing?: Partial<DeploymentPayload>,
): DeploymentPayload {
  const ts = now();
  const margin =
    form.billRate > 0
      ? Math.round(((form.billRate - form.payRate) / form.billRate) * 1000) / 10
      : 0;
  return {
    ...form,
    id: existing?.id,
    clientId: existing?.clientId ?? 1,
    candidateId: existing?.candidateId ?? 1,
    organizationId: existing?.organizationId ?? 1,
    createdById: existing?.createdById ?? 1,
    createdByName: existing?.createdByName ?? 'Current User',
    status: existing?.status ?? 'PENDING',
    marginPercent: margin,
    manager: existing?.manager ?? 'Unassigned',
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
  role: 'ADMIN' | 'RECRUITER' | 'SALES' | 'CLIENT';
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

export type BgvRequestFormValues = {
  candidateName: string;
  vendor: string;
  checkType: BgvCheckType;
  notes?: string;
  consentFileName?: string;
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
    : initialCheckStatuses(form.checkType);

  return {
    ...form,
    id: existing?.id,
    candidateId: existing?.candidateId ?? candidateId,
    organizationId: existing?.organizationId ?? 1,
    requestedById: existing?.requestedById ?? 1,
    requestedByName: existing?.requestedByName ?? 'Current User',
    ...checks,
    completedAt: existing?.completedAt ?? null,
    hasReport: existing?.hasReport ?? false,
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
    s3Bucket: 'bestal-demo',
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
