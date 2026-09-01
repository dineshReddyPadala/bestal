import { DEFAULT_OG_IMAGE_URL, canonicalUrlForPath } from '../lib/marketing-seo';

type PageMetaProps = {
  title: string;
  description: string;
  noIndex?: boolean;
  /** Override path used for canonical / og:url. Defaults to the current location. */
  path?: string;
  imageUrl?: string;
};

function upsertNamedMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertPropertyMeta(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function removeNamedMeta(name: string) {
  document.querySelector(`meta[name="${name}"]`)?.remove();
}

function currentPath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

export function PageMeta({
  title,
  description,
  noIndex = false,
  path,
  imageUrl = DEFAULT_OG_IMAGE_URL,
}: PageMetaProps) {
  if (typeof document !== 'undefined') {
    const canonical = canonicalUrlForPath(path ?? currentPath());

    document.title = title;
    upsertNamedMeta('description', description);
    upsertCanonical(canonical);

    upsertPropertyMeta('og:type', 'website');
    upsertPropertyMeta('og:site_name', 'BesTal');
    upsertPropertyMeta('og:locale', 'en_US');
    upsertPropertyMeta('og:url', canonical);
    upsertPropertyMeta('og:title', title);
    upsertPropertyMeta('og:description', description);
    upsertPropertyMeta('og:image', imageUrl);
    upsertPropertyMeta('og:image:width', '1200');
    upsertPropertyMeta('og:image:height', '630');

    upsertNamedMeta('twitter:card', 'summary_large_image');
    upsertNamedMeta('twitter:title', title);
    upsertNamedMeta('twitter:description', description);
    upsertNamedMeta('twitter:image', imageUrl);

    if (noIndex) {
      upsertNamedMeta('robots', 'noindex, nofollow');
    } else {
      removeNamedMeta('robots');
    }
  }

  return null;
}
