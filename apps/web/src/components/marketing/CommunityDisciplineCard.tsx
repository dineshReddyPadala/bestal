import { Link } from 'react-router-dom';
import { cn } from '@bestal/shared-utils';
import { ForwardArrow } from '../ui/ForwardArrow';
import type { HomeCommunityCard } from '../../lib/marketing-copy';

type CommunityDisciplineCardProps = {
  community: HomeCommunityCard;
  active?: boolean;
  onSelect?: (discipline: HomeCommunityCard['name']) => void;
};

export function CommunityDisciplineCard({ community, active = false, onSelect }: CommunityDisciplineCardProps) {
  const content = (
    <>
      <div className="mkt-comm-dev-hd">
        <h3>{community.name}</h3>
        <ForwardArrow className="mkt-comm-dev-arrow" />
      </div>
      <div className="mkt-comm-dev-badges">
        {community.badges.map((badge) => (
          <span key={badge} className="mkt-comm-dev-badge">
            {badge}
          </span>
        ))}
      </div>
      <p className="mkt-comm-dev-tags">{community.tags.join(' · ')}</p>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={cn('mkt-comm-dev', active && 'is-active')}
        aria-pressed={active}
        onClick={() => onSelect(community.name)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={`/sample-talent?discipline=${encodeURIComponent(community.name)}`}
      className={cn('mkt-comm-dev', active && 'is-active')}
    >
      {content}
    </Link>
  );
}
