import type { ClientSearchRecord } from '@bestal/mock-data';
import type { AvailabilityCategory } from '@bestal/mock-data';
import type { CandidateListItem } from './api/types';
import { isTrialEligible } from './candidate-approval-gates';

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
      return 'NOT_AVAILABLE';
  }
}

export function mapApiCandidateToClientSearchRecord(
  candidate: CandidateListItem,
): ClientSearchRecord {
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const role =
    candidate.primaryRole ?? candidate.headline ?? 'Technology Consultant';
  const skill = candidate.primarySkillCommunityName;
  const rate = candidate.clientBillRate;

  return {
    id: candidate.id,
    photoUrl: candidate.profileImageUrl?.trim() || '',
    displayName: candidate.firstName,
    fullName,
    role,
    yearsExperience: candidate.yearsExperience ?? null,
    community: skill ?? 'General',
    primarySkillCommunityName: skill ?? '',
    topSkills: skill ? [skill] : [],
    bestalScore: candidate.bestalScore ?? null,
    availability: candidate.availabilityStatus ?? 'Available',
    availabilityCategory: availabilityCategory(candidate.availabilityStatus),
    timezone: candidate.timezoneOverlap ?? 'Flexible',
    hourlyRate: rate != null && rate > 0 ? rate : null,
    currency: candidate.currency ?? 'USD',
    evaluationStatus: candidate.evaluationStatus ?? 'NOT_STARTED',
    bgvStatus: candidate.bgvStatus ?? 'NOT_STARTED',
    trialEligible: isTrialEligible({
      evaluationStatus: candidate.evaluationStatus ?? 'NOT_STARTED',
      bgvStatus: candidate.bgvStatus ?? 'NOT_STARTED',
      visibility: candidate.visibility,
      approvalStatus: candidate.approvalStatus,
    }),
    headline: candidate.headline ?? '',
    location: candidate.location ?? '',
    skillNames: skill ? [skill] : [],
    currentCompany: candidate.currentCompany ?? '',
    currentTitle: candidate.currentTitle ?? '',
  };
}
