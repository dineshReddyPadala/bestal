import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    <article
      className="mkt-prof mkt-prof-landing mkt-community-slider-card mkt-prof-loading"
      aria-hidden="true"
    >
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
    <article className="mkt-prof mkt-prof-landing mkt-community-slider-card mkt-prof-empty">
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
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const syncViewportHeight = useCallback(() => {
    const heights = panelRefs.current
      .filter((panel): panel is HTMLDivElement => panel != null)
      .map((panel) => panel.offsetHeight);

    if (heights.length === 0) return;
    setViewportHeight(Math.max(...heights));
  }, []);

  useLayoutEffect(() => {
    syncViewportHeight();
  }, [slides, syncViewportHeight]);

  useEffect(() => {
    const panels = panelRefs.current.filter((panel): panel is HTMLDivElement => panel != null);
    if (panels.length === 0) return undefined;

    const observer = new ResizeObserver(() => {
      syncViewportHeight();
    });
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [slides, syncViewportHeight]);

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
    return (
      <div className={cn('mkt-community-slider', className)}>
        <LandingProfileCardSkeleton />
      </div>
    );
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
        <div
          className="mkt-community-slider-viewport"
          style={viewportHeight ? { height: viewportHeight } : undefined}
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${activeSlide.community || activeSlide.engineer.name} profile`}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.engineer.id}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
              className={cn('mkt-community-slider-panel', index === active && 'is-active')}
              aria-hidden={index !== active}
            >
              {slide.community ? (
                <div className="mkt-dtag mkt-community-slider-dtag" title={slide.community}>
                  {slide.community}
                </div>
              ) : null}
              <div className="mkt-community-slider-panel-body">
                <DemoEngineerCard
                  engineer={slide.engineer}
                  variant="landing"
                  hideCommunityLabel
                  shellless
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export type { DemoEngineer };
