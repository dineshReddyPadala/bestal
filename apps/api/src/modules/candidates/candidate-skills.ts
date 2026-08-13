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

/** One row per skill name — merges duplicate skill labels. */
export function normalizeCandidateSkills(
  skills: CreateCandidateSkillInput[] | undefined,
): CreateCandidateSkillInput[] | undefined {
  if (!skills?.length) {
    return skills;
  }

  const byName = new Map<string, CreateCandidateSkillInput>();

  for (const skill of skills) {
    const label = skillLabel(skill);
    if (!label) {
      continue;
    }
    const key = label.toLowerCase();
    const existing = byName.get(key);

    if (!existing) {
      byName.set(key, {
        ...skill,
        skillName: label.slice(0, 150),
      });
      continue;
    }

    const mergedLabel = mergeSkillNames(existing.skillName, label);
    const existingRank = PROFICIENCY_RANK[existing.proficiencyLevel ?? 'INTERMEDIATE'];
    const incomingRank = PROFICIENCY_RANK[skill.proficiencyLevel ?? 'INTERMEDIATE'];

    byName.set(key, {
      ...existing,
      skillName: mergedLabel || existing.skillName,
      skillCommunityId: existing.skillCommunityId ?? skill.skillCommunityId,
      skillCategory: existing.skillCategory ?? skill.skillCategory,
      notes: [existing.notes, skill.notes].filter(Boolean).join('; ').slice(0, 5000) || undefined,
      isPrimary: existing.isPrimary || skill.isPrimary,
      yearsExperience: Math.max(existing.yearsExperience ?? 0, skill.yearsExperience ?? 0) || undefined,
      proficiencyLevel:
        incomingRank > existingRank
          ? skill.proficiencyLevel ?? existing.proficiencyLevel
          : existing.proficiencyLevel,
    });
  }

  return [...byName.values()];
}

export function assertUniqueSkillCommunities(
  skills: CreateCandidateSkillInput[] | undefined,
): void {
  if (!skills?.length) {
    return;
  }

  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const skill of skills) {
    const key = skillLabel(skill).toLowerCase();
    if (!key) continue;
    if (seen.has(key)) {
      duplicates.push(key);
    }
    seen.add(key);
  }

  if (duplicates.length > 0) {
    throw new BadRequestError(
      'Each skill name can only appear once per candidate. Remove duplicate skills or merge them into a single entry.',
    );
  }
}

/**
 * Normalize skills for persistence — dedupe by skill name only.
 * Multiple technologies (React, Node.js) under the same community are kept as separate rows.
 */
export function normalizeSkillsForPersistence(
  skills: CreateCandidateSkillInput[] | undefined,
): CreateCandidateSkillInput[] | undefined {
  return normalizeCandidateSkills(skills);
}
