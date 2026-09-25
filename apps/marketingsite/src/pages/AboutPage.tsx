import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { HeroDiagram } from '@/components/diagrams/Diagrams';
import { PILLARS, PRINCIPLES } from '@/constants/content';
import { ROUTES } from '@/constants/routes';

export function AboutPage() {
  return (
    <main>
      <Seo page="about" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell" style={{ maxWidth: 820 }}>
          <span className="tag">About BesTal</span>
          <h1 style={{ marginTop: 14 }}>BesTal is a technology services and solutions company.</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            Helping organizations solve technology challenges, deliver critical initiatives and scale technology
            capabilities through Technology Consulting, Managed Services and Talent Solutions.
          </p>
        </div>
      </section>
      <section className="alt">
        <div className="shell two">
          <div>
            <span className="k">Why BesTal exists</span>
            <h2 style={{ marginTop: 8 }}>Most requirements don't fit one model.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Organizations need flexible access to specialist expertise, delivery ownership and additional capacity —
              often at different points in the same initiative. BesTal was built so a client isn't forced to fit every
              requirement into a single engagement model.
            </p>
          </div>
          <div className="card">
            <HeroDiagram />
          </div>
        </div>
      </section>
      <section>
        <div className="shell">
          <SectionHead kicker="Three ways we work" title="Technology Consulting. Managed Services. Talent Solutions." />
          <div className="g3">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.id}
                className="pillar-card"
                style={{
                  minHeight: 'auto',
                  borderTop: `3px solid ${
                    pillar.accent === 'navy' ? 'var(--navy)' : pillar.accent === 'blue-d' ? 'var(--blue-d)' : 'var(--blue)'
                  }`,
                }}
              >
                <IconBadge name={pillar.icon} size="sm" tone={pillar.accent === 'navy' ? 'navy' : 'default'} />
                <h3>{pillar.title}</h3>
                <p>
                  {pillar.id === 'consulting'
                    ? 'Specialist expertise and direction.'
                    : pillar.id === 'delivery'
                      ? 'Delivery and service ownership.'
                      : 'Additional specialist capacity.'}
                </p>
                <Link className="go" to={pillar.href}>
                  Learn more →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="Capability engine"
            title="One set of technology communities, supporting all three."
            description="Every engagement, regardless of pillar, draws on the same evaluated technology communities."
          />
          <p>
            <Link to={ROUTES.communities} className="linkish">
              See Technology Communities →
            </Link>
          </p>
        </div>
      </section>
      <section>
        <div className="shell">
          <SectionHead kicker="How we are building BesTal" title="Six principles behind the operating model." />
          <div className="g3">
            {PRINCIPLES.map((principle) => (
              <div className="card" key={principle.title}>
                <IconBadge cardKey={principle.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{principle.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="card">
            <h4>Global outlook</h4>
            <p style={{ fontSize: 14.5, marginTop: 8 }}>
              US-headquartered with a global outlook and flexible delivery model.
            </p>
          </div>
        </div>
      </section>
      <section>
        <div className="shell" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h2>Talk to BesTal</h2>
          <p className="lead" style={{ margin: '12px auto 0' }}>
            Tell us what you're working on and we'll point you to the right place to start.
          </p>
          <Link className="btn primary lg" style={{ marginTop: 20 }} to={ROUTES.contact}>
            Talk to BesTal
          </Link>
        </div>
      </section>
    </main>
  );
}
