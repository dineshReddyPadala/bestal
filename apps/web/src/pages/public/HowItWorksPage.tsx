import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import {
  CONTROL_TABLE,
  ENGAGEMENT_STEPS,
  ONBOARDING_STEPS,
} from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { ForwardArrow } from '@/components/ui/ForwardArrow';

export function HowItWorksPage() {
  return (
    <div className="mkt-hiw-page">
      <PageMeta title={PAGE_SEO.howItWorks.title} description={PAGE_SEO.howItWorks.description} />
      <section className="mkt-hiw-hero-band">
        <MktShell className="mkt-page-hd mkt-hiw-hero">
          <div className="mkt-hiw-label">Process</div>
          <h1>How BesTal works</h1>
          <p className="mkt-lead howitworks-body-style">
            Two processes run in parallel. One builds the engineering communities. One serves your requirement. You should be able to audit the first before you trust the second.
          </p>
          <div className="mkt-actions">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-primary">
              Browse Pre-Vetted Talent <ForwardArrow />
            </Link>
            <Link to="/evaluation-standard" className="mkt-btn mkt-btn-secondary">
              See how we test
            </Link>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-hiw-part">
        <MktShell className="mkt-hiw-grid">
          <div className="mkt-hiw-sticky">
            <h2>
              Part 1 — How
              <br />
              an engineer
              <br />
              gets onto BesTal
            </h2>
          </div>
          <div>
            <div className="mkt-hiw-card">
              <div className="mkt-steps">
                {ONBOARDING_STEPS.map((item) => (
                  <div key={item.step} className="mkt-step">
                    <div className="mkt-step-n">{item.step}</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      {/* {'fact' in item && item.fact && (
                        <div className="mkt-fact mt-3">{item.fact}</div>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="mkt-hiw-note mt-9">
              <h3>Why the tester is external</h3>
              <p className="mt-[10px] text-base">
                A recruiter measured on placements should not be the person grading the engineer.
                Separating testing from sourcing is the only way a score means anything.
              </p>
            </div> */}
          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section">
        <MktShell className="mkt-hiw-grid">
          <div className="mkt-hiw-sticky">
            <h2>
              Part 2 — How
              <br />
              your requirement
              <br />
              gets served
            </h2>
          </div>
          <div className="mkt-hiw-card">
            <div className="mkt-steps">
              {ENGAGEMENT_STEPS.map((item) => (
                <div key={item.step} className="mkt-step">
                  <div className="mkt-step-n">{item.step}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    {/* {'fact' in item && item.fact && (
                      <div className="mkt-fact mt-3">{item.fact}</div>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-control">
        <MktShell>
          <h2>What you control</h2>
          <div className="mkt-table-wrap mkt-control-table mt-[30px]">
            <table className="mkt-ct">
              <thead>
                <tr>
                  <th>You control</th>
                  <th>We handle</th>
                </tr>
              </thead>
              <tbody>
                {CONTROL_TABLE.youControl.map((you, index) => (
                  <tr key={you}>
                    <td>{you}</td>
                    <td>{CONTROL_TABLE.weHandle[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
