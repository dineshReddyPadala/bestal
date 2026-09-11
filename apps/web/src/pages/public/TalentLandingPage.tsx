import { cn } from '@bestal/shared-utils';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Layers,
  Minus,
  Plus,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { useCarouselVisibleCount } from '../../hooks/useCarouselVisibleCount';
import { TALENT_LANDING_PAGE } from '../../lib/marketing-copy';
import { CLIENT_LOGIN_PATH } from '../../lib/login-portals';
import { PAGE_SEO } from '../../lib/marketing-seo';

const FEATURE_ICONS = [Globe2, Target, Users, Award, CalendarCheck, Layers] as const;
const WHY_JOIN_INTERVAL_MS = 4500;
const HOW_IT_WORKS_INTERVAL_MS = 4500;
const COMMUNITY_CAROUSEL_INTERVAL_MS = 4500;

function VerifyBadge() {
  return (
    <span className="mkt-talent-v2-verify" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="currentColor" />
        <path
          d="M4.75 8.25 6.8 10.3 11.35 5.75"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ApproachNoteCheck() {
  return (
    <span className="mkt-talent-v2-approach-note-icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path
          d="M4.75 8.25 6.8 10.3 11.35 5.75"
          stroke="#0b0e11"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function TalentLandingPage() {
  const copy = TALENT_LANDING_PAGE;
  const [activeWhy, setActiveWhy] = useState(0);
  const [hoveredWhy, setHoveredWhy] = useState<number | null>(null);
  const [isWhyPaused, setIsWhyPaused] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState(0);
  const [openAdvantage, setOpenAdvantage] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isHiwPaused, setIsHiwPaused] = useState(false);
  const [communityIndex, setCommunityIndex] = useState(0);
  const [isCommunityPaused, setIsCommunityPaused] = useState(false);

  const whyReasonCount = copy.whyJoin.reasons.length;
  const hiwStepCount = copy.howItWorks.steps.length;

  useEffect(() => {
    if (isWhyPaused || whyReasonCount <= 1) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setActiveWhy((current) => (current + 1) % whyReasonCount);
    }, WHY_JOIN_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isWhyPaused, whyReasonCount]);

  useEffect(() => {
    if (isHiwPaused || hiwStepCount <= 1) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % hiwStepCount);
    }, HOW_IT_WORKS_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isHiwPaused, hiwStepCount]);

  const whyIndex = hoveredWhy ?? activeWhy;
  const activeWhyContent = copy.whyJoin.reasons[whyIndex] ?? copy.whyJoin.reasons[0];
  const activeStepContent = copy.howItWorks.steps[activeStep] ?? copy.howItWorks.steps[0];
  const communityVisible = useCarouselVisibleCount({ desktop: 4, tablet: 2, mobile: 1 });
  const maxCommunityIndex = Math.max(0, copy.communities.cards.length - communityVisible);

  useEffect(() => {
    setCommunityIndex((current) => Math.min(current, maxCommunityIndex));
  }, [maxCommunityIndex]);

  useEffect(() => {
    if (isCommunityPaused || maxCommunityIndex <= 0) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setCommunityIndex((current) => (current >= maxCommunityIndex ? 0 : current + 1));
    }, COMMUNITY_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isCommunityPaused, maxCommunityIndex]);

  return (
    <div id="top" className="mkt-talent-v2-page">
      <PageMeta title={PAGE_SEO.talent.title} description={PAGE_SEO.talent.description} />

      <section className="mkt-talent-v2-hero">
        <MktShell>
          <div className="mkt-talent-v2-hero-grid">
            <div className="mkt-talent-v2-hero-copy">
              {/* <span className="mkt-talent-v2-hero-label">{copy.hero.label}</span> */}
              <h1>{copy.hero.title}</h1>
              <p className="mkt-talent-v2-hero-sub">{copy.hero.subheading}</p>
              {copy.hero.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mkt-talent-v2-hero-body">
                  {paragraph}
                </p>
              ))}
              <p className="mkt-talent-v2-hero-hook">{copy.hero.hook}</p>
              <Link to={copy.hero.primaryCtaHref} className="mkt-talent-v2-btn mkt-talent-v2-btn-primary">
                {copy.hero.primaryCta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <article className="mkt-talent-v2-hero-card">
              <div className="mkt-talent-v2-hero-card-photo">
                <img src={copy.hero.profile.image} alt="" loading="lazy" />
                <div className="mkt-talent-v2-hero-card-badges">
                  <span className="mkt-talent-v2-badge mkt-talent-v2-badge--verify">
                    <VerifyBadge />
                    Verified
                  </span>
                  <span className="mkt-talent-v2-badge mkt-talent-v2-badge--avail">
                    <span className="mkt-talent-v2-dot" aria-hidden="true" />
                    {copy.hero.profile.availability}
                  </span>
                </div>
              </div>
              <div className="mkt-talent-v2-hero-card-body">
                <div className="mkt-talent-v2-hero-card-hd">
                  <div>
                    <div className="mkt-talent-v2-hero-card-name">
                      <h2>{copy.hero.profile.name}</h2>
                      <VerifyBadge />
                    </div>
                    <p className="mkt-talent-v2-hero-card-role">{copy.hero.profile.role}</p>
                  </div>
                </div>
                <div className="mkt-talent-v2-hero-card-tags">
                  {copy.hero.profile.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="mkt-talent-v2-hero-card-meta">
                  <span>{copy.hero.profile.experience}</span>
                  <span className="mkt-talent-v2-hero-card-score">
                    <strong>{copy.hero.profile.score}</strong> {copy.hero.profile.scoreLabel}
                  </span>
                </div>
                <div className="mkt-talent-v2-hero-card-tabs" role="tablist" aria-label="Profile sections">
                  {copy.hero.profile.tabs.map((tab, index) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeProfileTab === index}
                      className={cn('mkt-talent-v2-hero-card-tab', activeProfileTab === index && 'is-active')}
                      onClick={() => setActiveProfileTab(index)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <dl className="mkt-talent-v2-hero-card-rows">
                  {copy.hero.profile.tabRows.map((row) => (
                    <div key={row.label} className="mkt-talent-v2-hero-card-row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-why">
        <MktShell>
          <div className="mkt-talent-v2-why-hd">
            <h2>{copy.whyJoin.title}</h2>
            <p className="mkt-talent-v2-why-sub">{copy.whyJoin.subtitle}</p>
            <p className="mkt-talent-v2-why-intro">{copy.whyJoin.intro}</p>
          </div>

          <div
            className="mkt-talent-v2-why-layout"
            onMouseEnter={() => setIsWhyPaused(true)}
            onMouseLeave={() => {
              setIsWhyPaused(false);
              setHoveredWhy(null);
            }}
            onFocusCapture={() => setIsWhyPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsWhyPaused(false);
              }
            }}
          >
            <ul className="mkt-talent-v2-why-nav">
              {copy.whyJoin.reasons.map((reason, index) => (
                <li key={reason.title}>
                  <button
                    type="button"
                    className={cn('mkt-talent-v2-why-btn', whyIndex === index && 'is-active')}
                    onClick={() => setActiveWhy(index)}
                    onMouseEnter={() => setHoveredWhy(index)}
                    aria-current={whyIndex === index ? 'true' : undefined}
                  >
                    <span className="mkt-talent-v2-why-btn-icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="currentColor" />
                        <path
                          d="M4.75 8.25 6.8 10.3 11.35 5.75"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="mkt-talent-v2-why-btn-label">{reason.title}</span>
                    <ArrowRight className="mkt-talent-v2-why-btn-arrow" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <article className="mkt-talent-v2-why-panel" key={whyIndex}>
              <span className="mkt-talent-v2-why-panel-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
                  <path
                    d="M7.5 12.25 10.25 15 16.75 8.5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3>{activeWhyContent.title}</h3>
              <p>{activeWhyContent.body}</p>
              <span className="mkt-talent-v2-why-panel-rule" aria-hidden="true" />
            </article>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-capabilities">
        <MktShell>
          <div className="mkt-talent-v2-cap-hd">
            <h2>{copy.capabilities.title}</h2>
            <p>{copy.capabilities.subtitle}</p>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-work-speak">
        <MktShell>
          <div className="mkt-talent-v2-work-hd">
            <h2>{copy.workSpeak.title}</h2>
            <p className="mkt-talent-v2-work-sub">{copy.workSpeak.subtitle}</p>
            <p className="mkt-talent-v2-work-intro">{copy.workSpeak.intro}</p>
            <div className="mkt-talent-v2-approach-note">
              <ApproachNoteCheck />
              <p>
                <span className="mkt-talent-v2-approach-note-label">{copy.workSpeak.approachNoteLabel}</span>{' '}
                {copy.workSpeak.approachNote}
              </p>
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-advantage">
        <MktShell>
          <div className="mkt-talent-v2-advantage-layout">
            <div className="mkt-talent-v2-advantage-hd">
              <h2>{copy.advantage.title}</h2>
              <p>{copy.advantage.subtitle}</p>
            </div>

            <div className="mkt-talent-v2-advantage-accordion">
              {copy.advantage.items.map((item, index) => {
                const isOpen = openAdvantage === index;
                return (
                  <div key={item.title} className={cn('mkt-talent-v2-advantage-item', isOpen && 'is-open')}>
                    <button
                      type="button"
                      className="mkt-talent-v2-advantage-trigger"
                      aria-expanded={isOpen}
                      onClick={() => setOpenAdvantage(isOpen ? -1 : index)}
                    >
                      <span className="mkt-talent-v2-advantage-trigger-mark" aria-hidden="true">
                        »
                      </span>
                      <span className="mkt-talent-v2-advantage-trigger-title">{item.title}</span>
                      <span className="mkt-talent-v2-advantage-toggle" aria-hidden="true">
                        {isOpen ? <Minus /> : <Plus />}
                      </span>
                    </button>
                    {isOpen ? <p>{item.body}</p> : null}
                  </div>
                );
              })}
            </div>

            <article className="mkt-talent-v2-showcase">
            <div className="mkt-talent-v2-showcase-photo">
              <img src={copy.profileShowcase.image} alt="" loading="lazy" />
              <span className="mkt-talent-v2-showcase-verify">
                <VerifyBadge />
                Verified
              </span>
            </div>
            <div className="mkt-talent-v2-showcase-body">
              <span className="mkt-talent-v2-showcase-label">{copy.profileShowcase.label}</span>
              <h3>{copy.profileShowcase.name}</h3>
              <p className="mkt-talent-v2-showcase-role">{copy.profileShowcase.role}</p>
              <p className="mkt-talent-v2-showcase-bio">{copy.profileShowcase.bio}</p>
              <div className="mkt-talent-v2-showcase-tags">
                {copy.profileShowcase.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <div className="mkt-talent-v2-showcase-grid">
                {/* <div className="mkt-talent-v2-showcase-bars">
                  {copy.profileShowcase.breakdown.map((row) => (
                    <div key={row.label} className="mkt-talent-v2-evidence-bar">
                      <div className="mkt-talent-v2-evidence-bar-hd">
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                      <div className="mkt-talent-v2-evidence-bar-track">
                        <span style={{ width: `${row.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div> */}
                <dl className="mkt-talent-v2-showcase-meta">
                  <div>
                    <dt>Experience</dt>
                    <dd>{copy.profileShowcase.experience}</dd>
                  </div>
                  <div>
                    <dt>Time Zone</dt>
                    <dd>{copy.profileShowcase.timezone}</dd>
                  </div>
                  <div>
                    <dt>Availability</dt>
                    <dd>{copy.profileShowcase.availability}</dd>
                  </div>
                  <div>
                    <dt>Hourly Rate</dt>
                    <dd>{copy.profileShowcase.rate}</dd>
                  </div>
                </dl>
              </div>
              <p className="mkt-talent-v2-showcase-badge">
                <Star aria-hidden="true" />
                {copy.profileShowcase.badge}
              </p>
            </div>
            </article>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-communities">
        <MktShell>
          <div
            className="mkt-talent-v2-communities-layout"
            onMouseEnter={() => setIsCommunityPaused(true)}
            onMouseLeave={() => setIsCommunityPaused(false)}
            onFocusCapture={() => setIsCommunityPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsCommunityPaused(false);
              }
            }}
          >
            <div className="mkt-talent-v2-communities-hd">
              <h2>{copy.communities.title}</h2>
              <p className="mkt-talent-v2-communities-sub">{copy.communities.subtitleLeft}</p>
              <div className="mkt-talent-v2-communities-right">
                <p className="mkt-talent-v2-communities-intro">{copy.communities.subtitleRight}</p>
                <div className="mkt-talent-v2-communities-controls">
                  <Link
                    to={copy.communities.ctaHref}
                    className="mkt-talent-v2-btn mkt-talent-v2-btn-primary mkt-talent-v2-communities-cta"
                  >
                    {copy.communities.cta}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <div className="mkt-talent-v2-communities-arrows">
                    <button
                      type="button"
                      className="mkt-talent-v2-arrow"
                      aria-label="Previous communities"
                      disabled={communityIndex === 0}
                      onClick={() => setCommunityIndex((current) => Math.max(0, current - 1))}
                    >
                      <ChevronLeft aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="mkt-talent-v2-arrow"
                      aria-label="Next communities"
                      disabled={communityIndex >= maxCommunityIndex}
                      onClick={() => setCommunityIndex((current) => Math.min(maxCommunityIndex, current + 1))}
                    >
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="mkt-talent-v2-communities-track-wrap"
              style={
                {
                  '--community-visible': communityVisible,
                  '--community-index': communityIndex,
                } as CSSProperties
              }
            >
              <div className="mkt-talent-v2-communities-track">
                {copy.communities.cards.map((card) => (
                  <Link
                    key={card.title}
                    to={copy.communities.ctaHref}
                    className="mkt-talent-v2-community-card"
                  >
                    <img src={card.image} alt="" loading="lazy" />
                    <div className="mkt-talent-v2-community-card-body">
                      <div className="mkt-talent-v2-community-card-hd">
                        <h3>{card.title}</h3>
                        <ArrowUpRight aria-hidden="true" />
                      </div>
                      <p>{card.body}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-hiw">
        <MktShell>
          <div className="mkt-talent-v2-hiw-hd">
            <h2>{copy.howItWorks.title}</h2>
            <p>{copy.howItWorks.subtitle}</p>
          </div>

          <div
            className="mkt-talent-v2-hiw-layout"
            onMouseEnter={() => setIsHiwPaused(true)}
            onMouseLeave={() => setIsHiwPaused(false)}
            onFocusCapture={() => setIsHiwPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsHiwPaused(false);
              }
            }}
          >
            <div className="mkt-talent-v2-hiw-stepper" role="tablist" aria-label="How BesTal works">
              {copy.howItWorks.steps.map((step, index) => {
                const isActive = activeStep === index;

                return (
                  <div
                    key={step.title}
                    className={cn('mkt-talent-v2-hiw-step-wrap', isActive && 'is-active')}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`hiw-step-panel-${index}`}
                      id={`hiw-step-tab-${index}`}
                      className={cn('mkt-talent-v2-hiw-step', isActive && 'is-active')}
                      onClick={() => setActiveStep(index)}
                    >
                      <span className="mkt-talent-v2-hiw-step-num">{String(index + 1).padStart(2, '0')}</span>
                      <span className="mkt-talent-v2-hiw-step-label">{step.title}</span>
                    </button>
                    <div
                      id={`hiw-step-panel-${index}`}
                      role="tabpanel"
                      aria-labelledby={`hiw-step-tab-${index}`}
                      className="mkt-talent-v2-hiw-step-detail"
                      hidden={!isActive}
                    >
                      <p>{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <article className="mkt-talent-v2-hiw-panel mkt-talent-v2-hiw-panel--desktop" key={activeStep}>
              <div className="mkt-talent-v2-hiw-panel-left">
                <span className="mkt-talent-v2-hiw-panel-kicker">STEP</span>
                <span className="mkt-talent-v2-hiw-panel-num">{activeStep + 1}</span>
                <span className="mkt-talent-v2-hiw-panel-of">of {copy.howItWorks.steps.length}</span>
                <div className="mkt-talent-v2-hiw-panel-nav">
                  <button
                    type="button"
                    className="mkt-talent-v2-hiw-nav-btn"
                    aria-label="Previous step"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="mkt-talent-v2-hiw-nav-btn"
                    aria-label="Next step"
                    disabled={activeStep >= copy.howItWorks.steps.length - 1}
                    onClick={() =>
                      setActiveStep((current) => Math.min(copy.howItWorks.steps.length - 1, current + 1))
                    }
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="mkt-talent-v2-hiw-panel-right">
                <h3>{activeStepContent.title}</h3>
                <p>{activeStepContent.body}</p>
              </div>
            </article>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-features">
        <MktShell>
          <div className="mkt-talent-v2-features-top">
            <div className="mkt-talent-v2-features-copy">
              <h2>{copy.features.title}</h2>
              <p>{copy.features.body}</p>
            </div>
            <div className="mkt-talent-v2-features-photo">
              <img src={copy.features.image} alt="" loading="lazy" />
            </div>
          </div>

          <div className="mkt-talent-v2-features-panel">
            {copy.features.items.map((item, index) => {
              const Icon = FEATURE_ICONS[index] ?? Globe2;
              return (
                <div
                  key={item}
                  className={cn(
                    'mkt-talent-v2-features-item',
                    index === 5 && 'is-full',
                  )}
                >
                  <span className="mkt-talent-v2-features-icon" aria-hidden="true">
                    <Icon strokeWidth={1.85} />
                  </span>
                  <span className="mkt-talent-v2-features-label">{item}</span>
                </div>
              );
            })}
          </div>

          <blockquote className="mkt-talent-v2-features-quote">{copy.features.quote}</blockquote>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-section mkt-talent-v2-transparency">
        <MktShell>
          <div className="mkt-talent-v2-transparency-layout">
            <div>
              <h2>{copy.transparency.title}</h2>
            </div>
            <div>
              {copy.transparency.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-talent-v2-cta">
        <div className="mkt-talent-v2-cta-bg" aria-hidden="true">
          <img src={copy.cta.backgroundImage} alt="" loading="lazy" />
          <span className="mkt-talent-v2-cta-overlay" />
        </div>
        <MktShell>
          <div className="mkt-talent-v2-cta-layout">
            <div className="mkt-talent-v2-cta-copy">
              <h2>{copy.cta.title}</h2>
              <p>{copy.cta.body}</p>
              <p className="mkt-talent-v2-cta-tagline">{copy.cta.tagline}</p>
              <p className="mkt-talent-v2-cta-headline">{copy.cta.headline}</p>
              <div className="mkt-talent-v2-cta-actions">
                <Link to={copy.cta.primaryCtaHref} className="mkt-talent-v2-btn mkt-talent-v2-btn-primary">
                  {copy.cta.primaryCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className="mkt-talent-v2-cta-footer-links">
                <Link to={CLIENT_LOGIN_PATH}>{copy.cta.signInLabel}</Link>
                <span aria-hidden="true">|</span>
                <Link to={copy.cta.assessmentHref}>{copy.cta.assessmentLabel}</Link>
              </div>
            </div>

            <aside className="mkt-talent-v2-cta-checklist-card">
              <h3>{copy.cta.quickStepTitle}</h3>
              <p>{copy.cta.quickStepBody}</p>
              <ul className="mkt-talent-v2-cta-checklist">
                {copy.cta.checklist.map((item) => (
                  <li key={item}>
                    <span className="mkt-talent-v2-cta-check" aria-hidden="true">
                      <svg viewBox="0 0 12 12" fill="none">
                        <rect width="12" height="12" rx="2" fill="currentColor" />
                        <path
                          d="M2.5 6.25 4.75 8.5 9.5 3.75"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
