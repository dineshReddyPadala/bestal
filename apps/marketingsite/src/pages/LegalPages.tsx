import type { ReactNode } from 'react';
import { Seo } from '@/components/common/Seo';
import type { PageId } from '@/types';

function LegalShell({
  page,
  title,
  children,
}: {
  page: PageId;
  title: string;
  children: ReactNode;
}) {
  return (
    <main>
      <Seo page={page} />
      <section className="hero" style={{ paddingBottom: 60 }}>
        <div className="shell" style={{ maxWidth: 760 }}>
          <span className="tag">Legal</span>
          <h1 style={{ marginTop: 14, fontSize: 36 }}>{title}</h1>
          <div className="card" style={{ marginTop: 20, background: 'var(--tint-gold)' }}>
            <p style={{ fontSize: 13.5, color: 'var(--gold-d)' }}>
              Draft — to be finalized with legal counsel before production use.
            </p>
          </div>
          <div style={{ marginTop: 20, color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.8 }}>{children}</div>
        </div>
      </section>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell page="privacy" title="Privacy Policy">
      <p>
        BesTal Solutions collects information you provide directly (such as contact and engagement details) and
        information generated through use of the BesTal Client Workspace. Information is used to respond to enquiries,
        deliver services, and meet contractual and legal obligations.
      </p>
      <p style={{ marginTop: 14 }}>
        Information is not sold to third parties. Access is limited on a purpose basis. Retention and deletion follow
        applicable agreements and legal requirements. For any privacy question, contact BesTal directly.
      </p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell page="terms" title="Terms of Use">
      <p>
        This website is provided by BesTal Solutions for informational purposes and to enable enquiries about BesTal's
        services. Engagement-specific terms are set out separately in the applicable master services agreement or
        statement of work.
      </p>
      <p style={{ marginTop: 14 }}>
        The BesTal Client Workspace shown on this site is a prototype for demonstration purposes; data shown within it
        is illustrative and does not reflect real clients, professionals or engagements.
      </p>
    </LegalShell>
  );
}

export function CookiesPage() {
  return (
    <LegalShell page="cookies" title="Cookie Policy">
      <p>
        This site uses essential functionality only in its current prototype form and does not set tracking or
        advertising cookies. If analytics or preference cookies are introduced in production, this policy will be
        updated to describe them and provide relevant controls.
      </p>
    </LegalShell>
  );
}
