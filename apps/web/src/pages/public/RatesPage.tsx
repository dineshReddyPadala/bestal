import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@bestal/shared-utils';
import { Check, Lock } from 'lucide-react';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { useFreeTrialHours } from '../../hooks/api/useTrialPolicy';
import { useMarketingInView, useStaggeredReveal } from '../../hooks/useMarketingReveal';
import { useMarketingTouchViewport, useAutoCycleIndex } from '../../hooks/useMarketingTouchViewport';
import {
  PRICING_BANDS,
  PRICING_FACTOR_ITEMS,
  PRICING_FACTORS,
  PRICING_FOOTER_CTA,
  PRICING_HERO,
  PRICING_PERSPECTIVE,
  PRICING_PERSPECTIVE_NOTES,
  PRICING_PROFILE_INCLUDES,
  PRICING_RATE_BAND_SEGMENTS,
  PRICING_TRANSPARENT,
  PRICING_TRIAL,
  PRICING_TRIAL_NAV,
  PRICING_TRIAL_STEPS,
} from '../../lib/marketing-pricing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function PricingProfileIncludes() {
  const includes = PRICING_PROFILE_INCLUDES ?? PRICING_TRANSPARENT.includes ?? [];
  const includesSection = useMarketingInView<HTMLDivElement>(0.08, true);
  const activeIndex = useAutoCycleIndex(includes.length, 1200, includesSection.inView);
  const activeId = includes[activeIndex]?.id ?? includes[0]?.id ?? 'hourly-rate';

  return (
    <div ref={includesSection.ref} className="mkt-pricing-includes">
      <p className="mkt-pricing-includes-label">{PRICING_TRANSPARENT.panelLabel}</p>
      <div className="mkt-pricing-includes-list" role="list">
        {includes.map((item) => {
          const isActive = activeId === item.id;

          return (
            <div
              key={item.id}
              role="listitem"
              className={cn('mkt-pricing-includes-item', isActive && 'is-active')}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="mkt-pricing-includes-num">{item.num}</span>
              <span className="mkt-pricing-includes-text">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RatesPage() {
  const freeTrialHours = useFreeTrialHours();
  const isTouchViewport = useMarketingTouchViewport();
  const [activeTrialNav, setActiveTrialNav] = useState<string>('real-work');
  const [hoveredTrialStep, setHoveredTrialStep] = useState<string | null>(null);
  const trialTimeline = useMarketingInView<HTMLDivElement>(0.08, true);
  const bandsSection = useMarketingInView<HTMLDivElement>(0.08, true);
  const heroBullets = PRICING_HERO.bullets ?? [];
  const rateBandSegments = PRICING_BANDS.segments ?? PRICING_RATE_BAND_SEGMENTS ?? [];
  const rateBandScale = PRICING_BANDS.scale ?? [];
  const rateBandColumns = PRICING_BANDS.columns ?? [];
  const factorItems = PRICING_FACTOR_ITEMS ?? PRICING_FACTORS.items ?? [];
  const trialSteps = PRICING_TRIAL_STEPS ?? PRICING_TRIAL.steps ?? [];
  const trialNav = PRICING_TRIAL_NAV ?? PRICING_TRIAL.nav ?? [];
  const perspectiveNotes = PRICING_PERSPECTIVE_NOTES ?? PRICING_PERSPECTIVE.notes ?? [];
  const footerPillars = PRICING_FOOTER_CTA.pillars ?? [];

  const trialCtaLabel = useMemo(
    () => PRICING_TRIAL.ctaLabel(freeTrialHours),
    [freeTrialHours],
  );

  const trialFilled = useStaggeredReveal(trialTimeline.inView, trialSteps.length);
  const activeBandIndex = useAutoCycleIndex(rateBandSegments.length, 1500, bandsSection.inView);

  const trialTrackProgress = useMemo(() => {
    if (trialFilled <= 1 || trialSteps.length <= 1) return 0;
    return ((2 * (trialFilled - 1) + 1) / (2 * trialSteps.length)) * 100;
  }, [trialFilled, trialSteps.length]);

  useEffect(() => {
    if (!isTouchViewport || trialFilled <= 0) return;
    const activeStep = trialSteps[trialFilled - 1];
    if (activeStep) setHoveredTrialStep(activeStep.num);
  }, [isTouchViewport, trialFilled, trialSteps]);

  return (
    <div className="mkt-pricing-page">
      <PageMeta title={PAGE_SEO.rates.title} description={PAGE_SEO.rates.description} />

      <section className="mkt-pricing-hero-band">
        <MktShell className="mkt-pricing-hero">
          <div className="mkt-pricing-hero-grid">
            <div className="mkt-pricing-hero-copy">
              <p className="mkt-pricing-hero-label">{PRICING_HERO.label}</p>
              <h1 className="mkt-pricing-hero-title">
                {PRICING_HERO.titleLines.map((line) => (
                  <span
                    key={line.text}
                    className={cn('mkt-pricing-hero-title-line', line.em && 'mkt-pricing-em')}
                  >
                    {line.text}
                  </span>
                ))}
              </h1>
            </div>
            <div className="mkt-pricing-hero-aside mt-8">
              <p className="mkt-pricing-body">{PRICING_HERO.body}</p>
              <ul className="mkt-pricing-hero-bullets">
                {heroBullets.map((bullet) => (
                  <li key={bullet}>
                    <span className="mkt-pricing-bullet-mark" aria-hidden="true">
                      <Check strokeWidth={2.5} />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MktShell>
      </section>

      {/* <section className="mkt-pricing-subnav-band" aria-label="Pricing navigation">
        <MktShell className="mkt-pricing-subnav justify-center">
          {heroPillars.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              className="mkt-pricing-subnav-item mr-2"
              onClick={() => scrollToSection(pillar.id)}
            >
              {pillar.label} 
            </button>
          ))}
        </MktShell>
      </section> */}

      <section id="know-the-engineer" className="mkt-section mkt-pricing-transparent">
        <MktShell>
          <div className="mkt-pricing-split mkt-pricing-split--story">
            <div className="mkt-pricing-split--story-row">
              <div className="mkt-pricing-split-copy">
                <h2 className="mkt-pricing-section-title">{PRICING_TRANSPARENT.title}</h2>
                <p className="mkt-pricing-em-line">
                  <span className="mkt-pricing-em">{PRICING_TRANSPARENT.titleEm}</span>
                </p>
                <blockquote className="mkt-pricing-side-note">
                  {PRICING_TRANSPARENT.sideNote}
                </blockquote>
              </div>
              <div className="mkt-pricing-split-panel">
                <PricingProfileIncludes />
              </div>
            </div>
          </div>
        </MktShell>
      </section>

      <section id="know-the-rate" className="mkt-section mkt-pricing-bands-section">
        <MktShell>
          <div ref={bandsSection.ref} className="mkt-pricing-bands">
            <div className="mkt-pricing-bands-head">
              <div className="mkt-pricing-bands-head-copy">
                <h2 className="mkt-pricing-section-title">{PRICING_BANDS.title}</h2>
              </div>

              <div className="mkt-pricing-rate-chart" aria-label="Typical hourly rate bands">
                <div className="mkt-pricing-rate-scale" aria-hidden="true">
                  {rateBandScale.map((mark) => (
                    <span key={mark}>{mark}</span>
                  ))}
                </div>
                <div className="mkt-pricing-rate-bar" role="list">
                  {rateBandSegments.map((segment, index) => (
                    <div
                      key={segment.id}
                      className={cn(
                        'mkt-pricing-rate-segment',
                        `is-${segment.tone}`,
                        index === activeBandIndex && 'is-active',
                      )}
                      style={{ flexGrow: segment.flex, flexBasis: 0 }}
                      role="listitem"
                      aria-current={index === activeBandIndex ? 'step' : undefined}
                    >
                      <span>{segment.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mkt-pricing-rate-axis" aria-hidden="true">
                  <span className="mkt-pricing-rate-axis-line" />
                  <span className="mkt-pricing-rate-axis-label">{PRICING_BANDS.axisLabel}</span>
                  <span className="mkt-pricing-rate-axis-line" />
                </div>
              </div>
            </div>

            <div className="mkt-pricing-bands-columns">
              {rateBandColumns.map((column) => (
                <p key={column.slice(0, 24)} className="mkt-pricing-body">
                  {column}
                </p>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-pricing-factors-section">
        <MktShell>
          <h2 className="mkt-pricing-factors-title">{PRICING_FACTORS.title}</h2>
          <p className="mkt-pricing-body pricing-mkt-bodytext">Published rates reflect the engineer's expertise. skills, experience, assessed capability, market demand , availability and relevant Certification:</p>
          <div className="mkt-pricing-factors-grid">
            {factorItems.map((item) => (
              <article key={item.num} className="mkt-pricing-factor-card">
                <span className="mkt-pricing-factor-num">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-pricing-perspective-section">
        <MktShell>
          <div className="mkt-pricing-perspective-intro">
            <div className="mkt-pricing-perspective-intro-copy">
              <h2 className="mkt-pricing-perspective-title">{PRICING_PERSPECTIVE.title}</h2>
            </div>
            <div className="mkt-pricing-perspective-notes">
              {perspectiveNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'mkt-pricing-perspective-note',
                    note.id === 'value' && 'is-emphasis',
                  )}
                >
                  {note.id === 'cost-advantage' ? (
                    <p>{note.body}</p>
                  ) : (
                    <p>
                      {note.bodyLead}
                      <strong>{note.bodyEm}</strong>
                      {note.bodyTail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <blockquote className="mkt-pricing-perspective-quote">
            <p>
              {PRICING_PERSPECTIVE.quoteLead}
              <span className="mkt-pricing-em">{PRICING_PERSPECTIVE.quoteEm}</span>
            </p>
            <footer>{PRICING_PERSPECTIVE.quoteSubtext}</footer>
          </blockquote>
        </MktShell>
      </section>

      <section id="before-you-decide" className="mkt-section mkt-pricing-trial-section">
        <MktShell>
          <div className="mkt-pricing-trial-marker" aria-hidden="true">
            <span className="mkt-pricing-trial-marker-num">{PRICING_TRIAL.sectionNum}</span>
            <span className="mkt-pricing-trial-marker-line" />
          </div>

          <div className="mkt-pricing-trial-head">
            <div className="mkt-pricing-trial-head-copy">
              <h2 className="mkt-pricing-section-title">{PRICING_TRIAL.title}</h2>
              <p className="mkt-pricing-trial-subtitle">
                {PRICING_TRIAL.subtitleLead}
                <span className="mkt-pricing-trial-subtitle-em">{PRICING_TRIAL.subtitleEm}</span>
                {PRICING_TRIAL.subtitleTail}
              </p>
              <nav className="mkt-pricing-trial-nav" aria-label="Trial evaluation focus">
                {trialNav.map((item, index) => (
                  <span key={item.id} className="mkt-pricing-trial-nav-item-wrap">
                    {index > 0 ? (
                      <span className="mkt-pricing-trial-nav-sep" aria-hidden="true">
                        |
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={cn(
                        'mkt-pricing-trial-nav-item',
                        activeTrialNav === item.id && 'is-active',
                      )}
                      onClick={() => setActiveTrialNav(item.id)}
                    >
                      {item.label}
                    </button>
                  </span>
                ))}
              </nav>
            </div>
            <Link to={PRICING_TRIAL.ctaHref} className="mkt-btn mkt-btn-primary mkt-pricing-trial-btn">
              {trialCtaLabel}
            </Link>
          </div>

          <div
            ref={trialTimeline.ref}
            className="mkt-pricing-trial-timeline"
            aria-label="Trial evaluation steps"
          >
            <div className="mkt-pricing-trial-timeline-track" aria-hidden="true">
              <span
                className="mkt-pricing-trial-timeline-track-fill"
                style={{ width: `${trialTrackProgress}%` }}
              />
            </div>
            <div className="mkt-pricing-trial-timeline-steps">
              {trialSteps.map((step, index) => {
                const isFilled = index < trialFilled;

                return (
                  <div
                    key={step.num}
                    className={cn(
                      'mkt-pricing-trial-timeline-step',
                      isFilled && 'is-filled',
                      hoveredTrialStep === step.num && 'is-hovered',
                    )}
                    onMouseEnter={() => setHoveredTrialStep(step.num)}
                    onMouseLeave={() => setHoveredTrialStep(null)}
                  >
                    <span
                      className={cn('mkt-pricing-trial-timeline-num', isFilled && 'is-active')}
                    >
                      {step.num}
                    </span>
                    <span className="mkt-pricing-trial-timeline-label">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mkt-pricing-trial-foot">
            <span className="mkt-pricing-trial-foot-icon-wrap" aria-hidden="true">
              <Lock className="mkt-pricing-trial-foot-icon" />
            </span>
            <p>
              {PRICING_TRIAL.footnoteLead}{' '}
              <span className="mkt-pricing-em">{PRICING_TRIAL.footnoteEm}</span>
            </p>
          </div>
        </MktShell>
      </section>

      <section className="mkt-pricing-footer-cta">
        <MktShell className="mkt-pricing-footer-cta-inner">
          <div className="mkt-pricing-footer-cta-copy">
            <h2>{PRICING_FOOTER_CTA.title}</h2>
            <p>{PRICING_FOOTER_CTA.body}</p>
            <div className="mkt-actions mkt-actions-center">
              <Link to={PRICING_FOOTER_CTA.primaryHref} className="mkt-btn mkt-btn-white mkt-btn-lg">
                {PRICING_FOOTER_CTA.primaryCta}
                <ForwardArrow />
              </Link>
              <Link to={PRICING_FOOTER_CTA.secondaryHref} className="mkt-pricing-footer-link">
                {PRICING_FOOTER_CTA.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="mkt-pricing-footer-pillars">
            {footerPillars.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
        </MktShell>
      </section>
    </div>
  );
}
