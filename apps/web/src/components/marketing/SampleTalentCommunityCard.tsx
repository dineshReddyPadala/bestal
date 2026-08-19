import {
  ArrowRight,
  Box,
  Brain,
  Cloud,
  CloudCog,
  Code2,
  Shield,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

const COMMUNITY_ICONS: Record<string, LucideIcon> = {
  'Data & AI': Brain,
  'Cloud & Platform': Cloud,
  'Full Stack': Code2,
  SAP: Box,
  ServiceNow: Workflow,
  Salesforce: CloudCog,
  Cybersecurity: Shield,
};

type SampleTalentCommunityCardProps = {
  name: string;
  body: string;
  onClick: () => void;
};

export function SampleTalentCommunityCard({ name, body, onClick }: SampleTalentCommunityCardProps) {
  const Icon = COMMUNITY_ICONS[name] ?? Brain;

  return (
    <button type="button" className="mkt-st-comm-card" onClick={onClick}>
      <div className="mkt-st-comm-card-hd">
        <span className="mkt-st-comm-card-icon" aria-hidden="true">
          <Icon strokeWidth={2} />
        </span>
        <h3>{name}</h3>
        <span className="mkt-st-comm-card-arrow" aria-hidden="true">
          <ArrowRight strokeWidth={2.25} />
        </span>
      </div>
      <p className="mkt-st-comm-card-tags">{body}</p>
    </button>
  );
}
