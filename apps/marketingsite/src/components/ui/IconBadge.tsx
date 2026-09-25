import { CARD_ICONS } from '@/constants/content';
import { Icon, type IconName, hasIcon } from '@/components/ui/Icon';

interface IconBadgeProps {
  name?: string;
  cardKey?: string;
  size?: 'xs' | 'sm' | 'md';
  tone?: 'default' | 'navy';
  iconSize?: number;
}

export function IconBadge({ name, cardKey, size = 'md', tone = 'default', iconSize }: IconBadgeProps) {
  const resolved = name ?? (cardKey ? CARD_ICONS[cardKey] : undefined);
  if (!resolved || !hasIcon(resolved)) return null;
  const className = ['icn', size === 'sm' ? 'sm' : size === 'xs' ? 'xs' : '', tone === 'navy' ? 'navy' : '']
    .filter(Boolean)
    .join(' ');
  const px = iconSize ?? (size === 'xs' ? 15 : size === 'sm' ? 18 : 22);
  return (
    <div className={className}>
      <Icon name={resolved as IconName} size={px} />
    </div>
  );
}
