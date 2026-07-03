import { auditLogs } from './auditLogs.js';
import { backgroundChecks } from './backgroundChecks.js';
import { deployments } from './deployments.js';
import { evaluations } from './evaluations.js';
import { interviews } from './interviews.js';
import { notifications } from './notifications.js';
import { organizations } from './organizations.js';
import { shortlists } from './shortlists.js';
import { trials } from './trials.js';
import { users } from './users.js';
import { documents } from './documents.js';
import type {
  SchemaAuditLog,
  SchemaBackgroundCheck,
  SchemaDeployment,
  SchemaDocument,
  SchemaEvaluation,
  SchemaInterviewRequest,
  SchemaNotification,
  SchemaOrganization,
  SchemaShortlist,
  SchemaTrialRequest,
  SchemaUser,
} from './schema-types.js';

const ORG_ID = 1;
const TS = '2026-05-01T10:00:00Z';
const TS_UPD = '2026-06-15T14:30:00Z';

export const schemaDocuments: readonly SchemaDocument[] = documents.map((d) => ({
  id: d.id,
  organizationId: ORG_ID,
  uploadedById: 2,
  uploadedByName: d.uploadedBy,
  entityType: d.entityType,
  entityId: d.entityId,
  kind: d.kind,
  fileName: d.fileName,
  originalName: d.fileName,
  s3Key: `org-${ORG_ID}/${d.kind.toLowerCase()}/${d.fileName}`,
  s3Bucket: 'bestal-uploads-dev',
  mimeType: d.mimeType,
  fileSize: d.fileSizeKb * 1024,
  status:
    d.status === 'VERIFIED'
      ? 'VERIFIED'
      : ('UPLOADED' as const),
  description: null,
  verifiedAt: d.status === 'VERIFIED' ? d.uploadedAt : null,
  rejectedAt: null,
  rejectReason: null,
  createdAt: d.uploadedAt,
  updatedAt: d.uploadedAt,
  deletedAt: null,
}));

