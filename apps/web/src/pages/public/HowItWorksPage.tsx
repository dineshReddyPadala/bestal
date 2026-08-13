import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import {
  CONTROL_TABLE,
  ENGAGEMENT_STEPS,
  ONBOARDING_STEPS,
} from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function HowItWorksPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.howItWorks.title} description={PAGE_SEO.howItWorks.description} />
      <MktWrap className="mkt-page-hd max-w-[820px]">
        <div className="mkt-eyebrow">Process</div>
        <h1 className="mt-4">How BesTal works</h1>
        <p className="mkt-lead mt-6">
          Two processes run in parallel. One builds the engineering communities. One serves your
          requirement. You should be able to audit the first before you trust the second.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>Part 1 — How an engineer gets onto BesTal</h2>
          <div className="mkt-steps mt-[34px]">
            {ONBOARDING_STEPS.map((item) => (
              <div key={item.step} className="mkt-step">
                <div className="mkt-step-n">{item.step}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {'fact' in item && item.fact && (
                    <div className="mkt-fact mt-3">{item.fact}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mkt-card mkt-card-teal mt-9">
            <h3>Why the tester is external</h3>
            <p className="mt-[10px] text-base">
              A recruiter measured on placements should not be the person grading the engineer.
              Separating testing from sourcing is the only way a score means anything.
            </p>
          </div>
        </MktWrap>
      </section>

      <section className="mkt-band mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>Part 2 — How you engage</h2>
          <div className="mkt-steps mt-[34px]">
            {ENGAGEMENT_STEPS.map((item) => (
              <div key={item.step} className="mkt-step">
                <div className="mkt-step-n">{item.step}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {'fact' in item && item.fact && (
                    <div className="mkt-fact mt-3">{item.fact}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MktWrap>
      </section>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What you control</h2>
          <div className="mkt-table-wrap mt-[30px]">
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
          <div className="mkt-actions mt-9">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-primary">
              Browse Engineers
            </Link>
            <Link to="/evaluation-standard" className="mkt-btn mkt-btn-secondary">
              How we test
            </Link>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
