function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return import.meta.env.DEV;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/** Public marketing site — local Vite on 5175, production on www.bestal.co */
export function getMarketingOrigin(): string {
  if (isLocalHost()) {
    return trimSlash(import.meta.env.VITE_MARKETING_ORIGIN_LOCAL || 'http://localhost:5175');
  }
  return trimSlash(import.meta.env.VITE_MARKETING_ORIGIN || 'https://www.bestal.co');
}

const EXACT_REDIRECTS: Record<string, string> = {
  '/': '/',
  '/how-it-works': '/how-we-can-help',
  '/sample-talent': '/talent-solutions',
  '/talent': '/talent-solutions',
  '/consulting': '/technology-consulting',
  '/evaluation-standard': '/',
  '/trust': '/trust-and-governance',
  '/rates': '/',
  '/try-for-a-week': '/',
  '/jobs': '/',
  '/communities': '/technology-communities',
  '/enterprise': '/',
  '/about': '/about',
  '/faq': '/how-we-can-help',
  '/privacy-policy': '/privacy',
  '/terms-of-service': '/terms',
  '/free-trial-terms': '/terms',
  '/cookie-policy': '/cookies',
  '/for-engineers': '/join-our-community',
  '/contact': '/contact',
  '/reach-out': '/contact',
  '/careers': '/contact',
};

export function marketingRedirectUrl(pathname: string): string {
  const origin = getMarketingOrigin();
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const mapped = EXACT_REDIRECTS[normalized];
  if (mapped) return `${origin}${mapped}`;
  if (normalized.startsWith('/jobs/')) return `${origin}/`;
  if (normalized.startsWith('/careers')) return `${origin}/contact`;
  return `${origin}/`;
}
