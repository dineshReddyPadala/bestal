import type { SkillCommunityListItem } from './api/types';

export function resolveSkillCommunityIconUrl(
  iconUrl: string | null | undefined,
): string | null {
  if (!iconUrl || iconUrl === 'pending') return null;
  return iconUrl;
}

export function pickSkillCommunityDisplayIcon(
  community: Pick<SkillCommunityListItem, 'iconUrl'>,
): string | null {
  return resolveSkillCommunityIconUrl(community.iconUrl);
}
