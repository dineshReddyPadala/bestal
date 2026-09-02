import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { TRUST_PAGE } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function TrustPage() {
  return (
    <div className="mkt-trust-page">
      <PageMeta title={PAGE_SEO.trust.title} description={PAGE_SEO.trust.description} />

      <section className="mkt-hiw-hero-band">
        <MktShell className="mkt-hiw-hero">
          <div className="mkt-hiw-label">{TRUST_PAGE.hero.label}</div>
          <h1>{TRUST_PAGE.hero.title}</h1>
          <div className="mkt-hiw-hero-copy howitworks-body-style">
            {TRUST_PAGE.hero.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mkt-lead howitworks-body-style mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </MktShell>
      </section>

      {TRUST_PAGE.pillars.map((pillar, index) => (
        <section
          key={pillar.id}
          className={`mkt-section mkt-trust-verify${index % 2 === 1 ? ' mkt-white' : ' mkt-cream'}`}
        >
          <MktShell>
            <h2 className="mkt-about-section-title">{pillar.title}</h2>
            <p className="mkt-about-featured-title mt-3 mb-0">{pillar.subtitle}</p>
            <p className="howitworks-body-style mt-4 mb-0">{pillar.intro}</p>
            <ul className="mkt-trust-benefits-grid">
              {pillar.items.map((item) => (
                <li key={item.title} className="mkt-trust-benefit-card">
                  <div className="min-w-0">
                    <h3 className="mkt-trust-benefit-title">{item.title}</h3>
                    <p className="howitworks-body-style mt-2 mb-0">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </MktShell>
        </section>
      ))}

      <section className="mkt-section mkt-trust-commitment mkt-white">
        <MktShell>
          <h2 className="mkt-about-section-title">{TRUST_PAGE.commitment.title}</h2>
          {TRUST_PAGE.commitment.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="howitworks-body-style mt-4 mb-0">
              {paragraph}
            </p>
          ))}
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section mkt-trust-closing-band">
        <MktShell className="mkt-trust-core-inner">
          <h2 className="mkt-about-section-title mb-0">{TRUST_PAGE.closing.title}</h2>
          <p className="howitworks-body-style mt-4 mb-0">{TRUST_PAGE.closing.body}</p>
        </MktShell>
      </section>
    </div>
  );
}
