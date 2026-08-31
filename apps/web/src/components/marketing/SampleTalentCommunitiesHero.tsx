import { SKILL_COMMUNITY_ORBIT_PILLS } from '../../data/publicSkillCommunities';
import { COMMUNITY_PROFILE_SLIDES } from '../../lib/demo-engineers';
import {
  SAMPLE_TALENT_HERO_AVATAR_SRC,
  SAMPLE_TALENT_ORBIT_AVATAR_DISPLAY_PX,
} from '../../lib/brand';
import { skillCommunityLucideIcon } from '../../lib/skill-community-lucide-icons';

export function SampleTalentCommunitiesHero() {
  const featured = COMMUNITY_PROFILE_SLIDES[0].engineer;

  return (
    <div className="mkt-st-comm-orbit" aria-hidden="true">
      <div className="mkt-st-comm-orbit-ring mkt-st-comm-orbit-ring--1" />
      <div className="mkt-st-comm-orbit-ring mkt-st-comm-orbit-ring--2" />
      <div className="mkt-st-comm-orbit-ring mkt-st-comm-orbit-ring--3" />

      {SKILL_COMMUNITY_ORBIT_PILLS.map((label, index) => {
        const Icon = skillCommunityLucideIcon(label);

        return (
          <div
            key={label}
            className={`mkt-st-comm-orbit-pill mkt-st-comm-orbit-pill--${index + 1}`}
          >
            <span className="mkt-st-comm-orbit-pill-icon">
              <Icon strokeWidth={2} />
            </span>
            <span>{label}</span>
          </div>
        );
      })}

      <div className="mkt-st-comm-orbit-center">
        <div className="mkt-st-comm-orbit-photo-frame">
          <img
            src={SAMPLE_TALENT_HERO_AVATAR_SRC}
            srcSet={`${SAMPLE_TALENT_HERO_AVATAR_SRC} 1x, ${SAMPLE_TALENT_HERO_AVATAR_SRC} 2x`}
            alt=""
            width={SAMPLE_TALENT_ORBIT_AVATAR_DISPLAY_PX * 2}
            height={SAMPLE_TALENT_ORBIT_AVATAR_DISPLAY_PX * 2}
            sizes={`${SAMPLE_TALENT_ORBIT_AVATAR_DISPLAY_PX}px`}
            className="mkt-st-comm-orbit-photo"
            decoding="async"
            fetchPriority="high"
            onError={(event) => {
              const target = event.currentTarget;
              target.style.display = 'none';
              const fallback = target.parentElement?.nextElementSibling;
              if (fallback instanceof HTMLElement) fallback.style.display = 'flex';
            }}
          />
        </div>
        <span className="mkt-st-comm-orbit-initials">{featured.initials}</span>
      </div>
    </div>
  );
}
