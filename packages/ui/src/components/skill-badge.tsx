import { cn } from '@bestal/shared-utils';
import { Badge } from './badge.js';

const proficiencyColors = {
  BEGINNER: 'bg-slate-100 text-slate-700',
  INTERMEDIATE: 'bg-brand-light/70 text-brand/80',
  ADVANCED: 'bg-brand-light text-brand',
  EXPERT: 'bg-brand text-white',
} as const;

export type SkillBadgeProps = {
  name: string;
  proficiency?: keyof typeof proficiencyColors;
  isPrimary?: boolean;
  className?: string;
};

export function SkillBadge({
  name,
  proficiency,
  isPrimary,
  className,
}: SkillBadgeProps) {
  if (proficiency) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
          proficiencyColors[proficiency],
          isPrimary && 'ring-1 ring-brand/30',
          className,
        )}
      >
        {name}
        {isPrimary && <span className="text-[10px] opacity-70">• Primary</span>}
      </span>
    );
  }

  return (
    <Badge variant="outline" className={cn('font-normal', className)}>
      {name}
    </Badge>
  );
}
