import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { ReachOutWizard } from '../../components/marketing/ReachOutWizard';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function ReachOutPage() {
  return (
    <div className="mkt-contact-page">
      <PageMeta title={PAGE_SEO.reachOut.title} description={PAGE_SEO.reachOut.description} />
      <section className="mkt-hiw-hero-band">
        <MktShell className="mkt-page-hd mkt-hiw-hero">
          <div className="mkt-hiw-label">Reach out</div>
          <h1>Reach out to us</h1>
          <p className="mkt-lead">
            Tell us what you need — role, skills, and timeline. Our talent team will match against
            vetted engineers with evidence on every profile.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-reach-out-section">
        <MktShell className="mkt-reach-out-shell">
          <ReachOutWizard />
        </MktShell>
      </section>
    </div>
  );
}
