import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { TRIAL_SETTLED, TRIAL_STEPS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function TryForAWeekPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.tryForAWeek.title} description={PAGE_SEO.tryForAWeek.description} />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">20-hour free trial</div>
        <h1 className="mt-4">
          Don&apos;t hire from a résumé.
          <br />
          See them perform.
        </h1>
        <p className="mkt-lead mt-[26px]">
          20 hours of real work with your team — free — before you commit to anything.
        </p>
        <p className="mkt-pull mt-[34px]">
          You&apos;re not buying a résumé. You&apos;re getting half a working week of evidence, at
          no cost.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>Why 20 hours</h2>
          <p className="mkt-big mt-[18px]">
            Half a working week is long enough to ship something real — a feature, a pipeline, a
            fix, a migration step — and see how someone handles your codebase, your ambiguity and
            your standup.
          </p>
          <p className="mkt-big mt-4">
            It&apos;s short enough that you find out fast, and short enough that saying no costs you
            nothing but the calendar time.
          </p>
          <p className="mkt-big mt-4">
            And it&apos;s free because we&apos;d rather prove the engineer than argue about them. If
            the work isn&apos;t good, you shouldn&apos;t be paying for the privilege of discovering
            that.
          </p>
        </MktWrap>
      </section>

      <section className="mkt-band mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>How it works</h2>
          <div className="mkt-steps mt-8">
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
        </MktWrap>
      </section>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What&apos;s settled</h2>
          <ul className="mkt-tk mt-[22px]">
            {TRIAL_SETTLED.map((item) => (
              <li key={item.strong}>
                <strong className="text-[var(--mkt-ink)]">{item.strong}</strong>
                {item.rest}
              </li>
            ))}
          </ul>
          <div className="mkt-fact mt-[26px]">
            [FACT: trial limits — one free trial per role, per client, or per quarter? Any cap on
            concurrent trials? Confirm with Finance before publishing as unconditional.]
          </div>

          <h2 className="mt-14">What we ask of you</h2>
          <p className="mkt-big mt-[18px]">
            A trial only produces evidence if it&apos;s a real 20 hours. That means access provisioned
            on day one, a defined deliverable, a manager who&apos;s available, and inclusion in the
            team&apos;s normal rhythm.
          </p>
          <p className="mkt-big mt-4">
            An engineer left waiting for a VPN account for two days hasn&apos;t been evaluated.
            They&apos;ve been parked.
          </p>

          <h2 className="mt-14">If it doesn&apos;t work</h2>
          <p className="mkt-big mt-[18px]">
            Tell us why. Structured feedback takes about two minutes and is what makes the next match
            better than the last.
          </p>
          <div className="mkt-fact mt-[14px]">[FACT: replacement turnaround commitment]</div>
          <p className="mkt-big mt-5">
            No renegotiation. No retention conversation. A trial that ends did its job.
          </p>
          <div className="mkt-actions mt-9">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-amber mkt-btn-lg">
              Browse trial-ready engineers
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
              Tell us what you need
            </Link>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
