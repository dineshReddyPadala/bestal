import type { ClientSearchRecord } from '@bestal/mock-data';
import type { AvailabilityCategory } from '@bestal/mock-data';
import type { CandidateListItem } from './api/types';

function availabilityCategory(
  status: string | null | undefined,
): AvailabilityCategory {
  switch (status) {
    case 'AVAILABLE':
      return 'IMMEDIATE';
    case 'NOTICE_PERIOD':
      return 'WITHIN_2_WEEKS';
    case 'ENGAGED':
    case 'UNAVAILABLE':
      return 'NOT_AVAILABLE';
    default:
      return 'IMMEDIATE';
  }
}

export function mapApiCandidateToClientSearchRecord(
  candidate: CandidateListItem,
): ClientSearchRecord {
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const role =
    candidate.primaryRole ?? candidate.headline ?? 'Technology Consultant';
  const skill = candidate.primarySkillCommunityName;
  const rate = candidate.clientBillRate ?? 0;
  const bgv = candidate.bgvStatus ?? 'NOT_STARTED';
  const evaluation = candidate.evaluationStatus ?? 'NOT_STARTED';

  return {
    id: candidate.id,
    photoUrl: '',
    displayName: candidate.firstName,
    fullName,
    role,
    yearsExperience: candidate.yearsExperience ?? 0,
    community: skill ?? 'General',
    topSkills: skill ? [skill] : [],
    bestalScore: candidate.bestalScore ?? 0,
    availability: candidate.availabilityStatus ?? 'Available',
    availabilityCategory: availabilityCategory(candidate.availabilityStatus),
    timezone: candidate.timezoneOverlap ?? 'Flexible',
    hourlyRate: rate,
    currency: candidate.currency ?? 'USD',
    evaluationStatus: evaluation,
    bgvStatus: bgv,
    trialEligible: bgv === 'CLEAR' && evaluation === 'COMPLETED',
    headline: candidate.headline ?? '',
    location: candidate.location ?? '',
    skillNames: skill ? [skill] : [],
  };
}
