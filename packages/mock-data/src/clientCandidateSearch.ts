import { candidateListingRecords } from './candidateListing.js';
import { candidates } from './candidates.js';
import { evaluations } from './evaluations.js';
import { backgroundChecks } from './backgroundChecks.js';
import type { AvailabilityCategory } from './candidateListing.js';

export type ClientSearchRecord = {
  readonly id: number;
  readonly photoUrl: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly role: string;
  readonly yearsExperience: number;
  readonly community: string;
  readonly topSkills: readonly string[];
  readonly bestalScore: number;
  readonly availability: string;
  readonly availabilityCategory: AvailabilityCategory;
  readonly timezone: string;
  readonly hourlyRate: number;
  readonly currency: string;
  readonly evaluationStatus: string;
  readonly bgvStatus: string;
  readonly trialEligible: boolean;
  readonly headline: string;
  readonly location: string;
  readonly skillNames: readonly string[];
};

function evalStatus(id: number): string {
  const ev = evaluations.filter((e) => e.candidateId === id).sort((a, b) => b.id - a.id)[0];
  return ev?.status ?? 'NOT_STARTED';
}

function bgvStatus(id: number): string {
  const bgv = backgroundChecks.filter((b) => b.candidateId === id).sort((a, b) => b.id - a.id)[0];
  return bgv?.status ?? 'NOT_STARTED';
}

function isTrialEligible(
  candidateId: number,
  evaluationStatus: string,
  bgvStatus: string,
  profileStatus: string,
): boolean {
  if (profileStatus === 'PLACED' || profileStatus === 'DO_NOT_CONTACT') return false;
  const evalOk = ['COMPLETED'].includes(evaluationStatus);
  const bgvOk = ['CLEAR', 'NOT_STARTED'].includes(bgvStatus);
  return evalOk && bgvOk && candidateId !== 5;
}

function buildSearchRecord(listRec: (typeof candidateListingRecords)[number]): ClientSearchRecord {
  const cand = candidates.find((c) => c.id === listRec.id)!;
  const sortedSkills = [...cand.skills].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const evalSt = evalStatus(listRec.id);
  const bgvSt = bgvStatus(listRec.id);

  return {
    id: listRec.id,
    photoUrl: listRec.photoUrl,
    displayName: listRec.displayName,
    fullName: listRec.fullName,
    role: listRec.role,
    yearsExperience: listRec.yearsExperience,
    community: listRec.community,
    topSkills: sortedSkills.slice(0, 5).map((s) => s.skillCommunityName),
    bestalScore: listRec.bestalScore,
    availability: listRec.availability,
    availabilityCategory: listRec.availabilityCategory,
    timezone: listRec.timezone,
    hourlyRate: listRec.billRate,
    currency: listRec.currency,
    evaluationStatus: evalSt,
    bgvStatus: bgvSt,
    trialEligible: isTrialEligible(listRec.id, evalSt, bgvSt, listRec.profileStatus),
    headline: listRec.headline,
    location: listRec.location,
    skillNames: cand.skills.map((s) => s.skillCommunityName),
  };
}

/** Client-visible published & approved candidates for search. */
export function getClientSearchRecords(): readonly ClientSearchRecord[] {
  return candidateListingRecords
    .filter((r) => {
      const c = candidates.find((x) => x.id === r.id);
      return c?.visibility === 'PUBLISHED' && c?.approvalStatus === 'APPROVED';
    })
    .map(buildSearchRecord);
}

export const clientSearchRoles = [
  ...new Set(getClientSearchRecords().map((r) => r.role)),
].sort();

export const clientSearchSkills = [
  ...new Set(getClientSearchRecords().flatMap((r) => r.skillNames)),
].sort();

export const clientSearchCommunities = [
  ...new Set(getClientSearchRecords().map((r) => r.community)),
].sort();

export const clientSearchTimezones = [
  ...new Set(getClientSearchRecords().map((r) => r.timezone)),
].sort();
