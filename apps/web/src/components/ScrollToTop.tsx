import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToHashTarget(hash: string): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  target.scrollIntoView({ behavior: 'instant', block: 'start' });
  return true;
}

/** Scroll to top on route change, or to a hash target when the URL includes one. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    if (scrollToHashTarget(hash)) return;

    const timeoutId = window.setTimeout(() => {
      scrollToHashTarget(hash);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, hash]);

  return null;
}
