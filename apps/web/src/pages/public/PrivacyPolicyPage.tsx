import { LegalDocumentPage } from '../../components/marketing/LegalDocumentPage';
import { PageMeta } from '../../components/PageMeta';
import { PRIVACY_POLICY } from '../../lib/legal/privacy-policy';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function PrivacyPolicyPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.privacyPolicy.title} description={PAGE_SEO.privacyPolicy.description} />
      <LegalDocumentPage document={PRIVACY_POLICY} />
    </>
  );
}
