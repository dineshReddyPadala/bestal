import type { SkillCommunityListItem } from '../lib/api/types';
import skillCommunitiesData from './skill-communities.json';

export type SkillCommunityOtherItem = {
  name: string;
  description: string;
};

type SkillCommunitiesFile = {
  heroOrbitPills: string[];
  communities: SkillCommunityListItem[];
  othersCommunities: SkillCommunityOtherItem[];
};

const data = skillCommunitiesData as SkillCommunitiesFile;

export const PUBLIC_SKILL_COMMUNITIES: SkillCommunityListItem[] = data.communities;

export const SKILL_COMMUNITY_ORBIT_PILLS: readonly string[] = data.heroOrbitPills;

export const SKILL_COMMUNITY_OTHERS: SkillCommunityOtherItem[] = data.othersCommunities;
