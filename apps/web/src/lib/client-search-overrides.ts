import { candidateListingRecords, candidates, evaluations, backgroundChecks } from '@bestal/mock-data';
import type { ClientSearchRecord } from '@bestal/mock-data';
import { isClientVisible } from './candidate-approval-overrides';

function evalStatus(id: number): string {
  const evs = evaluations.filter((e) => e.candidateId === id);
  if (evs.length === 0) return 'NOT_STARTED';
  return evs.reduce((a, b) => (a.id > b.id ? a : b)).status;
}

function bgvStatus(id: number): string {
  const checks = backgroundChecks.filter((b) => b.candidateId === id);
  if (checks.length === 0) return 'NOT_STARTED';
  const priority = ['IN_PROGRESS', 'PENDING', 'CONSIDER', 'FAILED', 'CLEAR', 'NOT_STARTED'];
  return [...checks].sort((a, b) => priority.indexOf(a.status) - priority.indexOf(b.status))[0]
    ?.status ?? 'NOT_STARTED';
}

function isTrialEligible(
  evalSt: string,
  bgvSt: string,
  profileStatus: string,
): boolean {
  return evalSt === 'COMPLETED' && bgvSt === 'CLEAR' && profileStatus === 'ACTIVE';
}

/** Client search records respecting admin publish actions (session overrides). */
export function getClientSearchRecordsLive(): ClientSearchRecord[] {
  return candidateListingRecords
    .filter((r) => isClientVisible(r.id))
    .map((listRec) => {
      const cand = candidates.find((c) => c.id === listRec.id)!;
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
        topSkills: cand.skills.slice(0, 4).map((s) => s.skillCommunityName),
        bestalScore: listRec.bestalScore,
        availability: listRec.availability,
        availabilityCategory: listRec.availabilityCategory,
        timezone: listRec.timezone,
        hourlyRate: listRec.billRate,
        currency: listRec.currency,
        evaluationStatus: evalSt,
        bgvStatus: bgvSt,
        trialEligible: isTrialEligible(evalSt, bgvSt, listRec.profileStatus),
        headline: listRec.headline,
        location: listRec.location,
        skillNames: cand.skills.map((s) => s.skillCommunityName),
      };
    });
}
