import { Seo } from '@/components/common/Seo';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { COOKIE_POLICY } from '@/constants/legal/cookie-policy';
import { PRIVACY_POLICY } from '@/constants/legal/privacy-policy';
import { TERMS_OF_SERVICE } from '@/constants/legal/terms-of-service';

export function PrivacyPage() {
  return (
    <main>
      <Seo page="privacy" />
      <LegalDocumentView document={PRIVACY_POLICY} />
    </main>
  );
}

export function TermsPage() {
  return (
    <main>
      <Seo page="terms" />
      <LegalDocumentView document={TERMS_OF_SERVICE} />
    </main>
  );
}

export function CookiesPage() {
  return (
    <main>
      <Seo page="cookies" />
      <LegalDocumentView document={COOKIE_POLICY} />
    </main>
  );
}
