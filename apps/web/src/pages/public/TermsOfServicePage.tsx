import { LegalDocumentPage } from '../../components/marketing/LegalDocumentPage';
import { PageMeta } from '../../components/PageMeta';
import { TERMS_OF_SERVICE } from '../../lib/legal/terms-of-service';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function TermsOfServicePage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.termsOfService.title} description={PAGE_SEO.termsOfService.description} />
      <LegalDocumentPage document={TERMS_OF_SERVICE} />
    </>
  );
}
