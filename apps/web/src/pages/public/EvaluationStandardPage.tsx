import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { EVALUATION_DIMENSIONS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function EvaluationStandardPage() {
  return (
    <>
      <PageMeta
        title={PAGE_SEO.evaluationStandard.title}
        description={PAGE_SEO.evaluationStandard.description}
      />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">Our testing standard</div>
        <h1 className="mt-4">
          A résumé is a claim.
          <br />A test is evidence.
        </h1>
        <p className="mkt-lead mt-[26px]">
          Talent platforms compete on acceptance rates — a number you cannot verify, produced by a
          process you cannot see, about an engineer you have not met.
        </p>
        <p className="mkt-lead mt-4">
          That&apos;s the wrong artifact. So we publish a different one: the test.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What gets tested</h2>
          <p className="mkt-big mt-4">Five areas, scored separately.</p>
          <div className="mkt-steps mt-[30px]">
            {EVALUATION_DIMENSIONS.map((item, index) => (
              <div key={item.title} className="mkt-step">
                <div className="mkt-step-n">{index + 1}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mkt-card mkt-card-amber mt-[30px]">
            <p className="text-[16.5px] text-[var(--mkt-ink)]">
              Communication is scored separately and shown separately. A strong engineer who
              can&apos;t work with your team isn&apos;t a fit, and averaging that away would hide it.
            </p>
          </div>
        </MktWrap>
      </section>

      <section className="mkt-band mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>Who does the testing</h2>
          <p className="mkt-lead mt-5 font-medium text-[var(--mkt-ink)]">
            The tester is not a BesTal recruiter.
          </p>
          <p className="mkt-big mt-4">
            A recruiter measured on placements should not grade the engineer. Testing is separated
            from sourcing so the score has independent meaning.
          </p>
          <p className="mkt-big mt-4">
            Testers are qualified in the specific discipline they assess — a Snowflake engineer is
            tested by someone who has built on Snowflake, an ABAP consultant by someone who has
            shipped ABAP.
          </p>
          <div className="mkt-fact mt-5">
            [FACT: tester sourcing model, qualification criteria, testing provider, calibration
            process]
          </div>
        </MktWrap>
      </section>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>How to read the results</h2>
          <div className="mkt-fact mt-5">[FACT: score scale and weighting]</div>
          <p className="mkt-big mt-[18px]">
            An engineer is published only above{' '}
            <span className="text-sm font-medium text-[var(--mkt-amber-d)]">[FACT: publish threshold]</span>
            . Below it, they don&apos;t appear.
          </p>
          <p className="mkt-big mt-4">
            The results show the tester, the date, which skills were tested, each area score, and
            the tester&apos;s written summary — including reservations.
          </p>
          <p className="mkt-pull mt-8">
            We publish the reservations too. Results with no critical observation aren&apos;t
            results; they&apos;re a testimonial.
          </p>
          <h3 className="mt-10">What we don&apos;t publish</h3>
          <p className="mkt-big mt-3">
            The raw recording or the specific problems used. Reusing a test that has leaked makes
            every future score meaningless.
          </p>
          <h3 className="mt-9">Re-testing</h3>
          <p className="mkt-big mt-3">
            Skills move. Results carry a date and are refreshed{' '}
            <span className="text-sm font-medium text-[var(--mkt-amber-d)]">[FACT: re-test cadence]</span>
            . An engineer who changes primary stack is re-tested before appearing in that community.
          </p>
        </MktWrap>
      </section>

      <section className="mkt-dark-k mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What this does not tell you</h2>
          <p className="mt-[22px] text-lg">
            A test predicts capability. It does not predict fit with your codebase, your team or
            your standards. That&apos;s what the 20 hours are for.
          </p>
          <p className="mt-[18px] text-lg">
            We&apos;re deliberate about this boundary. A platform claiming its score removes all
            your risk is selling you something other than evidence.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-amber mkt-btn-lg">
              See real test results
            </Link>
            <Link to="/try-for-a-week" className="mkt-btn mkt-btn-white mkt-btn-lg">
              How the 20-hour trial works
            </Link>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
