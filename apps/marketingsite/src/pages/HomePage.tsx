import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { SolutionFinder } from '@/components/sections/SolutionFinder';
import { HeroDiagram } from '@/components/diagrams/Diagrams';
import { CHALLENGES, COMMUNITIES, HOME_STEPS, PILLARS, WHY_ITEMS } from '@/constants/content';
import { ROUTES } from '@/constants/routes';

export function HomePage() {
  return (
    <main>
      <Seo page="home" />
      <section className="hero">
        <div className="dotgrid" />
        <div className="shell heroG">
          <div>
            <h1>
              Technology capability.
              <br />
              On your terms.
            </h1>
            <p className="lead">
              BesTal Solutions helps organizations solve complex challenges, deliver critical initiatives and scale
              capability through Technology Consulting, Managed Services and Talent Solutions.
            </p>
            <div className="acts">
              <a className="btn primary lg" href="#pillars">
                Explore Our Solutions
              </a>
              <Link className="btn outline lg" to={ROUTES.contact}>
                Talk to BesTal
              </Link>
            </div>
            <div className="pillars-strip">
              <Link to={ROUTES.consulting}>Technology Consulting</Link>
              <Link to={ROUTES.delivery}>Managed Services</Link>
              <Link to={ROUTES.talent}>Talent Solutions</Link>
            </div>
          </div>
          <div className="heroPanel">
            <span className="k">Where clients start</span>
            <h3 style={{ marginTop: 8 }}>One partner, three ways to engage</h3>
            <p style={{ fontSize: 14, marginTop: 10 }}>
              Organizations can engage BesTal in more than one way over time — specialist advice for critical
              decisions, managed delivery when greater ownership is needed, and specialist capacity as requirements
              scale.
            </p>
            <div className="divider" style={{ margin: '18px 0' }} />
            <HeroDiagram />
          </div>
        </div>
      </section>

      <section id="pillars">
        <div className="shell">
          <SectionHead kicker="Three Ways to Engage" title="Three ways to help you build, transform and scale." />
          <div className="g3">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.id}
                className="pillar-card"
                style={{
                  borderTop: `3px solid ${
                    pillar.accent === 'navy' ? 'var(--navy)' : pillar.accent === 'blue-d' ? 'var(--blue-d)' : 'var(--blue)'
                  }`,
                }}
              >
                <IconBadge name={pillar.icon} tone={pillar.accent === 'navy' ? 'navy' : 'default'} />
                <h3>{pillar.title}</h3>
                <p className="sub">{pillar.subtitle}</p>
                <p>{pillar.description}</p>
                <ul>
                  {pillar.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link className="go" to={pillar.href}>
                  Explore {pillar.title} →
                </Link>
              </article>
            ))}
          </div>
          <p style={{ marginTop: 22, fontSize: 14.5, fontWeight: 600, color: 'var(--navy)' }}>
            Three engagement models. One connected capability.
          </p>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead kicker="What we help solve" title="Complex challenges. Practical ways forward." />
          <div className="g3">
            {CHALLENGES.map((challenge) => (
              <div className="chall-card ico-row" key={challenge.title}>
                <IconBadge cardKey={challenge.title} size="sm" />
                <div>
                  <h4>{challenge.title}</h4>
                  <p>{challenge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead
            kicker="Capability engine"
            title="Specialist communities powering our solutions."
            description="Our focused communities bring together specialist expertise across the capabilities organizations need to build, modernize and scale."
          />
          <div className="g5">
            {COMMUNITIES.map((community) => (
              <div className="comm-card hover" key={community.id}>
                <IconBadge cardKey={community.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>
                  <Link to={ROUTES.talent}>{community.title}</Link>
                </h4>
                <p>{community.description}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 18, fontSize: 14 }}>
            <Link to={ROUTES.communities} className="linkish">
              Explore Technology Communities →
            </Link>
          </p>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead kicker="Why BesTal" title="A flexible partner built around your needs." />
          <div className="g2" style={{ gap: '28px 40px' }}>
            {WHY_ITEMS.map((item) => (
              <div className="why-item" key={item.title}>
                <div className="dot">
                  <Icon name={item.icon as IconName} size={18} />
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead kicker="Workflow" title="From a challenge to the right engagement." />
          <div className="steps5">
            {HOME_STEPS.map((step) => (
              <div className="step" key={step.title}>
                <IconBadge name={step.icon} size="sm" />
                <div className="k" style={{ marginTop: 10 }}>
                  {step.kicker}
                </div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell two">
          <div>
            <span className="k" style={{ color: 'var(--purple)' }}>
              Solution Finder
            </span>
            <h2 style={{ marginTop: 8 }}>What challenge are you working through?</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              Tell us what you're working on, in plain language. We'll point you to the right BesTal engagement
              approach.
            </p>
          </div>
          <SolutionFinder />
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="finalcta">
            <div className="dotgrid" />
            <h2>Building something important? Let's talk.</h2>
            <p className="lead" style={{ margin: '14px auto 0', maxWidth: 640 }}>
              Whether you need specialist expertise, delivery ownership or additional capacity, BesTal can help
              identify the right engagement approach.
            </p>
            <div className="acts" style={{ justifyContent: 'center' }}>
              <Link className="btn gold-btn lg" to={ROUTES.contact}>
                Talk to BesTal
              </Link>
              <a className="btn outline-dark lg" href="#pillars">
                Explore Our Solutions
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
