import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { LifeDiagram, PodDiagram, VelocityDiagram } from '@/components/diagrams/Diagrams';
import { COMMUNITIES, GOV_AREAS, SERVICE_FAMILIES } from '@/constants/content';
import { PROFESSIONALS } from '@/constants/workspace-data';
import { INITIAL_PODS } from '@/constants/workspace-data';
import { ROUTES } from '@/constants/routes';
import { useApp } from '@/context/app-context';

const ROLES = [
  {
    kicker: 'Your side',
    title: 'Client Stakeholder',
    icon: 'user_check',
    description: 'Sets priorities and accepts work. One named person on your side.',
  },
  {
    kicker: 'BesTal',
    title: 'BesTal Delivery Lead',
    icon: 'award',
    description: 'Runs the team day to day, reports to your stakeholder, owns quality and delivery.',
    highlight: true,
  },
  {
    kicker: 'BesTal',
    title: 'Specialist Delivery Team',
    icon: 'team',
    description:
      'Team composition is shaped around scope, technology requirements and the agreed delivery model, with evaluated professionals selected from relevant BesTal technology communities.',
  },
  {
    kicker: 'BesTal',
    title: 'BesTal Delivery Manager',
    icon: 'clipboard',
    description: 'Owns governance, risk and the periodic delivery report. Allocation is agreed per engagement.',
  },
];

const LIFE_CARDS = [
  { title: 'Mobilize', description: 'Team confirmed, access provisioned, ways of working agreed.' },
  { title: 'Transition & Establish', description: 'Knowledge transfer, backlog shaped, baseline understood.' },
  { title: 'Operate & Deliver', description: 'Steady delivery rhythm against the agreed governance cadence.' },
  { title: 'Improve & Scale', description: 'Add capacity, adjust scope, refine ways of working.' },
  { title: 'Transition, where required', description: 'Handover to your team or a new provider, on agreed terms.' },
];

const MODELS = [
  {
    title: 'Managed Service',
    icon: 'building',
    description: 'BesTal takes ongoing responsibility for a defined service or capability, against agreed governance.',
  },
  {
    title: 'Managed Delivery Team',
    icon: 'team',
    description: 'A named team, a monthly fee, and agreed notice to scale. Best when the roadmap is ongoing.',
  },
  {
    title: 'Project-Based Delivery',
    icon: 'package',
    description: 'A fixed price against acceptance criteria agreed before work begins. Best for migrations and integrations.',
  },
];

