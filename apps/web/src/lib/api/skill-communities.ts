import { apiGet } from './client';
import type { SkillCommunityListItem } from './types';

export async function listSkillCommunities(): Promise<SkillCommunityListItem[]> {
  return apiGet<SkillCommunityListItem[]>('/skill-communities');
}
