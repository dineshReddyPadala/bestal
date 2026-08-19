import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { TRIAL_SETTLED, TRIAL_STEPS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { ForwardArrow } from '@/components/ui/ForwardArrow';

export function TryForAWeekPage() {
  return (
    <div className="mkt-trial-page">
      <PageMeta title={PAGE_SEO.tryForAWeek.title} description={PAGE_SEO.tryForAWeek.description} />

      <div className="mkt-white">
        <MktShell className="mkt-trial-hero">
          <div className="mkt-trial-label">Trial</div>
          <h1>
            Don&apos;t hire from a résumé.
            <br />
            See them perform.
          </h1>
          <p className="mkt-lead howitworks-body-style">
            See their test results, rate, and start date upfront—then try them for free before you commit.
          </p>
          <p className="mkt-lead mkt-trial-sub howitworks-body-style">
            No recruiter calls. No sourcing cycle. No commitment for the first 10 hours.
          </p>
          <div className="mkt-actions">
            <Link to="/login/portals" className="mkt-btn mkt-btn-amber">
              Browse Pre Vetted Talent <ForwardArrow />
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-secondary">
              Tell us what you need
            </Link>
          </div>
        </MktShell>
        
      </div>

      <section className="mkt-trial-quote-band">
        <MktShell>
          <p className="mkt-trial-quote">
            You are getting 20hrs of Evidence at no Cost.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trial-why">
        <MktShell>
          <h2>Why 10 hours</h2>
          <p>
            Half a working week is long enough to ship something real — a feature, a pipeline, a
            fix, a migration step — and see how someone handles your codebase, your ambiguity and
            your standup.
          </p>
          <p>
            It&apos;s short enough that you find out fast, and short enough that saying no costs you
            nothing but the calendar time.
          </p>
          <p>
            And it&apos;s free because we&apos;d rather prove the engineer than argue about them. If
            the work isn&apos;t good, you shouldn&apos;t be paying for the privilege of discovering
            that.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trial-how">
        <MktShell>
          <h2>How it works</h2>
          <div className="mkt-steps mkt-trial-steps">
            {TRIAL_STEPS.map((item) => (
              <div key={item.step} className="mkt-step">
                <div className="mkt-step-n">{item.step}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trial-settled">
        <MktShell>
          <h2>What&apos;s settled</h2>
          <ul className="mkt-tk">
            {TRIAL_SETTLED.map((item) => (
              <li key={item.strong}>
                <span>
                  <strong>{item.strong}</strong>
                  {item.rest}
                </span>
              </li>
            ))}
          </ul>
          {/* <div className="mkt-fact">
            [FACT: trial limits — one free trial per role, per client, or per quarter? Any cap on
            concurrent trials? Confirm with Finance before publishing as unconditional.]
          </div> */}
        </MktShell>
      </section>

      {/* <section className="mkt-section mkt-trial-ask">
        <MktShell>
          <h2>What we ask of you</h2>
          <p>
            A trial only produces evidence if it&apos;s a real 20 hours. That means access
            provisioned on day one, a defined deliverable, a manager who&apos;s available, and
            inclusion in the team&apos;s normal rhythm.
          </p>
          <p>
            An engineer left waiting for a VPN account for two days hasn&apos;t been evaluated.
            They&apos;ve been parked.
          </p>
        </MktShell>
      </section> */}

      {/* <section className="mkt-section mkt-trial-end">
        <MktShell>
          <h2>If it doesn&apos;t work</h2>
          <p>
            Tell us why. Structured feedback takes about two minutes and is what makes the next
            match better than the last.
          </p>
          <div className="mkt-fact">[FACT: replacement turnaround commitment]</div>
          <p>No renegotiation. No retention conversation. A trial that ends did its job.</p>
          <div className="mkt-actions">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-amber">
              Browse trial-ready engineers
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-secondary">
              Tell us what you need
            </Link>
          </div>
        </MktShell>
      </section> */}
    </div>
  );
}
