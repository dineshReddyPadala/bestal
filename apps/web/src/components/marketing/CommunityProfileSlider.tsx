import { useCallback, useEffect, useState } from 'react';
import { cn } from '@bestal/shared-utils';
import {
  COMMUNITY_PROFILE_SLIDES,
  type CommunityProfileSlide,
  type DemoEngineer,
} from '../../lib/demo-engineers';
import { DemoEngineerCard } from './DemoEngineerCard';

const AUTOPLAY_MS = 4500;

type CommunityProfileSliderProps = {
  className?: string;
  hideScorecard?: boolean;
  onSlideChange?: (slide: CommunityProfileSlide) => void;
};

export function CommunityProfileSlider({
  className,
  hideScorecard = false,
  onSlideChange,
}: CommunityProfileSliderProps) {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);

  const select = useCallback((index: number) => {
    setActive(index);
    setCycle((c) => c + 1);
  }, []);

  useEffect(() => {
    onSlideChange?.(COMMUNITY_PROFILE_SLIDES[active]);
  }, [active, onSlideChange]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % COMMUNITY_PROFILE_SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [cycle]);

  const activeSlide = COMMUNITY_PROFILE_SLIDES[active];

  return (
    <div className={cn('mkt-community-slider', className)}>
      <div
        className="mkt-community-slider-track"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${activeSlide.community} profile`}
      >
        {COMMUNITY_PROFILE_SLIDES.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.community}
              className={cn('mkt-community-slider-panel', isActive && 'is-active')}
              aria-hidden={!isActive}
            >
              <DemoEngineerCard
                engineer={slide.engineer}
                hideScorecard={hideScorecard}
                communityLabel={slide.community}
              />
            </div>
          );
        })}
      </div>

      {/* <div className="mkt-community-slider-meta">
        <p className="mkt-community-slider-name">{activeSlide.community}</p>
        <p className="mkt-community-slider-desc">{activeSlide.description}</p>
      </div>

      <div
        className="mkt-community-slider-nav"
        role="tablist"
        aria-label="Skill communities"
      >
        {COMMUNITY_PROFILE_SLIDES.map((slide, index) => {
          const isActive = index === active;
          return (
            <button
              key={slide.community}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={slide.community}
              title={slide.community}
              className={cn('mkt-community-slider-pill', isActive && 'is-active')}
              onClick={() => select(index)}
            />
          );
        })}
      </div> */}
    </div>
  );
}

export type { DemoEngineer };
