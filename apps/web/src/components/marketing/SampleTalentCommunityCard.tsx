import { ArrowRight } from 'lucide-react';
import { SkillCommunityIcon } from './SkillCommunityIcon';

type SampleTalentCommunityCardProps = {
  name: string;
  body: string;
  iconUrl?: string | null;
  onClick: () => void;
};

export function SampleTalentCommunityCard({
  name,
  body,
  iconUrl,
  onClick,
}: SampleTalentCommunityCardProps) {
  return (
    <button type="button" className="mkt-st-comm-card" onClick={onClick}>
      <div className="mkt-st-comm-card-hd">
        <SkillCommunityIcon name={name} iconUrl={iconUrl} />
        <h3>{name}</h3>
        <span className="mkt-st-comm-card-arrow" aria-hidden="true">
          <ArrowRight strokeWidth={2.25} />
        </span>
      </div>
      <p className="mkt-st-comm-card-tags">{body}</p>
    </button>
  );
}
