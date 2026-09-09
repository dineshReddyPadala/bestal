import { cn } from '@bestal/shared-utils';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { HomeAudienceToggle } from '../../components/marketing/HomeAudienceToggle';
import { PageMeta } from '../../components/PageMeta';
import { useCarouselVisibleCount } from '../../hooks/useCarouselVisibleCount';
import { CONSULTING_PAGE } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

type ConsultingProfile = (typeof CONSULTING_PAGE.hero.profiles)[number];

const HELP_SERVICE_INTERVAL_MS = 4500;
const TECH_CAROUSEL_INTERVAL_MS = 4500;
const ENGAGEMENT_CAROUSEL_INTERVAL_MS = 4500;
const PROFESSIONALS_INTERVAL_MS = 4500;

function ConsultingHeroProfileCard({
  profile,
  index,
  isHovered,
  onHover,
}: {
  profile: ConsultingProfile;
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
}) {
  return (
    <article
      className={cn(
        'mkt-consult-v2-profile-card',
        index % 2 === 0 ? 'is-zigzag-left' : 'is-zigzag-right',
        isHovered && 'is-hovered',
      )}
      style={{ zIndex: isHovered ? 10 : index + 1 }}
      onMouseEnter={() => onHover(index)}
      onFocus={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onBlur={() => onHover(null)}
      tabIndex={0}
    >
      <img src={profile.image} alt="" className="mkt-consult-v2-profile-photo" loading="lazy" />
      <div className="mkt-consult-v2-profile-body">
        <div className="mkt-consult-v2-profile-name-row">
          <h3>{profile.name}</h3>
          <span className="mkt-consult-v2-profile-check" aria-hidden="true">
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
        </div>
        <p className="mkt-consult-v2-profile-role">{profile.role}</p>
        <div className="mkt-consult-v2-profile-meta-row">
          <div className="mkt-consult-v2-profile-tag-group">
            {profile.skills.map((skill) => (
              <span key={skill} className="mkt-consult-v2-profile-tag">
                {skill}
              </span>
            ))}
          </div>
          <p className="mkt-consult-v2-profile-exp">{profile.experience}</p>
        </div>
        <div className="mkt-consult-v2-profile-foot">
          <span className="mkt-consult-v2-profile-avail">
            <span
              className={cn(
                'mkt-consult-v2-profile-dot',
                profile.availabilityTone === 'soon' && 'is-soon',
              )}
              aria-hidden="true"
            />
            {profile.availability}
          </span>
          <span className="mkt-consult-v2-profile-score">
            <Star aria-hidden="true" />
            {profile.score}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ConsultingPage() {
  const copy = CONSULTING_PAGE;
  const [activeService, setActiveService] = useState(0);
  const [openWhy, setOpenWhy] = useState(6);
  const [techIndex, setTechIndex] = useState(0);
  const [activeLeader, setActiveLeader] = useState(0);
  const [hoveredProfile, setHoveredProfile] = useState<number | null>(null);
  const [isHelpPaused, setIsHelpPaused] = useState(false);
  const [isTechPaused, setIsTechPaused] = useState(false);
  const [engagementIndex, setEngagementIndex] = useState(0);
  const [isEngagementPaused, setIsEngagementPaused] = useState(false);
  const [activeProfessional, setActiveProfessional] = useState(0);
  const [isProfessionalsPaused, setIsProfessionalsPaused] = useState(false);

  const helpServices = copy.howWeHelp.services;
  const serviceCount = helpServices.length;
  const professionalItems = copy.professionals.items;
  const professionalCount = professionalItems.length;

  useEffect(() => {
    if (isHelpPaused || serviceCount <= 1) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setActiveService((current) => (current + 1) % serviceCount);
    }, HELP_SERVICE_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isHelpPaused, serviceCount]);

  const techCards = copy.technology.cards;
  const techVisibleCount = useCarouselVisibleCount({ desktop: 4, tablet: 2, mobile: 1 });
  const maxTechIndex = Math.max(0, techCards.length - techVisibleCount);

  useEffect(() => {
    setTechIndex((current) => Math.min(current, maxTechIndex));
  }, [maxTechIndex]);

  useEffect(() => {
    if (isTechPaused || maxTechIndex <= 0) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setTechIndex((current) => (current >= maxTechIndex ? 0 : current + 1));
    }, TECH_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isTechPaused, maxTechIndex]);

  const engagementModels = copy.engagement.models;
  const engagementVisibleCount = useCarouselVisibleCount({ desktop: 4, tablet: 2, mobile: 1 });
  const maxEngagementIndex = Math.max(0, engagementModels.length - engagementVisibleCount);

  useEffect(() => {
    setEngagementIndex((current) => Math.min(current, maxEngagementIndex));
  }, [maxEngagementIndex]);

  useEffect(() => {
    if (isEngagementPaused || maxEngagementIndex <= 0) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setEngagementIndex((current) => (current >= maxEngagementIndex ? 0 : current + 1));
    }, ENGAGEMENT_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isEngagementPaused, maxEngagementIndex]);

  useEffect(() => {
    if (isProfessionalsPaused || professionalCount <= 1) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setActiveProfessional((current) => (current + 1) % professionalCount);
    }, PROFESSIONALS_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isProfessionalsPaused, professionalCount]);

  const activeServiceContent = helpServices[activeService] ?? helpServices[0];
  const activeLeaderContent = copy.leaders.roles[activeLeader] ?? copy.leaders.roles[0];

  return (
    <div className="mkt-consult-v2-page">
      <PageMeta title={PAGE_SEO.consulting.title} description={PAGE_SEO.consulting.description} />

      <section className="mkt-consult-v2-hero">
        <div className="mkt-hero-audience-bar">
          <HomeAudienceToggle />
        </div>
        <MktShell>
          <div className="mkt-consult-v2-hero-grid">
            <div className="mkt-consult-v2-hero-copy">
              <h1>
                <span className="mkt-consult-v2-hero-title-line">{copy.hero.titleLine1}</span>
                <br />
                {copy.hero.titleLine2}
              </h1>
              {copy.hero.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="mkt-consult-v2-hero-actions">
                <Link to="/contact" className="mkt-consult-v2-btn mkt-consult-v2-btn-primary">
                  {copy.hero.primaryCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
                {/* <Link to="#how-we-help" className="mkt-consult-v2-btn mkt-consult-v2-btn-outline">
                  {copy.hero.secondaryCta}
                </Link> */}
              </div>
            </div>
            <div className="mkt-consult-v2-hero-cards-wrap">
              <div className="mkt-consult-v2-hero-cards-panel" aria-hidden="true" />
              <div
                className={cn(
                  'mkt-consult-v2-hero-cards',
                  hoveredProfile !== null && 'has-hovered-card',
                )}
                onMouseLeave={() => setHoveredProfile(null)}
              >
                {copy.hero.profiles.map((profile, index) => (
                  <ConsultingHeroProfileCard
                    key={profile.name}
                    profile={profile}
                    index={index}
                    isHovered={hoveredProfile === index}
                    onHover={setHoveredProfile}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mkt-consult-v2-hero-foot">
            {copy.hero.pillars.map((pillar, index) => (
              <article key={pillar.title} className="mkt-consult-v2-hero-pillar">
                {index > 0 ? <span className="mkt-consult-v2-hero-pillar-rule" aria-hidden="true" /> : null}
                <h2>{pillar.title}</h2>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-intro">
        <MktShell>
          <div className="mkt-consult-v2-intro-grid">
            {copy.intro.columns.map((column, index) => (
              <article key={column.title} className="mkt-consult-v2-intro-col">
                {index > 0 ? <span className="mkt-consult-v2-intro-rule" aria-hidden="true" /> : null}
                <h2>{column.title}</h2>
                <p>{column.sub}</p>
              </article>
            ))}
          </div>
          <p className="mkt-consult-v2-intro-body">{copy.intro.body}</p>
        </MktShell>
      </section>

      <section id="how-we-help" className="mkt-consult-v2-section mkt-consult-v2-help">
        <MktShell>
          <div
            className="mkt-consult-v2-help-layout"
            onMouseEnter={() => setIsHelpPaused(true)}
            onMouseLeave={() => setIsHelpPaused(false)}
            onFocusCapture={() => setIsHelpPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsHelpPaused(false);
              }
            }}
          >
            <div className="mkt-consult-v2-help-left">
              <div className="mkt-consult-v2-help-copy">
                <h2>{copy.howWeHelp.title}</h2>
                <p>{copy.howWeHelp.intro}</p>
              </div>
              <nav className="mkt-consult-v2-help-nav" aria-label="How we help">
                <ul>
                  {copy.howWeHelp.services.map((service, index) => (
                    <li key={service.title}>
                      <button
                        type="button"
                        className={cn('mkt-consult-v2-help-btn', activeService === index && 'is-active')}
                        onClick={() => setActiveService(index)}
                        aria-current={activeService === index ? 'true' : undefined}
                      >
                        <span>{service.title}</span>
                        {activeService === index ? <ArrowRight aria-hidden="true" /> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <article className="mkt-consult-v2-help-card">
              <div key={activeService} className="mkt-consult-v2-help-card-inner">
                <span className="mkt-consult-v2-help-card-label">{copy.howWeHelp.cardLabel}</span>
                <h3>{activeServiceContent.title}</h3>
                <p>{activeServiceContent.body}</p>
              </div>
            </article>
          </div>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-section mkt-consult-v2-tech">
        <MktShell>
          <div
            className="mkt-consult-v2-tech-layout"
            onMouseEnter={() => setIsTechPaused(true)}
            onMouseLeave={() => setIsTechPaused(false)}
            onFocusCapture={() => setIsTechPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsTechPaused(false);
              }
            }}
          >
            <div className="mkt-consult-v2-tech-hd">
              <div>
                <h2>{copy.technology.title}</h2>
                <p>{copy.technology.intro}</p>
              </div>
              <div className="mkt-consult-v2-tech-controls">
                <button
                  type="button"
                  className="mkt-consult-v2-tech-arrow"
                  aria-label="Previous expertise cards"
                  disabled={techIndex === 0}
                  onClick={() => setTechIndex((current) => Math.max(0, current - 1))}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="mkt-consult-v2-tech-arrow"
                  aria-label="Next expertise cards"
                  disabled={techIndex >= maxTechIndex}
                  onClick={() => setTechIndex((current) => Math.min(maxTechIndex, current + 1))}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="mkt-consult-v2-tech-track-wrap">
              <div
                className="mkt-consult-v2-tech-track"
                style={{ transform: `translateX(calc(${-techIndex} * (100% / ${techVisibleCount} + 0.75rem)))` }}
              >
                {techCards.map((card) => (
                  <article key={card.title} className="mkt-consult-v2-tech-card">
                    <img src={card.image} alt="" loading="lazy" />
                    <Link to="/sample-talent" className="mkt-consult-v2-tech-card-body">
                      <ArrowUpRight className="mkt-consult-v2-tech-card-icon" aria-hidden="true"/>
                      <h3>{card.title}</h3>
                      <p>{card.body}</p>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-section mkt-consult-v2-professionals">
        <MktShell>
          <div className="mkt-consult-v2-professionals-layout">
            <div className="mkt-consult-v2-professionals-copy">
              <h2>{copy.professionals.title}</h2>
              <p>{copy.professionals.intro}</p>
              <blockquote className="mkt-consult-v2-professionals-quote">{copy.professionals.quote}</blockquote>
            </div>
            <ul
              className="mkt-consult-v2-professionals-list"
              onMouseEnter={() => setIsProfessionalsPaused(true)}
              onMouseLeave={() => setIsProfessionalsPaused(false)}
              onFocusCapture={() => setIsProfessionalsPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsProfessionalsPaused(false);
                }
              }}
            >
              {professionalItems.map((item, index) => (
                <li
                  key={item}
                  className={cn(activeProfessional === index && 'is-emphasis')}
                  onMouseEnter={() => setActiveProfessional(index)}
                  onFocus={() => setActiveProfessional(index)}
                  tabIndex={0}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-section mkt-consult-v2-why">
        <MktShell>
          <div className="mkt-consult-v2-why-layout">
            <div className="mkt-consult-v2-why-copy">
              {/* <span className="mkt-consult-v2-step-num">{copy.why.step}</span> */}
              <h2>{copy.why.title}</h2>
              <p>{copy.why.intro}</p>
            </div>
            <div className="mkt-consult-v2-why-accordion">
              {copy.why.items.map((item, index) => {
                const isOpen = openWhy === index;
                return (
                  <div key={item.title} className={cn('mkt-consult-v2-why-item', isOpen && 'is-open')}>
                    <button
                      type="button"
                      className="mkt-consult-v2-why-trigger"
                      aria-expanded={isOpen}
                      onClick={() => setOpenWhy(isOpen ? -1 : index)}
                    >
                      <span>{item.title}</span>
                      <span className="mkt-consult-v2-why-mark" aria-hidden="true">
                        {isOpen ? <Minus /> : <Plus />}
                      </span>
                    </button>
                    {isOpen ? <p>{item.body}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-section mkt-consult-v2-engagement">
        <MktShell>
          <div
            className="mkt-consult-v2-engagement-layout"
            onMouseEnter={() => setIsEngagementPaused(true)}
            onMouseLeave={() => setIsEngagementPaused(false)}
            onFocusCapture={() => setIsEngagementPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsEngagementPaused(false);
              }
            }}
          >
            <div className="mkt-consult-v2-engagement-hd">
              <div>
                <h2>{copy.engagement.title}</h2>
                <p>{copy.engagement.intro}</p>
              </div>
              <div className="mkt-consult-v2-engagement-controls">
                <button
                  type="button"
                  className="mkt-consult-v2-engagement-arrow"
                  aria-label="Previous engagement models"
                  disabled={engagementIndex === 0}
                  onClick={() => setEngagementIndex((current) => Math.max(0, current - 1))}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="mkt-consult-v2-engagement-arrow"
                  aria-label="Next engagement models"
                  disabled={engagementIndex >= maxEngagementIndex}
                  onClick={() =>
                    setEngagementIndex((current) => Math.min(maxEngagementIndex, current + 1))
                  }
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="mkt-consult-v2-engagement-track-wrap">
              <div
                className="mkt-consult-v2-engagement-track"
                style={{
                  transform: `translateX(calc(${-engagementIndex} * (100% / ${engagementVisibleCount})))`,
                }}
              >
                {engagementModels.map((model, index) => (
                  <article key={model.title} className="mkt-consult-v2-engagement-col">
                    {index > 0 ? <span className="mkt-consult-v2-engagement-rule" aria-hidden="true" /> : null}
                    <h3>{model.title}</h3>
                    <p>{model.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="mkt-consult-v2-engagement-highlight">
              <h3>{copy.engagement.highlight.title}</h3>
              <div className="mkt-consult-v2-engagement-highlight-copy">
                <p>{copy.engagement.highlight.body}</p>
                <Link to={copy.engagement.highlight.href} className="mkt-consult-v2-engagement-highlight-link">
                  {copy.engagement.highlight.cta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-section mkt-consult-v2-approach">
        <MktShell>
          <div className="mkt-consult-v2-approach-hd">
            {/* <span className="mkt-consult-v2-approach-index">{copy.approach.step}</span> */}
            <h2>{copy.approach.title}</h2>
            <p>{copy.approach.intro}</p>
          </div>
          <ol className="mkt-consult-v2-approach-list">
            {copy.approach.steps.map((step) => (
              <li key={step.title}>
                <div className="mkt-consult-v2-approach-stepper" aria-hidden="true">
                  <span className="mkt-consult-v2-approach-num">{step.num}</span>
                </div>
                <h3 className="mkt-consult-v2-approach-title">{step.title}</h3>
                <p className="mkt-consult-v2-approach-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-section mkt-consult-v2-leaders">
        <MktShell>
          <div className="mkt-consult-v2-section-hd mkt-consult-v2-section-hd--light">
            <h2>{copy.leaders.title}</h2>
            <p>{copy.leaders.intro}</p>
          </div>
          <div className="mkt-consult-v2-leaders-grid" role="tablist" aria-label="Technology leader roles">
            {copy.leaders.roles.map((role, index) => (
              <button
                key={role.title}
                type="button"
                role="tab"
                aria-selected={activeLeader === index}
                className={cn('mkt-consult-v2-leader-tile', activeLeader === index && 'is-active')}
                onClick={() => setActiveLeader(index)}
              >
                {/* <span className="mkt-consult-v2-leader-num">{role.num}</span> */}
                <span className="mkt-consult-v2-leader-title">{role.title}</span>
                <Plus className="mkt-consult-v2-leader-plus" aria-hidden="true" />
              </button>
            ))}
          </div>
          <article className="mkt-consult-v2-leader-panel" role="tabpanel">
            <div key={activeLeader} className="mkt-consult-v2-leader-panel-inner">
              <h3>{activeLeaderContent.title}</h3>
              <p>{activeLeaderContent.body}</p>
            </div>
          </article>
        </MktShell>
      </section>

      <section className="mkt-consult-v2-closing">
        <MktShell>
          {copy.closing.sections.map((section) => (
            <div key={section.title} className="mkt-consult-v2-closing-row">
              <div className="mkt-consult-v2-closing-row-copy">
                <h2>{section.title}</h2>
                {'subheading' in section && section.subheading ? (
                  <>
                    <span className="mkt-consult-v2-closing-row-rule" aria-hidden="true" />
                    <div className="mkt-consult-v2-closing-row-meta">
                      {/* <h3>{section.subheading}</h3> */}
                      {'subheading1' in section && section.subheading1 ? (
                        <>
                          <span className="mkt-consult-v2-closing-row-meta-sep" aria-hidden="true" />
                          <p className="mkt-consult-v2-closing-row-regions">{section.subheading1}</p>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
              <div className="mkt-consult-v2-closing-row-body">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="mkt-consult-v2-closing-actions">
            <Link to="/contact" className="mkt-consult-v2-btn mkt-consult-v2-btn-primary">
              {copy.closing.primaryCta}
              <ArrowRight aria-hidden="true" />
            </Link>
            <p className="mkt-consult-v2-closing-secondary">
              {copy.closing.secondaryPrompt}{' '}
              <Link to="/contact">{copy.closing.secondaryCta}</Link>
            </p>
          </div>

          {/* <div className="mkt-consult-v2-closing-foot">
            <h3>{copy.closing.footerTitle}</h3>
            <p>{copy.closing.regions.join(' • ')}</p>
          </div> */}
        </MktShell>
      </section>
    </div>
  );
}
