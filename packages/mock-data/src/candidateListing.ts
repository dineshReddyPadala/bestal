import { backgroundChecks } from './backgroundChecks.js';
import { candidateAvailability } from './availability.js';
import { candidateScores } from './candidateScores.js';
import { candidates } from './candidates.js';
import { deployments } from './deployments.js';
import { evaluations } from './evaluations.js';
import { candidatePricing } from './pricing.js';

export type AvailabilityCategory =
  | 'IMMEDIATE'
  | 'WITHIN_2_WEEKS'
  | 'WITHIN_30_DAYS'
  | 'WITHIN_60_DAYS'
  | 'NOT_AVAILABLE';

export type CandidateListRecord = {
  readonly id: number;
  readonly photoUrl: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly role: string;
  readonly community: string;
  readonly primarySkill: string;
  readonly yearsExperience: number;
  readonly currentCompany: string;
  readonly bestalScore: number;
  readonly availability: string;
  readonly availabilityCategory: AvailabilityCategory;
  readonly timezone: string;
  readonly billRate: number;
  readonly currency: string;
  readonly evaluationStatus: string;
  readonly bgvStatus: string;
  readonly profileStatus: string;
  readonly visibility: string;
  readonly deploymentStatus: string;
  readonly approvalStatus: string;
  readonly createdAt: string;
  readonly email: string;
  readonly headline: string;
  readonly location: string;
};

const AVAILABILITY_LABELS: Record<AvailabilityCategory, string> = {
  IMMEDIATE: 'Immediate',
  WITHIN_2_WEEKS: 'Within 2 weeks',
  WITHIN_30_DAYS: 'Within 30 days',
  WITHIN_60_DAYS: 'Within 60 days',
  NOT_AVAILABLE: 'Not available',
};

const CURRENT_COMPANY: Record<number, string> = {
  1: 'Plaid',
  2: 'Coinbase',
  3: 'Spotify',
  4: 'Rappi',
  5: 'Airbnb',
  6: 'Deloitte Cyber',
  7: 'Shopify',
  8: 'Google',
  9: 'HubSpot',
  10: 'Meta',
  11: 'Between roles',
  12: 'ConsenSys',
};

const CREATED_AT: Record<number, string> = {
  1: '2025-11-08T10:30:00Z',
  2: '2025-12-02T14:00:00Z',
  3: '2026-01-15T09:00:00Z',
  4: '2026-02-20T11:45:00Z',
  5: '2025-10-05T08:00:00Z',
  6: '2026-03-01T16:20:00Z',
  7: '2026-01-28T13:00:00Z',
  8: '2026-04-10T10:15:00Z',
  9: '2026-02-14T15:30:00Z',
  10: '2025-12-18T09:45:00Z',
  11: '2026-06-22T08:00:00Z',
  12: '2026-05-08T12:00:00Z',
};

const REFERENCE_DATE = new Date('2026-06-30T12:00:00Z');

function parseRole(headline: string): string {
  const part = headline.split('|')[0]?.trim() ?? headline;
  return part.length > 48 ? `${part.slice(0, 45)}…` : part;
}

function displayName(first: string, last: string): string {
  return `${first} ${last.charAt(0)}.`;
}

function categorizeAvailability(
  availableFrom: string,
  noticePeriodDays: number,
): AvailabilityCategory {
  const start = new Date(availableFrom);
  const daysUntil = Math.ceil((start.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0 || noticePeriodDays <= 7) return 'IMMEDIATE';
  if (daysUntil <= 14) return 'WITHIN_2_WEEKS';
  if (daysUntil <= 30) return 'WITHIN_30_DAYS';
  if (daysUntil <= 60) return 'WITHIN_60_DAYS';
  return 'NOT_AVAILABLE';
}

function latestEvaluationStatus(candidateId: number): string {
  const evals = evaluations.filter((e) => e.candidateId === candidateId);
  if (evals.length === 0) return 'NOT_STARTED';
  const latest = evals.reduce((a, b) => (a.id > b.id ? a : b));
  return latest.status;
}

function latestBgvStatus(candidateId: number): string {
  const checks = backgroundChecks.filter((b) => b.candidateId === candidateId);
  if (checks.length === 0) return 'NOT_STARTED';
  const priority = ['IN_PROGRESS', 'PENDING', 'CONSIDER', 'FAILED', 'CLEAR', 'NOT_STARTED'];
  const sorted = [...checks].sort(
    (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status),
  );
  return sorted[0]?.status ?? 'NOT_STARTED';
}

function deploymentStatusFor(candidateId: number): string {
  const active = deployments.find(
    (d) => d.candidateId === candidateId && (d.status === 'ACTIVE' || d.status === 'ON_HOLD' || d.status === 'PENDING'),
  );
  if (active) return active.status;
  const any = deployments.find((d) => d.candidateId === candidateId);
  return any?.status ?? 'NOT_DEPLOYED';
}

function buildRecord(base: (typeof candidates)[number]): CandidateListRecord {
  const primary = base.skills.find((s) => s.isPrimary);
  const availability = candidateAvailability.find((a) => a.candidateId === base.id);
  const pricing = candidatePricing.find((p) => p.candidateId === base.id);
  const category = categorizeAvailability(
    availability?.availableFrom ?? base.availableFrom,
    availability?.noticePeriodDays ?? 14,
  );

  return {
    id: base.id,
    photoUrl: base.photoUrl,
    displayName: displayName(base.firstName, base.lastName),
    fullName: `${base.firstName} ${base.lastName}`,
    role: parseRole(base.headline),
    community: primary?.skillCommunityName ?? 'Unassigned',
    primarySkill: primary?.skillCommunityName ?? 'General',
    yearsExperience: base.yearsExperience,
    currentCompany: CURRENT_COMPANY[base.id] ?? 'Independent',
    bestalScore: candidateScores[base.id] ?? 0,
    availability: AVAILABILITY_LABELS[category],
    availabilityCategory: category,
    timezone: availability?.timezone ?? 'America/New_York',
    billRate: pricing?.billRate ?? base.expectedRate,
    currency: pricing?.currency ?? base.currency,
    evaluationStatus: latestEvaluationStatus(base.id),
    bgvStatus: latestBgvStatus(base.id),
    profileStatus: base.status,
    visibility: base.visibility,
    deploymentStatus: deploymentStatusFor(base.id),
    approvalStatus: base.approvalStatus,
    createdAt: CREATED_AT[base.id] ?? '2026-05-01T10:00:00Z',
    email: base.email,
    headline: base.headline,
    location: base.location,
  };
}

export const candidateListingRecords: readonly CandidateListRecord[] = candidates.map(buildRecord);

export const candidateListingCommunities = [
  ...new Set(candidateListingRecords.map((r) => r.community)),
].sort();

export const candidateListingSkills = [
  ...new Set(candidateListingRecords.map((r) => r.primarySkill)),
].sort();

export const candidateListingTimezones = [
  ...new Set(candidateListingRecords.map((r) => r.timezone)),
].sort();

export function getCandidateListRecord(id: number): CandidateListRecord | undefined {
  return candidateListingRecords.find((r) => r.id === id);
}
