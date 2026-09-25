import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { IconBadge } from '@/components/ui/IconBadge';
import { SectionHead } from '@/components/ui/SectionHead';
import { EngineDiagram, ReqFlowDiagram } from '@/components/diagrams/Diagrams';
import { COMMUNITIES } from '@/constants/content';
import { ROUTES } from '@/constants/routes';

const MODEL_POINTS = [
  {
    title: 'Focused Capability',
    description: 'Each community covers a coherent set of technologies, not a catch-all category.',
  },
  {
    title: 'Evaluation & Verification',
    description: 'Professionals are evaluated against criteria relevant to their community before becoming visible.',
  },
  {
    title: 'Client Readiness',
    description: 'Availability and engagement information are kept current, so a match reflects reality.',
  },
  {
    title: 'Continuous Evolution',
    description:
      'Communities evolve based on recurring client demand, technology shifts and areas where BesTal can build relevant depth.',
  },
];

export function CommunitiesPage() {
  return (
    <main>
      <Seo page="communities" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell" style={{ maxWidth: 820 }}>
          <span className="tag">Technology Communities</span>
          <h1 style={{ marginTop: 14 }}>Technology expertise organized around the capabilities our clients need.</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            One capability engine supporting Technology Consulting, Managed Services and Talent Solutions.
          </p>
        </div>
      </section>
      <section className="alt">
        <div className="shell">
          <div className="card">
            <EngineDiagram />
          </div>
        </div>
      </section>
      <section>
        <div className="shell">
          <SectionHead kicker="Five communities" title="Specialist depth, not a general resume database." />
          <div className="g5">
            {COMMUNITIES.map((community) => (
              <div className="comm-card" key={community.id}>
                <IconBadge cardKey={community.title} size="sm" />
                <h4 style={{ marginTop: 12 }}>{community.title}</h4>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{community.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="shell">
          <SectionHead kicker="How the community model works" title="More than a directory." />
          <div className="g4">
            {MODEL_POINTS.map((point) => (
              <div className="card" key={point.title}>
                <h4>{point.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="shell">
          <SectionHead kicker="How a requirement flows" title="Challenge-led, not headcount-led." />
          <div className="card">
            <ReqFlowDiagram />
          </div>
        </div>
      </section>
      <section className="alt tight">
        <div className="shell" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h2>Join a BesTal Technology Community</h2>
          <p className="lead" style={{ margin: '12px auto 0' }}>
            For technology professionals. Joining a community does not guarantee an engagement.
          </p>
          <Link className="btn outline lg" style={{ marginTop: 20 }} to={ROUTES.candidate}>
            Join Our Community
          </Link>
        </div>
      </section>
    </main>
  );
}
