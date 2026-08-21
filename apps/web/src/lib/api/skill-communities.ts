import { apiGet, apiRequest } from './client';
import type { SkillCommunityListItem } from './types';

export async function listSkillCommunities(): Promise<SkillCommunityListItem[]> {
  return apiGet<SkillCommunityListItem[]>('/skill-communities');
}

/** Public marketing endpoint — no auth required. */
export async function listPublicSkillCommunities(): Promise<SkillCommunityListItem[]> {
  const json = await apiRequest<{ data: SkillCommunityListItem[] }>('/public/skill-communities', {
    auth: false,
  });
  return json.data;
}
