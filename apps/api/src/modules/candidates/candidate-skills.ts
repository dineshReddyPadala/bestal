import type { ProficiencyLevel } from '@prisma/client';
import { BadRequestError } from '../../utils/index.js';
import type { CreateCandidateSkillInput } from './candidate.types.js';

const PROFICIENCY_RANK: Record<ProficiencyLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

function skillLabel(skill: CreateCandidateSkillInput): string {
  return skill.skillName?.trim() || skill.notes?.trim() || '';
}

function mergeSkillNames(existing: string | undefined, incoming: string): string {
  const parts = [...(existing ? existing.split(/,\s*/) : []), ...incoming.split(/,\s*/)]
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(parts)].join(', ').slice(0, 150);
}

/** One row per skill community — merges duplicate community entries. */
export function normalizeCandidateSkills(
  skills: CreateCandidateSkillInput[] | undefined,
): CreateCandidateSkillInput[] | undefined {
  if (!skills?.length) {
    return skills;
  }

  const byCommunity = new Map<number, CreateCandidateSkillInput>();

  for (const skill of skills) {
    const label = skillLabel(skill);
    const existing = byCommunity.get(skill.skillCommunityId);

    if (!existing) {
      byCommunity.set(skill.skillCommunityId, {
        ...skill,
        skillName: label || skill.skillName,
      });
      continue;
    }

    const mergedLabel = mergeSkillNames(existing.skillName, label);
    const existingRank = PROFICIENCY_RANK[existing.proficiencyLevel ?? 'INTERMEDIATE'];
    const incomingRank = PROFICIENCY_RANK[skill.proficiencyLevel ?? 'INTERMEDIATE'];

    byCommunity.set(skill.skillCommunityId, {
      ...existing,
      skillName: mergedLabel || existing.skillName,
      notes: [existing.notes, skill.notes].filter(Boolean).join('; ').slice(0, 5000) || undefined,
      isPrimary: existing.isPrimary || skill.isPrimary,
      yearsExperience: Math.max(existing.yearsExperience ?? 0, skill.yearsExperience ?? 0) || undefined,
      proficiencyLevel:
        incomingRank > existingRank
          ? skill.proficiencyLevel ?? existing.proficiencyLevel
          : existing.proficiencyLevel,
    });
  }

  return [...byCommunity.values()];
}

export function assertUniqueSkillCommunities(
  skills: CreateCandidateSkillInput[] | undefined,
): void {
  if (!skills?.length) {
    return;
  }

  const seen = new Set<number>();
  const duplicates: number[] = [];

  for (const skill of skills) {
    if (seen.has(skill.skillCommunityId)) {
      duplicates.push(skill.skillCommunityId);
    }
    seen.add(skill.skillCommunityId);
  }

  if (duplicates.length > 0) {
    throw new BadRequestError(
      'Each skill community can only appear once per candidate. Remove duplicate skill communities or merge skills into a single entry.',
    );
  }
}
