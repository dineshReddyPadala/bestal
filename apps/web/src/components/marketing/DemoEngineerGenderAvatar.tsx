import { cn } from '@bestal/shared-utils';
import type { DemoEngineerGender } from '../../lib/demo-engineers';
import { inferGenderFromName } from '../../lib/demo-engineers';

type DemoEngineerGenderAvatarProps = {
  gender?: DemoEngineerGender;
  name: string;
  className?: string;
};

export const GENDER_AVATAR_SRC = {
  female: '/profile-women-logo.png',
  male: '/Profile-men-logo.png',
} as const satisfies Record<DemoEngineerGender, string>;

export function DemoEngineerGenderAvatar({
  gender,
  name,
  className,
}: DemoEngineerGenderAvatarProps) {
  const resolvedGender = gender ?? inferGenderFromName(name);

  return (
    <div className={cn('mkt-lpc-av', className)}>
      <img
        src={GENDER_AVATAR_SRC[resolvedGender]}
        alt=""
        aria-label={name}
        className="mkt-lpc-av-img"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
