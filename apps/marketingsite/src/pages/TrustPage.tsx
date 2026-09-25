import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { FunnelDiagram } from '@/components/diagrams/Diagrams';
import { DIMENSIONS, DIMENSION_DETAILS, EVAL_FRAMEWORK, TRUST_PILLARS } from '@/constants/content';
import { ROUTES } from '@/constants/routes';
import { useApp } from '@/context/app-context';

const DATA_CARDS = [
  {
    title: 'Data Protection & Privacy',
    icon: 'lock',
    description:
      'Client information is accessed on a purpose basis, under appropriate controls and responsible handling. Retention and closure follow the applicable agreement and internal procedures.',
  },
  {
    title: 'Confidentiality & Client IP',
    icon: 'eye_off',
    description:
      'Confidentiality, work-product and IP ownership, and post-engagement obligations are addressed in the applicable MSA, SOW or engagement agreement — the website reflects what the contract says, not the reverse.',
  },
  {
    title: 'Access & Security Controls',
    icon: 'key',
    description:
      'Security requirements vary by environment, systems, information and engagement. Relevant access and security requirements are agreed per engagement.',
  },
];

const GOV_ITEMS = [
  'Roles & Responsibilities',
  'Delivery Visibility',
  'Risk & Issue Management',
  'Governance Cadence',
  'Change Management',
];

export function TrustPage() {
  const { openModal } = useApp();
  return (
    <main>
      <Seo page="trust" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell" style={{ maxWidth: 800 }}>
          <span className="tag">Trust & Governance</span>
          <h1 style={{ marginTop: 14 }}>
            Confidence built through transparency, responsible practices and clear accountability.
          </h1>
          <p className="lead" style={{ marginTop: 14 }}>
            BesTal combines technology-focused evaluation, identity and background verification, transparent
            engagement information and appropriate data protection controls to help clients make more informed
            decisions.
          </p>
        </div>
      </section>
      <section className="alt">
        <div className="shell">
          <SectionHead kicker="Six pillars" title="The enterprise trust model behind every engagement." />
          <div className="g3">
            {TRUST_PILLARS.map((pillar) => (
              <div className="card" key={pillar.title}>
                <IconBadge cardKey={pillar.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{pillar.title}</h4>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="shell two" style={{ alignItems: 'start' }}>
          <div className="card">
            <FunnelDiagram />
          </div>
          <div>
            <span className="k">Professional evaluation</span>
            <h2 style={{ marginTop: 8 }}>What's checked, as applicable to the engagement.</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
              {EVAL_FRAMEWORK.map((item) => (
                <div className="card" style={{ padding: '16px 18px' }} key={item.title}>
                  <IconBadge cardKey={item.title} size="sm" />
                  <h4 style={{ marginTop: 10 }}>{item.title}</h4>
                  <p style={{ fontSize: 13, marginTop: 6 }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="shell">
          <SectionHead kicker="Assessment" title="Five areas, reviewed separately." />
          <div style={{ display: 'grid', gap: 10 }}>
            {DIMENSIONS.map((dim, i) => (
              <div className="card" style={{ padding: '16px 18px' }} key={dim}>
                <h4>{dim}</h4>
                <p style={{ fontSize: 14, marginTop: 4 }}>{DIMENSION_DETAILS[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="shell">
          <SectionHead kicker="Data, confidentiality & security" title="How information is handled." />
          <div className="g3">
            {DATA_CARDS.map((card) => (
              <div className="card" key={card.title}>
                <IconBadge name={card.icon} size="sm" />
                <h4 style={{ marginTop: 12 }}>{card.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="shell two">
          <div>
            <span className="k">Delivery governance</span>
            <h2 style={{ marginTop: 8 }}>Accountability, connected to how work actually gets delivered.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Delivery Governance ties directly into Managed Services: roles and responsibilities, delivery visibility,
              risk and issue management, a governance cadence, and change management.
            </p>
            <Link className="btn outline" style={{ marginTop: 14 }} to={ROUTES.delivery}>
              See Managed Services governance
            </Link>
          </div>
          <div className="card">
            <ul style={{ margin: 0, paddingLeft: 18, color: '#41506B', fontSize: 14.5, lineHeight: 2 }}>
              {GOV_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section>
        <div className="shell">
          <div className="navyblock" style={{ padding: 36 }}>
            <span className="tag" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}>
              Security & Data Protection
            </span>
            <h2 style={{ marginTop: 14 }}>Appropriate controls, available for review.</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              BesTal applies appropriate controls around professional information, client information, access,
              confidentiality and intellectual property. Relevant security and procurement information can be provided
              during client due diligence.
            </p>
            <p style={{ marginTop: 16, fontSize: 13.5, color: '#B9C6DC' }}>
              BesTal does not claim ISO 27001, SOC 2 or GDPR/DPDP certification, continuous 24×7 monitoring, or
              penetration-testing coverage, unless independently verified and contractually confirmed for a specific
              engagement.
            </p>
            <div className="acts">
              <button className="btn gold-btn" type="button" onClick={() => openModal({ type: 'enquiry', kind: 'security' })}>
                Request Procurement Information
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
