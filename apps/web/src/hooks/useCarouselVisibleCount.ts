import { useEffect, useState } from 'react';

type CarouselVisibleCountOptions = {
  desktop: number;
  tablet?: number;
  mobile?: number;
};

export function useCarouselVisibleCount({
  desktop,
  tablet = 2,
  mobile = 1,
}: CarouselVisibleCountOptions): number {
  const [visibleCount, setVisibleCount] = useState(desktop);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    const tabletQuery = window.matchMedia('(min-width: 769px)');

    const sync = () => {
      if (desktopQuery.matches) {
        setVisibleCount(desktop);
        return;
      }
      if (tabletQuery.matches) {
        setVisibleCount(tablet);
        return;
      }
      setVisibleCount(mobile);
    };

    sync();
    desktopQuery.addEventListener('change', sync);
    tabletQuery.addEventListener('change', sync);

    return () => {
      desktopQuery.removeEventListener('change', sync);
      tabletQuery.removeEventListener('change', sync);
    };
  }, [desktop, tablet, mobile]);

  return visibleCount;
}
