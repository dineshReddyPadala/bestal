import { useEffect, useState } from 'react';
import { cn } from '@bestal/shared-utils';
import {
  COMMUNITY_PROFILE_SLIDES,
  type CommunityProfileSlide,
  type DemoEngineer,
} from '../../lib/demo-engineers';
import { DemoEngineerCard } from './DemoEngineerCard';

const AUTOPLAY_MS = 6500;

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
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    onSlideChange?.(COMMUNITY_PROFILE_SLIDES[active]);
  }, [active, onSlideChange]);

  useEffect(() => {
    if (paused) return undefined;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % COMMUNITY_PROFILE_SLIDES.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [paused]);

  const activeSlide = COMMUNITY_PROFILE_SLIDES[active];
  const genderClass =
    activeSlide.engineer.gender === 'female' ? 'mkt-prof--female' : 'mkt-prof--male';

  return (
    <div
      className={cn('mkt-community-slider', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <article className={cn('mkt-prof mkt-community-slider-card', genderClass)}>
        <div className="mkt-dtag mkt-community-slider-dtag">{activeSlide.community}</div>

        <div
          className="mkt-community-slider-viewport"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${activeSlide.community} profile`}
        >
          <div
            className="mkt-community-slider-track"
            style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
          >
            {COMMUNITY_PROFILE_SLIDES.map((slide, index) => (
              <div
                key={slide.community}
                className={cn('mkt-community-slider-panel', index === active && 'is-active')}
              >
                <DemoEngineerCard
                  engineer={slide.engineer}
                  hideScorecard={hideScorecard}
                  hideSecondaryActions
                  shellless
                />
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export type { DemoEngineer };
