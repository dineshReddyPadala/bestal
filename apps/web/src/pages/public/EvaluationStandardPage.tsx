import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { PAGE_SEO } from '../../lib/marketing-seo';

const SCORE_LABELS = [
  { num: '01', title: 'Technical depth' },
  { num: '02', title: 'Problem solving' },
  { num: '03', title: 'Architecture' },
  { num: '04', title: 'Code quality' },
  { num: '05', title: 'Communication' },
] as const;

export function EvaluationStandardPage() {
  return (
    <div className="mkt-test-page">
      <PageMeta
        title={PAGE_SEO.evaluationStandard.title}
        description={PAGE_SEO.evaluationStandard.description}
      />

      <MktShell className="mkt-test-hero">
        <div className="mkt-test-label">Testing</div>
        <h1>
          A résumé is a claim.
          <br />
          A test is evidence.
        </h1>
        <p className="mkt-lead">
          A qualified specialist — not a BesTal recruiter — tests the engineer against role-specific
          criteria and scores technical depth, problem solving, architecture, code quality and
          communication separately.
        </p>
      </MktShell>

      <section className="mkt-section mkt-test-scoring">
        <MktShell>
          <div className="mkt-test-label">Scoring</div>
          <h2 className="mt-3">What gets scored</h2>
          <div className="mkt-score-cards">
            {SCORE_LABELS.map((item) => (
              <div key={item.num} className="mkt-score-card">
                <div className="mkt-score-card-n">{item.num}</div>
                <h3>{item.title}</h3>
              </div>
            ))}
          </div>
          <div className="mkt-fact mt-8">[FACT: tester sourcing and qualification criteria]</div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-test-read">
        <MktShell>
          <h2>How to read the results</h2>
          <div className="mkt-fact mt-6">[FACT: score scale and weighting]</div>
          <p className="mkt-test-body">
            An engineer is published only above{' '}
            <span className="mkt-test-fact">[FACT: publish threshold]</span>. Below it, they don&apos;t
            appear.
          </p>
          <p className="mkt-test-body">
            The results show the tester, the date, which skills were tested, each area score, and the
            tester&apos;s written summary — including reservations.
          </p>
          <p className="mkt-test-pull">
            We publish the reservations too. Results with no critical observation aren&apos;t results;
            they&apos;re a testimonial.
          </p>
          <h3>What we don&apos;t publish</h3>
          <p className="mkt-test-body">
            The raw recording or the specific problems used. Reusing a test that has leaked makes
            every future score meaningless.
          </p>
          <h3>Re-testing</h3>
          <p className="mkt-test-body">
            Skills move. Results carry a date and are refreshed{' '}
            <span className="mkt-test-fact">[FACT: re-test cadence]</span>. An engineer who changes
            primary stack is re-tested before appearing in that community.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-test-dark">
        <MktShell>
          <h2>What this does not tell you</h2>
          <p>
            A test predicts capability. It does not predict fit with your codebase, your team or your
            standards. That&apos;s what the 20 hours are for.
          </p>
          <p>
            We&apos;re deliberate about this boundary. A platform claiming its score removes all your
            risk is selling you something other than evidence.
          </p>
          <div className="mkt-actions">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-amber">
              See real test results
            </Link>
            <Link to="/try-for-a-week" className="mkt-btn mkt-btn-white">
              How the 20-hour trial works
            </Link>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
