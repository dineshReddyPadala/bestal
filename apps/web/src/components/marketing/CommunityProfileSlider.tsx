import { useEffect, useState } from 'react';
import { cn } from '@bestal/shared-utils';
import type { CommunityProfileSlide } from '../../lib/landing-featured-candidates';
import type { DemoEngineer } from '../../lib/demo-engineers';
import { DemoEngineerCard } from './DemoEngineerCard';

const AUTOPLAY_MS = 5000;

type CommunityProfileSliderProps = {
  className?: string;
  slides?: CommunityProfileSlide[];
  isLoading?: boolean;
  onSlideChange?: (slide: CommunityProfileSlide) => void;
};

function LandingProfileCardSkeleton() {
  return (
    <article className="mkt-prof mkt-prof-landing mkt-prof-loading" aria-hidden="true">
      <div className="mkt-dtag mkt-skeleton-bar mkt-skeleton-bar-sm" />
      <div className="mkt-lpc">
        <div className="mkt-lpc-grid">
          <div className="mkt-lpc-left">
            <div className="mkt-lpc-av mkt-skeleton-block" />
            <div className="mkt-skeleton-block mkt-skeleton-block-score" />
            <div className="mkt-skeleton-bar mkt-skeleton-bar-md" />
            <div className="mkt-skeleton-bar mkt-skeleton-bar-lg" />
          </div>
          <div className="mkt-lpc-right">
            <div className="mkt-skeleton-bar mkt-skeleton-bar-xl" />
            <div className="mkt-skeleton-bar mkt-skeleton-bar-md" />
            <div className="mkt-skeleton-bar mkt-skeleton-bar-sm" />
            <div className="mkt-skeleton-bar mkt-skeleton-bar-md" />
            <div className="mkt-skeleton-bar mkt-skeleton-bar-sm" />
          </div>
        </div>
        <div className="mkt-lpc-foot">
          <div className="mkt-skeleton-block mkt-skeleton-block-btn" />
          <div className="mkt-skeleton-block mkt-skeleton-block-btn" />
        </div>
      </div>
    </article>
  );
}

function LandingProfileCardEmpty() {
  return (
    <article className="mkt-prof mkt-prof-landing mkt-prof-empty">
      <div className="mkt-lpc mkt-lpc-empty">
        <p className="mkt-lpc-empty-title">No featured profiles yet</p>
        <p className="mkt-lpc-empty-copy">
          Published, client-visible talent from BesTal will appear here as soon as profiles go live.
        </p>
      </div>
    </article>
  );
}

export function CommunityProfileSlider({
  className,
  slides = [],
  isLoading = false,
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

  if (isLoading) {
    return <div className={cn('mkt-community-slider', className)}><LandingProfileCardSkeleton /></div>;
  }

  if (slides.length === 0) {
    return (
      <div className={cn('mkt-community-slider', className)}>
        <LandingProfileCardEmpty />
      </div>
    );
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
      <article className="mkt-prof mkt-prof-landing mkt-community-slider-card">
        {activeSlide.community ? (
          <div className="mkt-dtag mkt-community-slider-dtag">{activeSlide.community}</div>
        ) : null}

        <div
          className="mkt-community-slider-viewport"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${activeSlide.community || activeSlide.engineer.name} profile`}
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
                  variant="landing"
                  hideCommunityLabel
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
