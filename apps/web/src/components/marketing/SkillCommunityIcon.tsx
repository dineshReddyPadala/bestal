import { Layers } from 'lucide-react';
import { useState } from 'react';
import { pickSkillCommunityDisplayIcon } from '../../lib/skill-community-icon';

type SkillCommunityIconProps = {
  iconUrl?: string | null;
  className?: string;
  imageClassName?: string;
};

export function SkillCommunityIcon({
  iconUrl,
  className = 'mkt-st-comm-card-icon',
  imageClassName = 'mkt-st-comm-card-icon-img',
}: SkillCommunityIconProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const resolved = pickSkillCommunityDisplayIcon({ iconUrl: iconUrl ?? null });
  const showImage = Boolean(resolved) && !imgFailed;

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
        <Layers strokeWidth={2} />
      )}
    </span>
  );
}
