import { useEffect } from 'react';
import { PAGE_META } from '@/constants/seo';
import { ROUTES } from '@/constants/routes';
import type { PageId } from '@/types';
import { siteUrl } from '@/utils/format';

function setMeta(selector: string, attr: string, value: string) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function Seo({ page }: { page: PageId }) {
  useEffect(() => {
    const meta = PAGE_META[page];
    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
    const canonical = `${siteUrl()}${ROUTES[page]}`;
    setMeta('link[rel="canonical"]', 'href', canonical);
  }, [page]);

  return null;
}
