import { Layers } from 'lucide-react';
import { useState } from 'react';
import { skillCommunityLucideIcon } from '../../lib/skill-community-lucide-icons';
import { pickSkillCommunityDisplayIcon } from '../../lib/skill-community-icon';

type SkillCommunityIconProps = {
  name?: string;
  iconUrl?: string | null;
  className?: string;
  imageClassName?: string;
};

export function SkillCommunityIcon({
  name,
  iconUrl,
  className = 'mkt-st-comm-card-icon',
  imageClassName = 'mkt-st-comm-card-icon-img',
}: SkillCommunityIconProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const resolved = pickSkillCommunityDisplayIcon({ iconUrl: iconUrl ?? null });
  const showImage = Boolean(resolved) && !imgFailed;
  const FallbackIcon = name ? skillCommunityLucideIcon(name) : Layers;

  return (
    <span className={className} aria-hidden="true">
      {showImage ? (
        <img
          src={resolved!}
          alt=""
          className={imageClassName}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <FallbackIcon strokeWidth={2} />
      )}
    </span>
  );
}
