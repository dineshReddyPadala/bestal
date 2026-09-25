import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { Chip } from '@/components/ui/Chip';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { TrialDiagram } from '@/components/diagrams/Diagrams';
import { Passport, ProfileHead } from '@/components/workspace/Passport';
import { COMMUNITIES, EVAL_FRAMEWORK, MODELS, TALENT_FAQS } from '@/constants/content';
import { PROFESSIONALS } from '@/constants/workspace-data';
import { ROUTES } from '@/constants/routes';
import { useApp } from '@/context/app-context';

const REVIEW_ITEMS = [
  { title: 'Relevant skills', icon: 'target', description: 'The technologies and depth relevant to your requirement.' },
  { title: 'Assessment insights', icon: 'file', description: 'Evaluation results, including areas of strength and any reservations.' },
  { title: 'Availability', icon: 'clock', description: 'When the professional could realistically start.' },
  { title: 'Transparent Commercials', icon: 'commercials', description: 'Clear engagement terms and commercials before you commit.' },
];

const TRIAL_STEPS = [
  { title: '1 · Select', description: 'Any profile marked available. Assessment insights are already on the profile.' },
  { title: '2 · Define', description: 'An agreed task, success criteria, and a named contact on your side.' },
  { title: '3 · Complete', description: 'Up to 10 hours against the agreed task, aligned to your working model.' },
  { title: '4 · Decide', description: 'Continue into an engagement, request an alternative, or stop.' },
];

export function TalentPage() {
  const { openDrawer, openModal, setModel, setFilters } = useApp();
  const featured = PROFESSIONALS[0];

  return (
    <main>
      <Seo page="talent" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell heroG">
          <div>
            <span className="tag gold">Talent Solutions</span>
            <h1 style={{ marginTop: 14, fontSize: 'clamp(34px,4vw,50px)' }}>
              Access evaluated technology professionals with greater confidence.
            </h1>
            <p className="lead" style={{ marginTop: 14 }}>
              BesTal provides access to evaluated and verified technology professionals across specialist communities.
              Review relevant skills, assessment insights, availability and engagement information before deciding how
              to proceed.
            </p>
            <div className="acts">
              <Link className="btn primary lg" to={`${ROUTES.workspace}?tab=discover`}>
                Explore Technology Professionals
              </Link>
              <Link className="btn outline lg" to={ROUTES.contact}>
                Talk to BesTal
              </Link>
            </div>
            <p style={{ marginTop: 14, fontSize: 13.5 }}>
              <a href="#trial" className="linkish">
                See how the 10-Hour Trial works ↓
              </a>
            </p>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => openDrawer({ type: 'profile', index: 0 })}>
            <Chip>Demo profile - illustrative</Chip>
            <div style={{ marginTop: 12 }}>
              <ProfileHead professional={featured} hideRate />
            </div>
            <Passport professional={featured} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                className="btn gold-btn sm"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openModal({ type: 'trial', index: 0 });
                }}
              >
                Request 10-Hour Trial
              </button>
              <button
                className="btn outline sm"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openDrawer({ type: 'profile', index: 0 });
                }}
              >
                Full profile
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="Evaluation framework"
            title="What's checked before a profile is visible."
            description="Checks are applied as relevant to the engagement."
          />
          <div className="g5">
            {EVAL_FRAMEWORK.map((item) => (
              <div className="card" style={{ padding: '16px 18px' }} key={item.title}>
                <IconBadge cardKey={item.title} size="sm" />
                <h4 style={{ marginTop: 10 }}>{item.title}</h4>
                <p style={{ fontSize: 13, marginTop: 6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell">
          <SectionHead kicker="Before you decide" title="What you can review, up front." />
          <div className="g4">
            {REVIEW_ITEMS.map((item) => (
              <div className="card" key={item.title}>
                <IconBadge name={item.icon} size="sm" />
                <h4 style={{ marginTop: 12 }}>{item.title}</h4>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="Engagement models"
            title="Flexible Engagement Models"
            description="Engage specialist professionals through contract, project-based, part-time or longer-term models based on your requirement."
          />
          <div className="g4">
            {MODELS.map((model) => (
              <Link
                className="card hover"
                key={model.key}
                to={`${ROUTES.workspace}?tab=discover`}
                onClick={() => setModel(model.key)}
              >
                <IconBadge cardKey={model.key} size="sm" />
                <h4 style={{ marginTop: 12 }}>{model.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{model.description}</p>
                <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: 'var(--blue-d)' }}>
                  {model.duration} · {PROFESSIONALS.filter((person) => person.models.includes(model.key)).length}{' '}
                  professionals
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="trial">
        <div className="shell two">
          <div>
            <span className="k g">The 10-Hour Trial</span>
            <h2 style={{ marginTop: 8 }}>Review real work before you commit.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              For eligible Talent Solutions engagements, clients can work with a selected professional for up to 10
              hours on an agreed task before deciding whether to continue. The professional is paid by BesTal.
            </p>
            <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
              {TRIAL_STEPS.map((step) => (
                <div className="card" key={step.title}>
                  <b>{step.title}</b>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <TrialDiagram />
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <SectionHead
            kicker="Technology communities"
            title="Specialist professionals, organized by discipline."
            description="Every professional belongs to one community, is evaluated against that community's criteria, and is matched on assessed depth."
          />
          <div className="g5">
            {COMMUNITIES.map((community) => (
              <Link
                className="comm-card hover"
                key={community.id}
                to={`${ROUTES.workspace}?tab=discover`}
                onClick={() => setFilters((prev) => ({ ...prev, community: community.title }))}
              >
                <IconBadge cardKey={community.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{community.title}</h4>
                <p>{community.description}</p>
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
                  {PROFESSIONALS.filter((person) => person.community === community.title).length} available
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tight">
        <div className="shell two" style={{ alignItems: 'start' }}>
          <div>
            <span className="k">Common questions</span>
            <h2 style={{ marginTop: 8 }}>Straightforward answers.</h2>
          </div>
          <div className="faq">
            {TALENT_FAQS.map((item, i) => (
              <details key={item.q} open={i === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
