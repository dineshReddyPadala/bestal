import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommunityProfileSlider } from '../../components/marketing/CommunityProfileSlider';
import { ProfileTabs } from '../../components/marketing/ProfileTabs';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import {
  EVIDENCE_STRIP,
  HOME_BUYER_FAQ,
  HOME_COMMUNITIES,
  HOME_STATS,
  HOME_STEPS,
  TIMEZONE_BLOCKS,
} from '../../lib/marketing-copy';
import { COMMUNITY_PROFILE_SLIDES, type CommunityProfileSlide } from '../../lib/demo-engineers';
import { mapFeaturedCandidateToProfileSlide } from '../../lib/landing-featured-candidates';
import { usePublicFeaturedCandidates } from '../../hooks/api/useCandidates';
import { images } from '../../data/homeCopy';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { cn } from '@bestal/shared-utils';
import { formatDimensionScoreDisplay } from '../../lib/score-display';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { CookieBanner } from '../../components/marketing/CookieBanner';

const TIMEZONE_CHIPS = [
  { abbr: 'ET', name: 'Eastern' },
  { abbr: 'CT', name: 'Central' },
  { abbr: 'MT', name: 'Mountain' },
  { abbr: 'PT', name: 'Pacific' },
] as const;

export function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);
  const { data: featuredCandidates = [] } = usePublicFeaturedCandidates(5);

  const profileSlides = useMemo(() => {
    if (featuredCandidates.length === 0) return COMMUNITY_PROFILE_SLIDES;
    return featuredCandidates.map(mapFeaturedCandidateToProfileSlide);
  }, [featuredCandidates]);

  const [heroSlide, setHeroSlide] = useState<CommunityProfileSlide>(profileSlides[0]);

  useEffect(() => {
    setHeroSlide(profileSlides[0]);
  }, [profileSlides]);

  const handleHeroSlideChange = useCallback((slide: CommunityProfileSlide) => {
    setHeroSlide(slide);
  }, []);

  const heroEngineer = heroSlide.engineer;

  return (
    <div className="mkt-home">
      <PageMeta title={PAGE_SEO.home.title} description={PAGE_SEO.home.description} />

      <section className="mkt-hero">
        <MktShell className="mkt-g2">
          <div>
            <h1>
              Proven Talent.
              <br />
              Ready to Perform.
            </h1>
            <p className="mkt-lead mt-[26px] max-w-[540px]">
              Pre-vetted Talents who work your hours. See their test results, their rate and their start
              date up front — Try them free before commit.
            </p>
            <div className="mkt-actions mt-9">
              <Link to="/sample-talent" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Browse Pre-Vetted Talent
               <ForwardArrow />
              </Link>
              <Link to="/evaluation-standard" className="mkt-btn mkt-btn-white mkt-btn-lg">
                See how we test
              </Link>
            </div>
            <p className="mkt-micro mt-5">
              No recruiter calls. No sourcing cycle. No commitment for the free trial.
            </p>
          </div>
          <CommunityProfileSlider
            hideScorecard
            slides={profileSlides}
            onSlideChange={handleHeroSlideChange}
          />
        </MktShell>
      </section>

      <div className="mkt-band mkt-section-tight">
        <MktShell className="mkt-stats">
          {HOME_STATS.map((stat) => (
            <div key={stat.value}>
              <div className="mkt-stat-v">{stat.value}</div>
              <div className="mkt-stat-l whitespace-pre-line">{stat.label}</div>
            </div>
          ))}
        </MktShell>
      </div>

      <section className="mkt-cream mkt-section">
        <MktShell>
          <div className="mkt-ev-hd">
            <div className="max-w-[520px]">
              <div className="mkt-kicker">The evidence</div>
              <h2 className="mt-4 mb-6">Six things you can check before you talk to anyone</h2>
            </div>
          </div>
          <div className="mkt-g6">
            {EVIDENCE_STRIP.map((item) => (
              <div key={item.num} className="mkt-ev-col">
                <div className="mkt-ev-num">{item.num}</div>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-dark mkt-section">
        <MktShell className="mkt-g2 items-start">
          <div>
            <h2>
              Everyone claims the top 3%.
              <br />
              We show you the test.
            </h2>
            <p className="mkt-dark-p mt-6">
              Most talent platforms ask you to trust a badge. A percentage, a promise, a curated
              shortlist — and no way to check any of it.
            </p>
            <p className="mkt-dark-p mt-4">
              BesTal publishes the test instead. Every engineer&apos;s profile shows what was
              tested, how they scored on five separate areas, who tested them, and when — including
              the reservations.
            </p>
            <p className="mkt-dark-p mkt-dark-em mt-4">
              You don&apos;t have to believe our standard. You can read it.
            </p>
            <Link to="/evaluation-standard" className="mkt-btn mkt-btn-white mkt-btn-lg mt-8">
              See how we test
              <ForwardArrow />
            </Link>
          </div>
          <div className="mkt-score-dark">
            <div className="mkt-score-dark-hd">
              <span>Scorecard · {heroEngineer.role}</span>
              <strong>
                {heroEngineer.score}
                <span>/100</span>
              </strong>
            </div>
            {heroEngineer.dimensions.length > 0 ? (
              heroEngineer.dimensions.map((dim) => (
                <div key={dim.label} className="mkt-scr">
                  <span className="mkt-scr-n">{dim.label}</span>
                  <span className="mkt-tr">
                    <span
                      className={cn('mkt-fl', dim.tone === 'gold' && 'mkt-fl-amber')}
                      style={{ width: `${dim.value * 10}%` }}
                    />
                  </span>
                  <span className="mkt-scr-v">{formatDimensionScoreDisplay(dim.value)}</span>
                </div>
              ))
            ) : (
              <p className="mkt-dark-p mt-4">
                Full dimensional scorecard available on the candidate profile.
              </p>
            )}
            <p className="mkt-evl">
              {heroEngineer.quoteIsPlaceholder ? (
                <span className="italic">{heroEngineer.quote}</span>
              ) : (
                <>“{heroEngineer.quote}”</>
              )}
              <br />
              <span className="mkt-evl-meta">
                — External Specialist, tested {heroEngineer.testedOn}
              </span>
            </p>
          </div>
        </MktShell>
      </section>

      <section id="time-zone" className="mkt-cream mkt-section ">
        <MktShell className="mkt-g2">
          <div>
            <div className="mkt-kicker">Time zone</div>
            <h2 className="mt-4">
              They work your hours.
              <br />
              Not &ldquo;some overlap.&rdquo;
            </h2>
            <p className="mkt-lead mt-6">
              Every BesTal engineer is assigned to one US time zone and works a full business day in
              it — Eastern, Central, Mountain or Pacific.
            </p>
            <p className="mkt-big mt-4">
              No 6am standups for them. No 8pm handoffs for you. No hunting for three usable hours
              in the middle of the day.
            </p>
            <Link to="/how-it-works" className="mkt-btn mkt-btn-primary mt-7">
              See a sample scorecard
              <ForwardArrow />
            </Link>
            <div className="mkt-tz-chips">
              {TIMEZONE_CHIPS.map((z) => (
                <span key={z.abbr} className="mkt-tz-chip">
                  <strong>{z.abbr}</strong> {z.name}
                </span>
              ))}
            </div>
          </div>
          <div className="mkt-stack">
            {TIMEZONE_BLOCKS.map((block) => (
              <div key={block.title} className="border-b-2 border-b-[#EDEDED] pb-8 last:border-b-0">
                <h4>{block.title}</h4>
                <p className="mt-2">{block.body}</p>
              </div>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section markeingsectionplayout">
        <MktShell className="mkt-profile">
          <div>
            <div className="mkt-kicker">The profile</div>
            <h2 className="mt-4">This is what a profile looks like</h2>
            <h3 className="mkt-lead mt-3 max-w-[380px] text-lg">
              Score, rate, availability <br/> and overlap — decided before <br/> you send a message.
            </h3>
          </div>
          <div className="mkt-profile-panel">
            <ProfileTabs />
          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section" style={{ paddingTop: 0 }}>
        <MktShell>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 mkt-step-hd">
            <h2>Four steps. No sourcing cycle.</h2>
            {/* <Link to="/how-it-works" className="mkt-btn mkt-btn-secondary">
              How it works in detail →
            </Link> */}
          </div>
          <div className="mkt-step4">
            {HOME_STEPS.map((item) => (
              <div key={item.step} className="mkt-step4-item">
                <div className="mkt-step4-l">Step {item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section-tight">
        <MktShell className="mkt-g2t mkt-equal-cards">
          <div className="mkt-card mkt-card-dark mkt-card-fill p-8 bgcolordrakgreen">
            <h2>Don&apos;t hire from a resume. <br /> See them perform.</h2>
            <p className="mt-4">
              One cold email or scoped work brief is your trial, and your process, agreed in
              advance.
            </p>
            <Link to="/try-for-a-week" className="mkt-btn mkt-btn-white mt-7">
              How the free Trial works
              <ForwardArrow />
            </Link>
          </div>
          <div className="mkt-card mkt-card-amber mkt-card-fill p-8">
            <h2>Scale without carrying bench</h2>
            <p className="mt-4">
              One engineer this week. Four more next month. A SAP team for two quarters, then
              nothing.
            </p>
            
<p className="mt-4">Scale your technology workforce up or down as business demand changes—without the cost and complexity of maintaining a large bench.
  </p>          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section">
        <MktShell>
          <div className="mb-11">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="mb-0">Engineers, organised by discipline</h2>
              <Link to="/sample-talent" className="mkt-btn mkt-btn-primary mkt-btn-lg shrink-0">
                Browse Pre-Vetted Talent
                <ForwardArrow />
              </Link>
            </div>
            <p className="mkt-big mt-3 max-w-[620px]">
              Not a general resume database. Every engineer belongs to a specialist community with
              its own tests and its own outside testers.
            </p>
          </div>
          <div className="mkt-g3">
            {HOME_COMMUNITIES.map((c) => (
              <div key={c.name} className="mkt-comm mkt-comm--static">
                <h3>{c.name}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section">
        <MktShell className="mkt-g2 mkt-faq-split">
          <div>
            <h2>The questions we built this platform to answer</h2>
            <p className="mkt-big mt-4">
              Every one of these is answerable on a profile, without a call.
            </p>
          </div>
          <div className="mkt-faq mkt-faq-list">
            {HOME_BUYER_FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.question} className={cn('mkt-faq-item', isOpen && 'is-open')}>
                  <button
                    type="button"
                    className="mkt-faq-btn"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  >
                    <span className="mkt-faq-check" aria-hidden>
                      ✓
                    </span>
                    <span className="mkt-faq-q">{item.question}</span>
                    <span className="mkt-faq-chev" aria-hidden>
                      {isOpen ? '⌃' : '⌄'}
                    </span>
                  </button>
                  {isOpen && <p className="mkt-faq-a">{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section-tight">
        <MktShell>
          <div className="mkt-cta-banner">
            <div className="mkt-cta-copy">
              <h2>Start with the evidence.</h2>
              <p>
                Browse the 7 Skill Communities, or tell us what you need and we&apos;ll match against
                it.
              </p>
              <div className="mkt-actions">
                <Link to="/sample-talent" className="mkt-btn mkt-btn-dark mkt-btn-lg">
                  Browse Pre-Vetted Talent
                  <ForwardArrow />
                </Link>
                <Link to="/contact" className="mkt-btn mkt-btn-outline mkt-btn-lg">
                  Tell us what you need
                </Link>
              </div>
            </div>
            <div className="mkt-cta-photo">
              <img
                src={images.cta}
                alt="A team reviewing engineer evidence together at a table"
              />
            </div>
          </div>
        </MktShell>
      </section>
      <CookieBanner />
    </div>
  );
}