export const schemaDeployments: readonly SchemaDeployment[] = deployments.map((d) => ({
  id: d.id,
  organizationId: ORG_ID,
  candidateId: d.candidateId,
  candidateName: d.candidateName,
  clientId: d.clientId,
  clientName: d.clientName,
  createdById: 2,
  createdByName: 'Rachel Kim',
  status: d.status,
  placementType: d.placementType,
  roleTitle: d.title,
  startDate: d.startDate,
  endDate: d.endDate,
  billingRate: d.billRate,
  payRate: d.payRate,
  currency: d.currency,
  workLocation: 'Remote',
  notes: `Contract placement — ${d.hoursPerWeek} hrs/week.`,
  terminatedAt: (d.status as string) === 'TERMINATED' ? d.endDate : null,
  terminateReason: (d.status as string) === 'TERMINATED' ? 'Contract ended per SOW.' : null,
  createdAt: TS,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export const schemaTrialRequests: readonly SchemaTrialRequest[] = trials.map((t) => ({
  id: t.id,
  organizationId: ORG_ID,
  candidateId: t.candidateId,
  candidateName: t.candidateName,
  clientId: t.clientId,
  clientName: t.clientName,
  deploymentId: t.status === 'COMPLETED' ? t.id : null,
  requestedById: 6,
  requestedByName: t.recruiter,
  status:
    t.status === 'SCHEDULED'
      ? 'APPROVED'
      : t.status === 'EXTENDED'
        ? 'IN_PROGRESS'
        : t.status === 'REQUESTED'
          ? 'REQUESTED'
          : t.status === 'CANCELLED'
            ? 'CANCELLED'
            : t.status === 'COMPLETED'
              ? 'COMPLETED'
              : 'IN_PROGRESS',
  roleTitle: t.title,
  startDate: t.startDate,
  endDate: t.endDate,
  durationDays: 14,
  feedback: t.feedback,
  outcome: t.status === 'COMPLETED' ? 'Converted to deployment' : null,
  approvedAt: t.status !== 'REQUESTED' ? t.startDate + 'T09:00:00Z' : null,
  rejectedAt: t.status === 'CANCELLED' ? t.endDate + 'T17:00:00Z' : null,
  rejectReason: t.status === 'CANCELLED' ? t.feedback : null,
  createdAt: TS,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export const schemaInterviewRequests: readonly SchemaInterviewRequest[] = interviews.map((i) => ({
  id: i.id,
  organizationId: ORG_ID,
  candidateId: i.candidateId,
  candidateName: i.candidateName,
  clientId: i.clientId,
  clientName: i.clientName,
  shortlistId: i.id <= 3 ? 1 : null,
  requestedById: 8,
  requestedByName: 'Client User',
  assignedToId: 2,
  assignedToName: i.interviewer,
  type: i.type,
  status: i.status,
  scheduledAt: i.scheduledAt,
  durationMinutes: i.durationMinutes,
  timezone: 'America/New_York',
  location: (i.type as string) === 'IN_PERSON' ? 'Client HQ' : null,
  meetingLink: i.meetingUrl,
  notes: i.notes,
  feedback: i.status === 'COMPLETED' ? 'Strong performance in technical round.' : null,
  completedAt: i.status === 'COMPLETED' ? i.scheduledAt : null,
  cancelledAt: (i.status as string) === 'CANCELLED' ? TS_UPD : null,
  cancelReason: (i.status as string) === 'CANCELLED' ? 'Schedule conflict' : null,
  createdAt: TS,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export const schemaEvaluations: readonly SchemaEvaluation[] = evaluations.map((e) => ({
  id: e.id,
  organizationId: ORG_ID,
  candidateId: e.candidateId,
  candidateName: e.candidateName,
  clientId: e.id % 2 === 0 ? 1 : null,
  clientName: e.id % 2 === 0 ? 'Stripe' : null,
  evaluatorId: 2,
  evaluatorName: e.evaluatorName,
  status: e.status,
  recommendation: e.recommendation,
  overallScore: e.overallScore,
  technicalScore: e.technicalScore,
  softSkillScore: e.communicationScore,
  summary: e.notes,
  strengths: e.recommendation === 'STRONG_HIRE' ? 'Deep technical expertise, strong communication.' : null,
  weaknesses: (e.recommendation as string) === 'NO_HIRE' ? 'Gap in required cloud experience.' : null,
  evaluatedAt: e.completedAt,
  createdAt: TS,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export const schemaBackgroundChecks: readonly SchemaBackgroundCheck[] = backgroundChecks.map((b) => ({
  id: b.id,
  organizationId: ORG_ID,
  candidateId: b.candidateId,
  candidateName: b.candidateName,
  requestedById: 2,
  requestedByName: b.requestedBy,
  type: b.type,
  status: b.status === 'CLEAR' ? 'CLEAR' : b.status,
  provider: b.provider,
  externalReferenceId: `CHK-${b.id}-${b.candidateId}`,
  resultSummary: b.status === 'CLEAR' ? 'All checks passed.' : null,
  initiatedAt: b.requestedAt,
  completedAt: b.completedAt,
  expiresAt: b.completedAt ? '2027-06-01T00:00:00Z' : null,
  createdAt: b.requestedAt,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export const schemaShortlists: readonly SchemaShortlist[] = shortlists.map((s) => ({
  id: s.id,
  organizationId: ORG_ID,
  clientId: s.clientId,
  clientName: s.clientName,
  createdById: 2,
  createdByName: s.createdBy,
  title: s.title,
  description: `Shortlist for ${s.jobTitle}`,
  status: s.status,
  roleTitle: s.jobTitle,
  dueDate: '2026-08-01',
  closedAt: s.status === 'CLOSED' ? TS_UPD : null,
  createdAt: s.createdAt,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export const schemaUsers: readonly SchemaUser[] = users.map((u) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.id <= 4 ? `+1 (415) 555-${String(3000 + u.id).slice(-4)}` : null,
  isActive: u.isActive,
  lastLoginAt: u.lastLoginAt,
  createdAt: '2025-06-01T08:00:00Z',
  updatedAt: TS_UPD,
  deletedAt: null,
  role: u.role,
  organizationId: u.organizationId,
  photoUrl: u.photoUrl,
}));

export const schemaOrganizations: readonly SchemaOrganization[] = organizations.map((o) => ({
  id: o.id,
  name: o.name,
  slug: o.slug,
  isActive: o.isActive,
  createdAt: o.createdAt,
  updatedAt: TS_UPD,
  deletedAt: null,
  memberCount: o.memberCount,
  clientCount: o.clientCount,
  candidateCount: o.candidateCount,
}));

export const schemaAuditLogs: readonly SchemaAuditLog[] = auditLogs.map((a) => ({
  id: a.id,
  organizationId: ORG_ID,
  actorId: 2,
  actorName: a.actorName,
  action: a.action,
  resourceType: a.entityType,
  resourceId: a.entityId,
  description: a.summary,
  metadata: { ipAddress: a.ipAddress },
  ipAddress: a.ipAddress,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  createdAt: a.createdAt,
}));

export const schemaNotifications: readonly SchemaNotification[] = notifications.map((n) => ({
  id: n.id,
  organizationId: ORG_ID,
  userId: n.userId,
  type: n.type,
  channel: n.channel,
  status: n.status,
  title: n.title,
  body: n.message,
  actionUrl: '/recruiter/candidates',
  metadata: null,
  sentAt: n.status !== 'PENDING' ? n.createdAt : null,
  readAt: n.readAt,
  failedAt: (n.status as string) === 'FAILED' ? n.createdAt : null,
  failureReason: (n.status as string) === 'FAILED' ? 'SMTP timeout' : null,
  createdAt: n.createdAt,
  updatedAt: TS_UPD,
  deletedAt: null,
}));

export function getSchemaDocumentsForCandidate(candidateId: number) {
  return schemaDocuments.filter(
    (d) => d.entityId === candidateId || (d.entityType === 'CANDIDATE' && d.entityId === candidateId),
  );
}

export function getSchemaEvaluationsForCandidate(candidateId: number) {
  return schemaEvaluations.filter((e) => e.candidateId === candidateId);
}

export function getSchemaBackgroundChecksForCandidate(candidateId: number) {
  return schemaBackgroundChecks.filter((b) => b.candidateId === candidateId);
}

export function getSchemaDeploymentsForCandidate(candidateId: number) {
  return schemaDeployments.filter((d) => d.candidateId === candidateId);
}

export function getSchemaTrialsForCandidate(candidateId: number) {
  return schemaTrialRequests.filter((t) => t.candidateId === candidateId);
}

export function getSchemaInterviewsForCandidate(candidateId: number) {
  return schemaInterviewRequests.filter((i) => i.candidateId === candidateId);
}
