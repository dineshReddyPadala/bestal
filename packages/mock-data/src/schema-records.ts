import { candidates } from './candidates.js';
import { clients } from './clients.js';
import { documents } from './documents.js';
import { users } from './users.js';
import type { MockCandidate, MockCandidateSkill } from './types.js';
import type { SchemaCandidate, SchemaCandidateSkill, SchemaClient } from './schema-types.js';

const ORG_ID = 1;
const TS = '2026-05-01T10:00:00Z';
const TS_UPD = '2026-06-15T14:30:00Z';

function toSkillRecord(
  candidateId: number,
  skill: MockCandidateSkill,
  idx: number,
): SchemaCandidateSkill {
  return {
    id: candidateId * 100 + idx,
    candidateId,
    skillCommunityId: skill.skillCommunityId,
    skillCommunityName: skill.skillCommunityName,
    proficiencyLevel: skill.proficiencyLevel,
    yearsExperience: skill.yearsExperience,
    isPrimary: skill.isPrimary,
    notes: skill.isPrimary ? 'Primary community for placement matching.' : null,
    createdAt: TS,
    updatedAt: TS_UPD,
    deletedAt: null,
  };
}

function enrichCandidate(base: MockCandidate): SchemaCandidate {
  const primary = base.skills.find((s) => s.isPrimary);
  const resumeDoc = documents.find((d) => d.candidateId === base.id && d.kind === 'RESUME');
  const approved = base.approvalStatus === 'APPROVED';
  const rejected = base.approvalStatus === 'REJECTED';

  return {
    id: base.id,
    organizationId: ORG_ID,
    primarySkillCommunityId: primary?.skillCommunityId ?? null,
    resumeDocumentId: resumeDoc?.id ?? null,
    profileImageDocumentId: base.id <= 6 ? base.id + 100 : null,
    introVideoDocumentId: base.id <= 3 ? base.id + 200 : null,
    firstName: base.firstName,
    lastName: base.lastName,
    email: base.email,
    phone: `+1 (415) 555-${String(1000 + base.id).slice(-4)}`,
    status: base.status,
    visibility: base.visibility,
    approvalStatus: base.approvalStatus,
    source: base.source,
    headline: base.headline,
    summary: base.summary,
    location: base.location,
    yearsExperience: base.yearsExperience,
    availableFrom: base.availableFrom,
    expectedRate: base.expectedRate,
    currency: base.currency,
    linkedinUrl: base.linkedinUrl,
    publishedAt: approved ? '2026-05-20T09:00:00Z' : null,
    hiddenAt: base.visibility === 'HIDDEN' ? '2026-06-01T12:00:00Z' : null,
    approvedAt: approved ? '2026-05-22T11:00:00Z' : null,
    approvedById: approved ? 2 : null,
    approvedByName: approved ? 'Rachel Kim' : null,
    rejectedAt: rejected ? '2026-06-10T16:00:00Z' : null,
    rejectedById: rejected ? 2 : null,
    rejectedByName: rejected ? 'Rachel Kim' : null,
    rejectionReason: rejected ? 'Incomplete evaluation documentation.' : null,
    createdAt: TS,
    updatedAt: TS_UPD,
    deletedAt: null,
    photoUrl: base.photoUrl,
    skills: base.skills.map((s, i) => toSkillRecord(base.id, s, i)),
  };
}

export const schemaCandidates: readonly SchemaCandidate[] = candidates.map(enrichCandidate);

export function getSchemaCandidate(id: number): SchemaCandidate | undefined {
  return schemaCandidates.find((c) => c.id === id);
}

const ACCOUNT_MANAGER_MAP: Record<number, { id: number; name: string }> = {
  1: { id: 2, name: 'Rachel Kim' },
  2: { id: 3, name: 'Tom Bradley' },
  3: { id: 4, name: 'Angela Torres' },
  4: { id: 2, name: 'Rachel Kim' },
  5: { id: 3, name: 'Tom Bradley' },
  6: { id: 5, name: 'Sarah Chen' },
  7: { id: 4, name: 'Angela Torres' },
};

export const schemaClients: readonly SchemaClient[] = clients.map((c) => {
  const mgr = ACCOUNT_MANAGER_MAP[c.id] ?? { id: 2, name: c.accountManager };
  const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: c.id,
    organizationId: ORG_ID,
    accountManagerId: mgr.id,
    accountManagerName: mgr.name,
    name: c.name,
    slug,
    status: c.status,
    industry: c.industry,
    website: c.website,
    contactEmail: `talent@${slug}.com`,
    contactPhone: `+1 (212) 555-${String(2000 + c.id).slice(-4)}`,
    addressLine1: `${100 + c.id * 10} Market Street`,
    addressLine2: c.id % 2 === 0 ? `Suite ${c.id * 100}` : null,
    city: c.location.split(',')[0]?.trim() ?? c.location,
    state: c.location.includes(',') ? c.location.split(',')[1]?.trim() ?? null : null,
    postalCode: `${94100 + c.id}`,
    country: 'US',
    notes: `Enterprise account — ${c.industry}. Primary contact via ${mgr.name}.`,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: TS_UPD,
    deletedAt: null,
    logoUrl: c.logoUrl,
    activeDeployments: c.activeDeployments,
    totalSpend: c.totalSpend,
  };
});

export function getSchemaClient(id: number): SchemaClient | undefined {
  return schemaClients.find((c) => c.id === id);
}

export function getSchemaUserName(userId: number): string {
  const u = users.find((x) => x.id === userId);
  return u ? `${u.firstName} ${u.lastName}` : 'Unknown';
}
