import type { SkillCommunityListItem } from '../types';
import type { CandidateWizardFormValues } from '../../../components/forms/candidate-wizard-schema';
import { mergeWizardSkills } from '../../../components/forms/candidate-wizard-schema';
import type { ResumeExtractionResponse } from './resume-extraction.types';

function matchSkillCommunityId(
  skillName: string,
  communities: SkillCommunityListItem[],
): number | undefined {
  const normalized = skillName.toLowerCase().trim();
  if (!normalized) return undefined;

  const exact = communities.find((c) => c.name.toLowerCase() === normalized);
  if (exact) return exact.id;

  const partial = communities.find(
    (c) =>
      normalized.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(normalized),
  );
  return partial?.id;
}

function formatEducation(extraction: ResumeExtractionResponse): string {
  if (extraction.education.length > 0) {
    return extraction.education
      .map((entry) =>
        [entry.degree, entry.fieldOfStudy, entry.institution, entry.graduationYear]
          .filter((part) => part != null && part !== '')
          .join(', '),
      )
      .join('; ');
  }
  return extraction.rawSections?.education?.trim() ?? '';
}

function formatExperienceNotes(extraction: ResumeExtractionResponse): string {
  const snippets = extraction.experience
    .slice(0, 3)
    .map((job) => {
      const range = [job.startDate, job.endDate ?? 'Present'].filter(Boolean).join(' – ');
      return `${job.title} @ ${job.company}${range ? ` (${range})` : ''}`;
    });
  return snippets.join('\n');
}

/** Map unified AI extraction + screening response into wizard form defaults. */
export function applyResumeExtractionToWizardForm(
  extraction: ResumeExtractionResponse,
  skillCommunities: SkillCommunityListItem[],
  fileName: string,
): Partial<CandidateWizardFormValues> {
  const c = extraction.candidate;
  const latestJob = extraction.experience[0];
  const fallbackCommunityId = skillCommunities[0]?.id;

  const communityIdFromExtraction = extraction.community
    ? matchSkillCommunityId(extraction.community, skillCommunities)
    : undefined;

  const mappedSkills = extraction.skills
    .map((skill, index) => {
      const skillCommunityId =
        communityIdFromExtraction ??
        matchSkillCommunityId(skill.name, skillCommunities) ??
        fallbackCommunityId;
      if (!skillCommunityId) return null;
      return {
        skillCommunityId,
        proficiencyLevel: skill.proficiencyLevel,
        yearsExperience: skill.yearsExperience ?? undefined,
        isPrimary: skill.isPrimary || index === 0,
        notes: skill.name,
      };
    })
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null);

  const primarySkill =
    extraction.skills.find((skill) => skill.isPrimary) ?? extraction.skills[0];
  const primarySkillCommunityId =
    communityIdFromExtraction ??
    (primarySkill
      ? matchSkillCommunityId(primarySkill.name, skillCommunities) ?? fallbackCommunityId
      : mappedSkills[0]?.skillCommunityId);

  const summary =
    extraction.aiSummary?.trim() ||
    c.summary?.trim() ||
    extraction.rawSections?.summary?.trim() ||
    '';
  const experienceNotes = formatExperienceNotes(extraction);
  const today = new Date().toISOString().slice(0, 10);

  return {
    firstName: c.firstName?.trim() ?? '',
    lastName: c.lastName?.trim() ?? '',
    email: c.email?.trim() ?? '',
    phone: c.phone?.trim() ?? '',
    location: c.location?.trim() ?? '',
    linkedinUrl: c.linkedinUrl?.trim() ?? '',
    headline:
      c.headline?.trim() ||
      extraction.primaryRole?.trim() ||
      latestJob?.title?.trim() ||
      '',
    primaryRole:
      extraction.primaryRole?.trim() ||
      latestJob?.title?.trim() ||
      c.headline?.trim() ||
      '',
    currentCompany: latestJob?.company?.trim() ?? '',
    education: formatEducation(extraction),
    summary,
    aiSummary: summary,
    clientProfileSummary: summary,
    strengths: extraction.strengths?.trim() || extraction.rawSections?.skills?.trim() || '',
    weaknesses: extraction.weaknesses?.trim() || '',
    yearsExperience: c.yearsExperience ?? undefined,
    primarySkillCommunityId: primarySkillCommunityId ?? undefined,
    bestalScore: extraction.bestalScore ?? undefined,
    billRate: extraction.recommendedClientRate ?? undefined,
    payRate: extraction.recommendedCandidateRate ?? undefined,
    expectedRate: extraction.recommendedCandidateRate ?? undefined,
    profileStatus: 'AI_SCREENED',
    skills:
      mappedSkills.length > 0
        ? mergeWizardSkills(mappedSkills)
        : fallbackCommunityId
          ? [
              {
                skillCommunityId: fallbackCommunityId,
                proficiencyLevel: 'INTERMEDIATE' as const,
                yearsExperience: c.yearsExperience ?? undefined,
                isPrimary: true,
                notes: '',
              },
            ]
          : undefined,
    availableFrom: today,
    availabilityStatus: 'IMMEDIATE',
    availabilityNotes: [
      experienceNotes,
      extraction.seniority ? `Seniority: ${extraction.seniority}` : '',
      extraction.riskFlags ? `Risk flags: ${extraction.riskFlags}` : '',
    ]
      .filter(Boolean)
      .join('\n') || undefined,
    resumeFileName: fileName,
    displayName: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || undefined,
  };
}
