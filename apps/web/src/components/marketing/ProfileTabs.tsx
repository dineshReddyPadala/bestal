import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@bestal/shared-utils';
import { PROFILE_FRAME_VIEW, PROFILE_VIEWS_VISIBLE, type ProfileView } from '../../lib/profile-views';

const AUTOPLAY_MS = 4000;

function profileArtClass(fit: ProfileView['fit']) {
  if (fit === 'contain') return 'is-contain';
  if (fit === 'cover-bottom') return 'is-cover-bottom';
  return undefined;
}

export function ProfileTabs() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState<number | undefined>(undefined);
  const frameImageSize = useRef<{ width: number; height: number } | null>(null);

  const syncFrameHeight = useCallback(() => {
    const container = containerRef.current;
    const size = frameImageSize.current;
    if (!container || !size?.width) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    setFrameHeight(Math.round(width * (size.height / size.width)));
  }, []);

  useEffect(() => {
    PROFILE_VIEWS_VISIBLE.forEach((view) => {
      const img = new Image();
      img.src = view.src;
    });

    const img = new Image();
    img.onload = () => {
      frameImageSize.current = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      syncFrameHeight();
    };
    img.src = PROFILE_FRAME_VIEW.src;
  }, [syncFrameHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(syncFrameHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, [syncFrameHeight]);

  const select = useCallback((index: number) => {
    setActive(index);
    setCycle((c) => c + 1);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % PROFILE_VIEWS_VISIBLE.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [cycle]);

  return (
    <div>
      <div role="tablist" aria-label="Profile views" className="mkt-tabs">
        {PROFILE_VIEWS_VISIBLE.map((tab, index) => {
          const isActive = index === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`profile-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`profile-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  select((index + 1) % PROFILE_VIEWS_VISIBLE.length);
                }
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  select((index - 1 + PROFILE_VIEWS_VISIBLE.length) % PROFILE_VIEWS_VISIBLE.length);
                }
              }}
              className={`mkt-tab${isActive ? ' is-active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="mkt-profile-art-wrap">
        <div
          className="mkt-profile-art"
          style={frameHeight ? { height: frameHeight } : undefined}
        >
          {PROFILE_VIEWS_VISIBLE.map((tab, index) => {
            const isActive = index === active;
            return (
              <div
                key={tab.id}
                role="tabpanel"
                id={`profile-panel-${tab.id}`}
                aria-labelledby={`profile-tab-${tab.id}`}
                aria-hidden={!isActive}
                className={cn('mkt-profile-art-panel', isActive && 'is-active')}
              >
                <img
                  src={tab.src}
                  alt={tab.alt}
                  title={tab.fileName}
                  className={profileArtClass(tab.fit)}
                  loading="eager"
                  decoding="async"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
