import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { CONSULTING_STEPS, LADDER, PILLARS, PRACTICES } from '@/constants/content';
import { ROUTES } from '@/constants/routes';
import { useApp } from '@/context/app-context';

export function ConsultingPage() {
  const { openModal } = useApp();
  const [clarity, setClarity] = useState<number | null>(null);
  const [scope, setScope] = useState<number | null>(null);

  const recommended =
    clarity === null || scope === null ? null : scope === 2 ? 3 : clarity === 0 ? 0 : clarity === 1 ? 1 : 2;
  const suggested = recommended === null ? null : LADDER[recommended];

  const clarityOptions = [
    'Not sure what we need yet',
    'We have a scope and need expert input',
    'We know the target and need a roadmap',
    'Part of a larger transformation program',
  ];
  const scopeOptions = ['Weeks', 'Months', 'A year or more'];

  return (
    <main>
      <Seo page="consulting" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell" style={{ maxWidth: 820 }}>
          <span className="tag">Technology Consulting</span>
          <h1 style={{ marginTop: 14 }}>
            Specialist expertise for critical technology decisions and transformation initiatives.
          </h1>
          <p className="lead" style={{ marginTop: 16 }}>
            From architecture and modernization to Data, AI, Cloud and enterprise platforms, BesTal brings specialist
            expertise to help organizations assess options, define the right path and move from strategy to execution.
          </p>
          <div className="acts">
            <button className="btn primary lg" type="button" onClick={() => openModal({ type: 'enquiry', kind: 'consulting' })}>
              Discuss Your Technology Challenge
            </button>
            <a className="btn outline lg" href="#ladder">
              Explore Engagement Models
            </a>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="How the three pillars differ"
            title="Expertise, delivery ownership, or capacity — which do you need?"
          />
          <div className="g3">
            {PILLARS.map((pillar, i) => (
              <div
                className="card"
                key={pillar.id}
                style={i === 0 ? { borderColor: 'var(--blue)', boxShadow: '0 0 0 2px var(--tint-blue)' } : undefined}
              >
                <IconBadge name={pillar.icon} size="sm" />
                <h4 style={{ marginTop: 12 }}>{pillar.title}</h4>
                <p style={{ fontSize: 14, marginTop: 8 }}>
                  {i === 0
                    ? 'Specialist expertise and direction. You need to decide, assess options, or define a path — and may want us to help execute it.'
                    : i === 1
                      ? 'Delivery and service ownership. You want BesTal to take greater responsibility for an agreed outcome, with governance and reporting.'
                      : 'Additional specialist capacity. You know what to build and who leads it; you need evaluated professionals to join your team.'}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, fontSize: 14.5 }}>
            Where the requirement is primarily additional capacity rather than consulting ownership, Talent Solutions
            may be the more appropriate engagement model.
          </p>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead kicker="How we engage" title="A consulting-specific path, start to finish." />
          <div className="steps5">
            {CONSULTING_STEPS.map((step) => (
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

      <section id="ladder">
        <div className="shell">
          <SectionHead
            kicker="Engagement models"
            title="Engagements Built Around the Requirement"
            description="From focused advisory and discovery to transformation initiatives and ongoing specialist support, the scope and duration are shaped around the outcome you need."
          />
          <div className="g2" style={{ marginBottom: 20, alignItems: 'start' }}>
            <div>
              <p style={{ fontWeight: 650, marginBottom: 8, color: 'var(--navy)' }}>How clear is the path?</p>
              <div className="rolepal">
                {clarityOptions.map((label, i) => (
                  <button key={label} type="button" className={clarity === i ? 'on' : ''} onClick={() => setClarity(i)}>
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ fontWeight: 650, margin: '16px 0 8px', color: 'var(--navy)' }}>What's the expected scope?</p>
              <div className="rolepal">
                {scopeOptions.map((label, i) => (
                  <button key={label} type="button" className={scope === i ? 'on' : ''} onClick={() => setScope(i)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="card">
              {suggested ? (
                <>
                  <span className="tag">Suggested</span>
                  <h3 style={{ marginTop: 10 }}>{suggested.name}</h3>
                  <p style={{ fontSize: 14, marginTop: 6 }}>{suggested.description}</p>
                  <div className="kv">
                    <div>
                      <span>Duration</span>
                      <b>{suggested.duration}</b>
                    </div>
                    <div>
                      <span>You get</span>
                      <b>{suggested.outcome}</b>
                    </div>
                  </div>
                  <button
                    className="btn primary sm"
                    type="button"
                    style={{ marginTop: 10 }}
                    onClick={() => openModal({ type: 'enquiry', kind: 'consulting' })}
                  >
                    Discuss This With BesTal
                  </button>
                </>
              ) : (
                <p style={{ fontSize: 14 }}>
                  Answer both and we'll suggest an engagement model to discuss. Indicative duration is shown as
                  supporting information only — scope is shaped around the outcome, not a fixed package.
                </p>
              )}
            </div>
          </div>
          <div className="ladder">
            {LADDER.map((item, i) => (
              <div className={`rung ${recommended === i ? 'r' : ''}`} key={item.name}>
                <IconBadge cardKey={item.name} size="sm" />
                <h4 style={{ marginTop: 12 }}>{item.name}</h4>
                <p>{item.description}</p>
                <div className="out">{item.outcome}</div>
                <div className="dur" style={{ marginTop: 8, fontWeight: 500 }}>
                  {item.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="Where we focus"
            title="Six areas of specialist focus."
            description="Not a service catalogue — these are the areas where we bring relevant depth."
          />
          <div className="g3">
            {PRACTICES.map((practice) => (
              <div className="card" key={practice.title}>
                <IconBadge cardKey={practice.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{practice.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{practice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead
            kicker="Fit"
            title="Where we may not be the right fit."
            description="We focus on areas where we can bring relevant expertise and deliver responsibly. Where a requirement falls outside our capabilities or operating model, we will communicate that early."
          />
          <div className="g2">
            <div className="card">
              <ul style={{ margin: 0, paddingLeft: 18, color: '#41506B', fontSize: 14.5, lineHeight: 1.9 }}>
                <li>Work outside the six areas above</li>
                <li>Fixed price on a scope that isn't yet defined — that's a Discovery & Assessment engagement</li>
                <li>Staff augmentation presented as consulting ownership</li>
              </ul>
            </div>
            <div className="card">
              <ul style={{ margin: 0, paddingLeft: 18, color: '#41506B', fontSize: 14.5, lineHeight: 1.9 }}>
                <li>On-site engagements — our teams work remotely, aligned to your working model</li>
                <li>Work requiring certifications we don't currently hold — we'll say so directly</li>
                <li>Open-ended commitments without an agreed scope or milestone</li>
              </ul>
            </div>
          </div>
          <div className="acts" style={{ marginTop: 22 }}>
            <button className="btn primary lg" type="button" onClick={() => openModal({ type: 'enquiry', kind: 'consulting' })}>
              Discuss Your Technology Challenge
            </button>
            <Link className="btn outline lg" to={ROUTES.delivery}>
              Or explore Managed Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
