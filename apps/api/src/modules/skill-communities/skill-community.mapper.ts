type SkillCommunityIconRow = {
  iconUrl: string | null;
  icon?: { url: string; deletedAt: Date | null } | null;
};

export function resolveSkillCommunityIconUrl(row: SkillCommunityIconRow): string | null {
  const fromIcon =
    row.icon && row.icon.deletedAt == null && row.icon.url !== 'pending' ? row.icon.url : null;
  const url = fromIcon ?? row.iconUrl;
  if (!url || url === 'pending') return null;
  return url;
}
