import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { marketingRedirectUrl } from '../lib/marketing-origin';

export function RedirectToMarketing() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.location.replace(marketingRedirectUrl(pathname));
  }, [pathname]);

  return null;
}
