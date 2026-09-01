import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { useFreeTrialHours } from '../../hooks/api/useTrialPolicy';
import {
  buildTrialSettled,
  buildTrialSteps,
  buildTryForAWeekSeo,
} from '../../lib/marketing-trial-copy';
import {
  formatFirstFreeTrialHours,
  formatFreeTrialHours,
} from '../../lib/trial-policy';
import { ForwardArrow } from '@/components/ui/ForwardArrow';

export function TryForAWeekPage() {
  const freeTrialHours = useFreeTrialHours();
  const trialSteps = useMemo(() => buildTrialSteps(freeTrialHours), [freeTrialHours]);
  const trialSettled = useMemo(() => buildTrialSettled(freeTrialHours), [freeTrialHours]);
  const pageSeo = useMemo(() => buildTryForAWeekSeo(freeTrialHours), [freeTrialHours]);
  const hoursLabel = formatFreeTrialHours(freeTrialHours);

  return (
    <div className="mkt-trial-page">
      <PageMeta title={pageSeo.title} description={pageSeo.description} />

      <section className="mkt-trial-hero-band mkt-white">
        <MktShell className="mkt-trial-hero">
          <div className="mkt-trial-label">Trial</div>
          <h1>
            Don&apos;t hire from a resume.
            <br />
            See them perform.
          </h1>
          <p className="mkt-lead howitworks-body-style">
            See their test results, rate, and start date upfront—then try them for free before you commit.
          </p>
          <p className="mkt-lead mkt-trial-sub howitworks-body-style">
            No recruiter calls. No sourcing cycle. No commitment for {formatFirstFreeTrialHours(freeTrialHours)}.
          </p>
          <div className="mkt-actions">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-amber">
              Browse Pre-Vetted Talent <ForwardArrow />
            </Link>
            <Link to="/reach-out" className="mkt-btn mkt-btn-secondary">
              Tell us what you need
            </Link>
          </div>
        </MktShell>
      </section>

      <section className="mkt-trial-quote-band">
        <MktShell>
          <p className="mkt-trial-quote">
            You are getting {hoursLabel} of Evidence at no Cost.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trial-why">
        <MktShell>
          <h2>Why {hoursLabel}</h2>
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
            {trialSteps.map((item) => (
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
            {trialSettled.map((item) => (
              <li key={item.strong}>
                <span>
                  <strong>{item.strong}</strong>
                  {item.rest}
                </span>
              </li>
            ))}
          </ul>
        </MktShell>
      </section>
    </div>
  );
}
