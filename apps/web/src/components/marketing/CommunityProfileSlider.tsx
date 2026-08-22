import { useEffect, useState } from 'react';
import { cn } from '@bestal/shared-utils';
import {
  COMMUNITY_PROFILE_SLIDES,
  type CommunityProfileSlide,
  type DemoEngineer,
} from '../../lib/demo-engineers';
import { DemoEngineerCard } from './DemoEngineerCard';

const AUTOPLAY_MS = 5000;

type CommunityProfileSliderProps = {
  className?: string;
  hideScorecard?: boolean;
  slides?: CommunityProfileSlide[];
  onSlideChange?: (slide: CommunityProfileSlide) => void;
};

export function CommunityProfileSlider({
  className,
  hideScorecard = false,
  slides = COMMUNITY_PROFILE_SLIDES,
  onSlideChange,
}: CommunityProfileSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    onSlideChange?.(slides[active] ?? slides[0]);
  }, [active, onSlideChange, slides]);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[active] ?? slides[0];

  return (
    <div
      className={cn('mkt-community-slider', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <article className="mkt-prof mkt-community-slider-card">
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
            {slides.map((slide, index) => (
              <div
                key={slide.engineer.id}
                className={cn('mkt-community-slider-panel', index === active && 'is-active')}
                aria-hidden={index !== active}
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
