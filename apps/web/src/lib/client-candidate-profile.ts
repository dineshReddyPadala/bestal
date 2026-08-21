import type { ClientCandidateProfile, ClientGroupedSkill } from '@bestal/mock-data';
import type { CandidateDto } from './api/types';
import { isTrialEligible } from './candidate-approval-gates';

function splitLines(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n|;,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapSkills(candidate: CandidateDto): {
  primary: ClientGroupedSkill[];
  secondary: ClientGroupedSkill[];
} {
  const skills = (candidate.skills ?? []).map((s) => ({
    skillCommunityName: s.skillCommunityName || s.skillName || 'Skill',
    skillName: s.skillName,
    proficiencyLevel: s.proficiencyLevel,
    yearsExperience: s.yearsExperience,
    isPrimary: s.isPrimary,
  }));
  return {
    primary: skills.filter((s) => s.isPrimary),
    secondary: skills.filter((s) => !s.isPrimary),
  };
}

/** Maps a live CandidateDto to the client profile view shape (already server-redacted). */
export function mapCandidateDtoToClientProfile(
  candidate: CandidateDto,
): ClientCandidateProfile {
  const { primary, secondary } = mapSkills(candidate);
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const billRate = candidate.clientBillRate ?? candidate.expectedRate ?? 0;
  const evaluationStatus = candidate.evaluationStatus ?? 'NOT_STARTED';
  const bgvStatus = candidate.bgvStatus ?? 'NOT_STARTED';

  return {
    candidateId: candidate.id,
    photoUrl: candidate.profileImage?.url ?? '',
    displayName: candidate.displayName ?? candidate.firstName,
    fullName,
    role: candidate.primaryRole ?? candidate.headline ?? 'Technology Consultant',
    location: candidate.location ?? '',
    yearsExperience: candidate.yearsExperience ?? 0,
    currentCompany: candidate.currentCompany ?? '',
    currentTitle: candidate.currentTitle ?? '',
    primarySkillCommunityName:
      candidate.primarySkillCommunityName ?? primary[0]?.skillCommunityName ?? '',
    education: candidate.education ?? '',
    bestalScore: candidate.bestalScore ?? 0,
    availability: candidate.availabilityStatus ?? 'Available',
    billRate,
    currency: candidate.currency ?? 'USD',
    clientAiSummary:
      candidate.aiSummary ?? candidate.clientProfileSummary ?? candidate.summary ?? '',
    strengths: splitLines(candidate.strengths),
    industryExperience: [],
    projects: [],
    primarySkills: primary,
    secondarySkills: secondary,
    evaluation: {
      technical: candidate.technicalScore ?? null,
      communication: candidate.communicationScore ?? null,
      collaborationCulturalFit: candidate.collaborationCulturalFitScore ?? null,
      clientReadinessScore: candidate.clientReadinessScore ?? null,
      summary:
        candidate.aiEvaluationSummary?.trim() ||
        candidate.evaluationSummary?.trim() ||
        null,
      recommendation: candidate.evaluationRecommendation ?? null,
      status: evaluationStatus,
    },
    bgv: {
      status: bgvStatus,
      completedChecks: [],
      summary: candidate.bgvSummary ?? '',
    },
    availabilityDetail: {
      hoursMin: candidate.minHoursPerWeek ?? 20,
      hoursMax: candidate.maxHoursPerWeek ?? 40,
      timezone: candidate.timezoneOverlap ?? 'Flexible',
      availability: candidate.availabilityStatus ?? 'Available',
      startDate: candidate.availableFrom ?? '',
    },
    trialEligible: isTrialEligible({
      evaluationStatus,
      bgvStatus,
      visibility: candidate.visibility,
      approvalStatus: candidate.approvalStatus,
    }),
  };
}
