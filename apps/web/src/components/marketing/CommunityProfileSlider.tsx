import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setActive(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    onSlideChange?.(slides[active]);
  }, [active, onSlideChange, slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[active] ?? slides[0];

  return (
    <div className={cn('mkt-community-slider', className)}>
      <div
        className="mkt-community-slider-track"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${activeSlide.community} profile`}
      >
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.engineer.id}
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
    </div>
  );
}

export type { DemoEngineer };
