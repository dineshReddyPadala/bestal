import { PUBLIC_SKILL_COMMUNITIES } from '@bestal/shared-utils';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { DemoEngineerCard } from '../../components/marketing/DemoEngineerCard';
import { PageMeta } from '../../components/PageMeta';
import {
  BUYER_QUESTIONS,
  EVIDENCE_STRIP,
  HOME_STATS,
  HOME_STEPS,
  TIMEZONE_BLOCKS,
} from '../../lib/marketing-copy';
import { HERO_ENGINEER } from '../../lib/demo-engineers';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function HomePage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.home.title} description={PAGE_SEO.home.description} />

      {/* Hero */}
      <section className="mkt-hero">
        <MktWrap className="mkt-g2">
          <div>
            <h1>
              Proven Talent.
              <br />
              Ready to Perform.
            </h1>
            <p className="mkt-lead mt-[26px] max-w-[540px]">
              Pre-vetted engineers who work <em className="mkt-hl">your hours, not theirs</em>. See
              their test results, their rate and their start date up front — then try them{' '}
              <em className="mkt-hl">free for 20 hours</em> before you commit.
            </p>
            <div className="mkt-actions mt-9">
              <Link to="/sample-talent" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                Browse Engineers
              </Link>
              <Link to="/evaluation-standard" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
                See how we test
              </Link>
            </div>
            <p className="mkt-micro mt-5">
              No recruiter calls. No sourcing cycle. No commitment for the first 20 hours.
            </p>
          </div>
          <DemoEngineerCard engineer={HERO_ENGINEER} />
        </MktWrap>
      </section>

      {/* Stats band */}
      <div className="mkt-band mkt-section-tight">
        <MktWrap className="mkt-stats">
          {HOME_STATS.map((stat) => (
            <div key={stat.value}>
              <div className="mkt-stat-v">{stat.value}</div>
              <div className="mkt-stat-l whitespace-pre-line">{stat.label}</div>
            </div>
          ))}
        </MktWrap>
      </div>

      {/* Evidence */}
      <section className="mkt-section">
        <MktWrap>
          <div className="mb-14 max-w-[700px]">
            <div className="mkt-eyebrow">The evidence</div>
            <h2 className="mt-4">Six things you can check before you talk to anyone</h2>
          </div>
          <div className="mkt-g6">
            {EVIDENCE_STRIP.map((item) => (
              <div key={item.num} className="mkt-ev">
                <div className="mkt-ev-n">{item.num}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </MktWrap>
      </section>

      {/* Differentiation */}
      <section className="mkt-dark mkt-section">
        <MktWrap className="max-w-[840px]">
          <h2>
            Everyone claims the top 3%.
            <br />
            We show you the test.
          </h2>
          <p className="mt-6 text-lg">
            Most talent platforms ask you to trust a badge. A percentage, a promise, a curated
            shortlist — and no way to check any of it.
          </p>
          <p className="mt-[18px] text-lg">
            BesTal publishes the test instead. Every engineer&apos;s profile shows what was tested,
            how they scored on five separate areas, who tested them, and when — including the
            reservations.
          </p>
          <p className="mt-[18px] text-lg font-medium text-white">
            You don&apos;t have to believe our standard. You can read it.
          </p>
          <Link to="/evaluation-standard" className="mkt-btn mkt-btn-white mkt-btn-lg mt-8">
            See how we test →
          </Link>
        </MktWrap>
      </section>

      {/* Time zone */}
      <section className="mkt-band mkt-section">
        <MktWrap className="mkt-g2">
          <div>
            <div className="mkt-eyebrow">Time zone</div>
            <h2 className="mt-4">
              They work your hours.
              <br />
              Not &ldquo;some overlap.&rdquo;
            </h2>
            <p className="mkt-lead mt-[22px]">
              Every BesTal engineer is assigned to one US time zone and works a full business day in
              it — Eastern, Central, Mountain or Pacific.
            </p>
            <p className="mkt-big mt-[18px]">
              No 6am standups for them. No 9pm handoffs for you. No hunting for three usable hours
              in the middle of the day.
            </p>
            <Link to="/sample-talent" className="mkt-btn mkt-btn-secondary mt-[26px]">
              Browse by time zone
            </Link>
          </div>
          <div className="mkt-stack">
            {TIMEZONE_BLOCKS.map((block) => (
              <div key={block.title} className="mkt-card">
                <h4>{block.title}</h4>
                <p className="mt-[7px] text-[15px]">{block.body}</p>
              </div>
            ))}
          </div>
        </MktWrap>
      </section>

      {/* Steps */}
      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>Four steps. No sourcing cycle.</h2>
          <div className="mkt-steps mt-10">
            {HOME_STEPS.map((item) => (
              <div key={item.step} className="mkt-step">
                <div className="mkt-step-n">{item.step}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/how-it-works" className="mkt-btn mkt-btn-ghost mt-[26px] pl-0">
            How it works in detail →
          </Link>
        </MktWrap>
      </section>

      {/* Trial + Scale */}
      <section className="mkt-section-tight">
        <MktWrap className="mkt-g2t">
          <div className="mkt-card mkt-card-dark p-11">
            <h2>Don&apos;t hire from a résumé. See them perform.</h2>
            <p className="mt-5 text-[17px]">
              20 hours of real work with your team, free, before you commit to anything. You keep
              the work whatever you decide.
            </p>
            <Link to="/try-for-a-week" className="mkt-btn mkt-btn-amber mt-7">
              How the 20-hour trial works →
            </Link>
          </div>
          <div className="mkt-card mkt-card-amber p-11">
            <h2>Scale without carrying bench</h2>
            <p className="mt-5 text-[17px]">
              One engineer this week. Four more next month. A SAP team for two quarters, then
              nothing.
            </p>
            <p className="mt-4 text-[17px]">
              BesTal is asset-light by design — we don&apos;t hold a bench, so you&apos;re not paying
              for one.
            </p>
          </div>
        </MktWrap>
      </section>

      {/* Communities */}
      <section className="mkt-section">
        <MktWrap>
          <div className="mb-11 max-w-[700px]">
            <h2>Engineers, organised by discipline</h2>
            <p className="mkt-lead mt-[18px]">
              Not a general résumé database. Every engineer belongs to a specialist community with
              its own tests and its own outside testers.
            </p>
          </div>
          <div className="mkt-g3">
            {PUBLIC_SKILL_COMMUNITIES.slice(0, 6).map((c) => (
              <Link key={c.slug} to="/communities" className="mkt-comm">
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </Link>
            ))}
          </div>
          <Link to="/communities" className="mkt-comm mt-[22px] block">
            <h3>{PUBLIC_SKILL_COMMUNITIES[6]?.name}</h3>
            <p>{PUBLIC_SKILL_COMMUNITIES[6]?.description}</p>
          </Link>
        </MktWrap>
      </section>

      {/* Buyer questions */}
      <section className="mkt-band mkt-section">
        <MktWrap className="mkt-g2 items-start">
          <div>
            <h2>The questions we built this platform to answer</h2>
            <p className="mkt-big mt-[22px]">
              Every one of these is answerable on a profile, without a call.
            </p>
          </div>
          <ul className="mkt-tk">
            {BUYER_QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </MktWrap>
      </section>

      {/* Final CTA */}
      <section className="mkt-section">
        <MktWrap className="max-w-[660px] text-center">
          <h2>Start with the evidence.</h2>
          <p className="mkt-lead mt-5">
            Browse engineers by discipline and time zone, or tell us what you need and we&apos;ll
            match against it.
          </p>
          <div className="mkt-actions mkt-actions-center mt-[34px]">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Browse Engineers
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
