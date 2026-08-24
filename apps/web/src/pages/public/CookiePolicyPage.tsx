import { LegalDocumentPage } from '../../components/marketing/LegalDocumentPage';
import { PageMeta } from '../../components/PageMeta';
import { COOKIE_POLICY } from '../../lib/legal/cookie-policy';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function CookiePolicyPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.cookiePolicy.title} description={PAGE_SEO.cookiePolicy.description} />
      <LegalDocumentPage document={COOKIE_POLICY} />
    </>
  );
}
