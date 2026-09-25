import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { Chip } from '@/components/ui/Chip';
import { IconBadge } from '@/components/ui/IconBadge';
import { SCENARIOS } from '@/constants/content';
import { ROUTES } from '@/constants/routes';

export function HelpPage() {
  return (
    <main>
      <Seo page="help" />
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="dotgrid" />
        <div className="shell" style={{ maxWidth: 820 }}>
          <span className="tag">How We Can Help</span>
          <h1 style={{ marginTop: 14 }}>Ways BesTal's service model can be applied.</h1>
        </div>
      </section>
      <section className="tight">
        <div className="shell">
          <div className="card" style={{ borderLeft: '3px solid var(--indigo)', background: 'var(--tint-ai)' }}>
            <p style={{ fontSize: 14.5, color: 'var(--navy)', fontWeight: 500 }}>
              These are representative scenarios illustrating how the BesTal service model can be applied. They are not
              presented as completed client engagements.
            </p>
          </div>
        </div>
      </section>
      <section className="tight">
        <div className="shell">
          <div id="scenarioList" style={{ display: 'grid', gap: 12 }}>
            {SCENARIOS.map((scenario) => (
              <details className="card" style={{ padding: 0, overflow: 'hidden' }} key={scenario.name}>
                <summary
                  style={{
                    padding: '18px 22px',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <IconBadge cardKey={scenario.name} size="sm" />
                  <span style={{ flex: 1, fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 17, color: 'var(--navy)' }}>
                    {scenario.name}
                  </span>
                  <span style={{ fontFamily: 'var(--ff)', fontSize: 13, fontWeight: 600, color: 'var(--blue-d)' }}>
                    Expand ↓
                  </span>
                </summary>
                <div style={{ padding: '0 22px 22px' }}>
                  <div className="chips" style={{ marginBottom: 14 }}>
                    {scenario.models.map((model) => (
                      <Chip key={model} accent>
                        {model}
                      </Chip>
                    ))}
                    {scenario.communities.map((community) => (
                      <Chip key={community}>{community}</Chip>
                    ))}
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>Challenge</p>
                  <p style={{ fontSize: 14, margin: '4px 0 12px' }}>{scenario.challenge}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>Potential BesTal Approach</p>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{scenario.approach}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="alt tight">
        <div className="shell" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h2>Have a different technology challenge?</h2>
          <p className="lead" style={{ margin: '12px auto 0' }}>
            Start with the requirement — not the service.
          </p>
          <Link className="btn primary lg" style={{ marginTop: 20 }} to={ROUTES.contact}>
            Talk to BesTal
          </Link>
        </div>
      </section>
    </main>
  );
}