export function DeliveryPage() {
  const { openModal } = useApp();
  const estimateTeam = [2, 0, 6, 7, 11].map((i) => PROFESSIONALS[i]);
  const monthly = estimateTeam.reduce((sum, person) => sum + person.rate * 40 * 4.33, 0);

  return (
    <main>
      <Seo page="delivery" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell heroG">
          <div>
            <span className="tag">Managed Services</span>
            <h1 style={{ marginTop: 14, fontSize: 'clamp(34px,4vw,50px)' }}>
              Technology delivery with clear ownership, governance and accountability.
            </h1>
            <p className="lead" style={{ marginTop: 14 }}>
              Dedicated teams and managed delivery pods designed around defined technology outcomes, supported by
              structured governance and transparent delivery reporting.
            </p>
            <div className="acts">
              <button className="btn primary lg" type="button" onClick={() => openModal({ type: 'enquiry', kind: 'consulting' })}>
                Discuss Your Requirement
              </button>
              <a className="btn outline lg" href="#gov">
                See the governance model
              </a>
            </div>
          </div>
          <div className="card">
            <PodDiagram pod={INITIAL_PODS[0]} />
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="Service families"
            title="More than delivery pods."
            description="Managed Services covers four related service families, each drawing on the same technology communities."
          />
          <div className="g4">
            {SERVICE_FAMILIES.map((family) => (
              <div className="card" key={family.title}>
                <IconBadge cardKey={family.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{family.title}</h4>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{family.description}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: 18, borderLeft: '3px solid var(--indigo)' }}>
            <p style={{ fontSize: 14.5, color: 'var(--navy)', fontWeight: 500 }}>
              Talent Solutions provides capacity. Managed Services takes greater responsibility for the agreed delivery
              or service model, governance and reporting.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead kicker="Engagement structure" title="Who you actually get, and who runs them." />
          <div className="g4">
            {ROLES.map((role) => (
              <div className="card" key={role.title} style={role.highlight ? { borderColor: 'var(--blue)' } : undefined}>
                <IconBadge name={role.icon} size="sm" />
                <span className="k" style={{ marginTop: 10, display: 'block' }}>
                  {role.kicker}
                </span>
                <h4 style={{ marginTop: 4 }}>{role.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gov" className="alt">
        <div className="shell two" style={{ alignItems: 'start' }}>
          <div>
            <span className="k">Governance</span>
            <h2 style={{ marginTop: 8 }}>Measured through the engagement. Visible in your workspace.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Delivery teams report against an agreed governance framework covering six areas. What is actually
              measured, and any service levels, are agreed per engagement and set out in the statement of work.
            </p>
            <div className="g2" style={{ marginTop: 18 }}>
              {GOV_AREAS.map((area) => (
                <div className="card" style={{ padding: '16px 18px' }} key={area.title}>
                  <IconBadge cardKey={area.title} size="sm" />
                  <h4 style={{ marginTop: 10 }}>{area.title}</h4>
                  <p style={{ fontSize: 13.5, marginTop: 6 }}>{area.description}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, marginTop: 14 }}>
              The illustrative example below shows the kind of reporting a governance cadence might include — not a
              fixed or contractual standard.
            </p>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              <table className="sla">
                <thead>
                  <tr>
                    <th>Illustrative indicator</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Delivery progress</td>
                    <td>Committed vs. delivered scope, this period</td>
                  </tr>
                  <tr>
                    <td>Quality</td>
                    <td>Open defects by severity</td>
                  </tr>
                  <tr>
                    <td>Risks & dependencies</td>
                    <td>Open items, owner, target date</td>
                  </tr>
                  <tr>
                    <td>Governance cadence</td>
                    <td>Reporting frequency as agreed in the SOW</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <VelocityDiagram pod={INITIAL_PODS[0]} />
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead kicker="Lifecycle" title="From mobilization to steady state." />
          <div className="card">
            <LifeDiagram />
          </div>
          <div className="g4" style={{ marginTop: 16 }}>
            {LIFE_CARDS.map((card) => (
              <div className="card" key={card.title}>
                <h4>{card.title}</h4>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell two">
          <div>
            <span className="k">Engagement models</span>
            <h2 style={{ marginTop: 8 }}>Four ways to structure a Managed Services engagement.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              We'd rather agree scope clearly on day one than revisit it in month four.
            </p>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {MODELS.map((model) => (
                <div className="card ico-row" key={model.title}>
                  <IconBadge name={model.icon} size="sm" />
                  <div>
                    <h4>{model.title}</h4>
                    <p style={{ fontSize: 14, marginTop: 4 }}>{model.description}</p>
                  </div>
                </div>
              ))}
              <div className="card ico-row" style={{ borderColor: 'var(--indigo)' }}>
                <IconBadge name="repeat" size="sm" />
                <div>
                  <h4>Build-Operate-Transfer (BOT)</h4>
                  <p style={{ fontSize: 14, marginTop: 4 }}>
                    <b style={{ color: 'var(--navy)' }}>Build</b> the capability, team and processes →{' '}
                    <b style={{ color: 'var(--navy)' }}>Operate</b> under an agreed model →{' '}
                    <b style={{ color: 'var(--navy)' }}>Transfer</b> agreed elements on predetermined terms. Scope,
                    duration, people, transition and commercials are defined per engagement; BesTal does not present
                    this as a single standardized or proven model.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <span className="k">Illustrative estimate</span>
            <h4 style={{ marginTop: 8 }}>A 5-person team, agreed working hours</h4>
            <div className="est" style={{ marginTop: 12 }}>
              <span>Illustrative monthly run rate</span>
              <b>${Math.round(monthly / 1000)}k</b>
              <span>Lead + 4 professionals · 40 hrs/wk · rates from Passports</span>
              {estimateTeam.map((person) => (
                <div className="ln" key={person.name}>
                  <span>
                    {person.name} · {person.role}
                  </span>
                  <span>${((person.rate * 40 * 4.33) / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
            <Link className="btn primary" style={{ width: '100%', marginTop: 12 }} to={`${ROUTES.workspace}?tab=teams`}>
              Build your own in the workspace
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead kicker="Capability behind the service" title="Supported by five technology communities." />
          <div className="g5">
            {COMMUNITIES.map((community) => (
              <Link className="comm-card hover" key={community.id} to={ROUTES.communities}>
                <IconBadge cardKey={community.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{community.title}</h4>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{community.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell two">
          <div>
            <span className="k">In your workspace</span>
            <h2 style={{ marginTop: 8 }}>Visibility into what's happening, and why.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Depending on the engagement, the BesTal Client Workspace can show delivery progress, team information,
              service indicators, risks and actions, utilization, approvals and commercials. Not every feature applies
              to every engagement.
            </p>
            <Link className="btn outline" style={{ marginTop: 16 }} to={`${ROUTES.workspace}?tab=delivery`}>
              See it in the workspace
            </Link>
          </div>
          <div>
            <span className="k">When Managed Services fits</span>
            <h2 style={{ marginTop: 8 }}>And when another pillar fits better.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Use Managed Services when you need defined delivery ownership, an ongoing service, a dedicated managed
              team, or specialist capability combined with accountability. If you need advice before committing, start
              with{' '}
              <Link to={ROUTES.consulting} className="linkish">
                Technology Consulting
              </Link>
              . If you need direct additional capacity,{' '}
              <Link to={ROUTES.talent} className="linkish">
                Talent Solutions
              </Link>{' '}
              may fit better.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
