import { Box, Brain, Cloud, Code2, type LucideIcon } from 'lucide-react';
import { COMMUNITY_PROFILE_SLIDES } from '../../lib/demo-engineers';
import { SAMPLE_TALENT_HERO_AVATAR_SRC } from '../../lib/brand';

const ORBIT_PILLS: { label: string; icon: LucideIcon }[] = [
  { label: 'Data & AI', icon: Brain },
  { label: 'Cloud & Platform', icon: Cloud },
  { label: 'Full Stack', icon: Code2 },
  { label: 'SAP', icon: Box },
];

export function SampleTalentCommunitiesHero() {
  const featured = COMMUNITY_PROFILE_SLIDES[0].engineer;

  return (
    <div className="mkt-st-comm-orbit" aria-hidden="true">
      <div className="mkt-st-comm-orbit-ring mkt-st-comm-orbit-ring--1" />
      <div className="mkt-st-comm-orbit-ring mkt-st-comm-orbit-ring--2" />
      <div className="mkt-st-comm-orbit-ring mkt-st-comm-orbit-ring--3" />

      {ORBIT_PILLS.map((pill, index) => (
        <div key={pill.label} className={`mkt-st-comm-orbit-pill mkt-st-comm-orbit-pill--${index + 1}`}>
          <span className="mkt-st-comm-orbit-pill-icon">
            <pill.icon strokeWidth={2} />
          </span>
          <span>{pill.label}</span>
        </div>
      ))}

      <div className="mkt-st-comm-orbit-center">
        <img
          src={SAMPLE_TALENT_HERO_AVATAR_SRC}
          alt=""
          width={180}
          height={180}
          className="mkt-st-comm-orbit-photo"
          decoding="async"
          onError={(event) => {
            const target = event.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling;
            if (fallback instanceof HTMLElement) fallback.style.display = 'flex';
          }}
        />
        <span className="mkt-st-comm-orbit-initials">{featured.initials}</span>
      </div>
    </div>
  );
}
