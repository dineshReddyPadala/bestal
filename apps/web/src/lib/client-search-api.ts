import type { ClientSearchRecord } from '@bestal/mock-data';
import type { CandidateListItem } from './api/types';

export function mapApiCandidateToClientSearchRecord(
  candidate: CandidateListItem,
): ClientSearchRecord {
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  return {
    id: candidate.id,
    photoUrl: '',
    displayName: candidate.firstName,
    fullName,
    role: candidate.headline ?? 'Technology Consultant',
    yearsExperience: candidate.yearsExperience ?? 0,
    community: candidate.primarySkillCommunityName ?? 'General',
    topSkills: candidate.primarySkillCommunityName ? [candidate.primarySkillCommunityName] : [],
    bestalScore: 0,
    availability: 'Available',
    availabilityCategory: 'IMMEDIATE' as const,
    timezone: 'US overlap',
    hourlyRate: 0,
    currency: 'USD',
    evaluationStatus: 'COMPLETED',
    bgvStatus: 'CLEAR',
    trialEligible: true,
    headline: candidate.headline ?? '',
    location: candidate.location ?? '',
    skillNames: candidate.primarySkillCommunityName ? [candidate.primarySkillCommunityName] : [],
  };
}
