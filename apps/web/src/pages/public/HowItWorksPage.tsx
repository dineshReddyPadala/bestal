import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@bestal/shared-utils';
import {
  ArrowRight,
  ArrowRightLeft,
  Ban,
  Box,
  FileText,
  ShieldCheck,
  Timer,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { useFreeTrialHours } from '../../hooks/api/useTrialPolicy';
import { howweassesscta } from '../../data/homeCopy';
import {
  CTA_BANNER_PHOTO_DISPLAY_HEIGHT_PX,
  CTA_BANNER_PHOTO_DISPLAY_WIDTH_PX,
  CTA_BANNER_PHOTO_SIZES,
} from '../../lib/brand';
import { HIW_HERO, HIW_SEEKER } from '../../lib/marketing-copy';
import { buildHiwClient } from '../../lib/marketing-trial-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

type StageItem = {
  num: string;
  title: string;
  body: string;
  showArrow: boolean;
};

function HiWSectionHeader({
  stepCount,
  title,
  intro,
}: {
  stepCount: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="mkt-hiw-v3-section-hd">
      <div className="mkt-hiw-v3-section-meta">
        <span className="mkt-hiw-v3-step-count">{stepCount}</span>
      </div>
      <div className="mkt-hiw-v3-section-title-row">
        <h2>{title}</h2>
        <p className="howitworks-body-style">{intro}</p>
      </div>
    </div>
  );
}

function HiWStagesGrid({
  label,
  stages,
  columns,
}: {
  label: string;
  stages: readonly StageItem[];
  columns: 3 | 4;
}) {
  return (
    <div className="mkt-hiw-v3-stages-block">
      <div className="mkt-hiw-v3-stages-label">
        <span>{label}</span>
        <span className="mkt-hiw-v3-stages-line" aria-hidden="true" />
      </div>
      <div
        className={cn(
          'mkt-hiw-v3-stages-grid',
          columns === 4 && 'mkt-hiw-v3-stages-grid--4',
        )}
      >
        {stages.map((stage) => (
          <article key={stage.num} className="mkt-hiw-v3-stage">
            <div className="mkt-hiw-v3-stage-track">
              <span className="mkt-hiw-v3-stage-num">{stage.num}</span>
              {stage.showArrow ? (
                <span className="mkt-hiw-v3-stage-arrow" aria-hidden="true">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="mkt-hiw-v3-stage-arrow is-empty" aria-hidden="true" />
              )}
            </div>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const trialIcons = [ArrowRight, ArrowRightLeft, Ban] as const;

const processCardIcons = {
  peach: FileText,
  blue: Users,
  green: Timer,
} as const;

function HiWProcessFlow({ hiwClient }: { hiwClient: ReturnType<typeof buildHiwClient> }) {
  return (
    <div className="mkt-hiw-v3-flow">
      <div className="mkt-hiw-v3-flow-ribbon">
        <span>{hiwClient.flowRibbon.left}</span>
        <span>{hiwClient.flowRibbon.right}</span>
      </div>
      <div className="mkt-hiw-v3-flow-row">
        {hiwClient.processCards.map((card, index) => {
          const Icon = processCardIcons[card.tone];
          return (
            <div key={card.title} className="mkt-hiw-v3-flow-wrap">
              <article className={cn('mkt-hiw-v3-flow-card mkt-hiw-pastel-card', `is-${card.tone}`)}>
                <div className="mkt-hiw-v3-flow-card-hd">
                  <Icon className="mkt-hiw-v3-flow-card-icon" aria-hidden="true" />
                  <span className="mkt-hiw-v3-flow-card-stage">{card.stage}</span>
                </div>
                <h3>{card.title}</h3>
                {'tags' in card && card.tags ? (
                  <div className="mkt-hiw-v3-flow-tags">
                    {card.tags.map((tag) => (
                      <span key={tag} className="mkt-hiw-v3-flow-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {'matchRows' in card && card.matchRows ? (
                  <div className="mkt-hiw-v3-flow-matches">
                    {card.matchRows.map((row) => (
                      <div key={row.num} className="mkt-hiw-v3-flow-match-row">
                        <span className="mkt-hiw-v3-flow-match-num">{row.num}</span>
                        <div className="mkt-hiw-v3-flow-match-bar-wrap">
                          <span
                            className="mkt-hiw-v3-flow-match-bar"
                            style={{ width: `${row.fill}%` }}
                          />
                        </div>
                        <span className="mkt-hiw-v3-flow-match-score">8/8</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {'trialHours' in card && card.trialHours ? (
                  <div className="mkt-hiw-v3-flow-hours" aria-hidden="true">
                    {Array.from({ length: card.trialHours }, (_, i) => (
                      <span key={i} className="mkt-hiw-v3-flow-hour" />
                    ))}
                  </div>
                ) : null}
                <p>{card.body}</p>
              </article>
              {index < hiwClient.processCards.length - 1 ? (
                <span className="mkt-hiw-v3-flow-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  const freeTrialHours = useFreeTrialHours();
  const hiwClient = useMemo(() => buildHiwClient(freeTrialHours), [freeTrialHours]);

  return (
    <div className="mkt-hiw-page mkt-hiw-v3-page">
      <PageMeta title={PAGE_SEO.howItWorks.title} description={PAGE_SEO.howItWorks.description} />

      <section className="mkt-hiw-hero-band">
        <MktShell className="mkt-hiw-hero mkt-hiw-v3-hero">
          <div className="mkt-hiw-label">{HIW_HERO.label}</div>
          <h1>{HIW_HERO.title}</h1>
          <div className="mkt-hiw-hero-copy">
            <p className="mkt-lead howitworks-body-style">{HIW_HERO.body}</p>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-hiw-v3-section">
        <MktShell>
          <HiWSectionHeader
            stepCount={hiwClient.stepCount}
            title={hiwClient.title}
            intro={hiwClient.intro}
          />

          <HiWProcessFlow hiwClient={hiwClient} />

          <div className="mkt-hiw-v3-trial-panel">
            <div className="mkt-hiw-v3-trial-hd">
              <h3>{hiwClient.trialOutcome.title}</h3>
              <span className="mkt-hiw-v3-stage-pill">{hiwClient.trialOutcome.stageTag}</span>
            </div>
            <div className="mkt-hiw-v3-trial-grid">
              {hiwClient.trialOutcome.options.map((option, index) => {
                const Icon = trialIcons[index] ?? ArrowRight;
                return (
                  <article
                    key={option.title}
                    className={cn(
                      'mkt-hiw-v3-trial-card mkt-hiw-pastel-card',
                      'tone' in option && option.tone ? `is-${option.tone}` : undefined,
                    )}
                  >
                    <Icon className="mkt-hiw-v3-trial-icon" aria-hidden="true" />
                    <h4>{option.title}</h4>
                    <p>{option.body}</p>
                    {'footerLabel' in option && option.footerLabel ? (
                      <div className="mkt-hiw-v3-trial-footer">
                        <Box className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        <span className="mkt-hiw-v3-trial-footer-label">{option.footerLabel}</span>
                        <span className="mkt-hiw-v3-stage-pill is-small">
                          {option.footerStage}
                        </span>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <HiWStagesGrid
            label={hiwClient.stagesLabel}
            stages={hiwClient.stages}
            columns={3}
          />
        </MktShell>
      </section>

      <section className="mkt-white mkt-section-tight">
        <MktShell>
          <div className="mkt-cta-banner">
            <div className="mkt-cta-copy">
              <h2>Start with the evidence.</h2>
              <p>
                Browse the Skill Communities, or tell us what you need and we&apos;ll match against
                it.
              </p>
              <div className="mkt-actions">
                <Link to="/sample-talent" className="mkt-btn mkt-btn-dark mkt-btn-lg">
                  Browse Pre-Vetted Talent
                  <ForwardArrow />
                </Link>
                <Link to="/reach-out" className="mkt-btn mkt-btn-outline mkt-btn-lg">
                  Tell us what you need
                </Link>
              </div>
            </div>
            <div className="mkt-cta-photo">
              <img
                src={howweassesscta.cta}
                alt="Team reviewing engineer evidence together"
                width={CTA_BANNER_PHOTO_DISPLAY_WIDTH_PX}
                height={CTA_BANNER_PHOTO_DISPLAY_HEIGHT_PX}
                sizes={CTA_BANNER_PHOTO_SIZES}
                decoding="async"
                fetchPriority="low"
              />
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-hiw-v3-section mkt-hiw-v3-section--seeker">
        <MktShell>
          <HiWSectionHeader
            stepCount={HIW_SEEKER.stepCount}
            title={HIW_SEEKER.title}
            intro={HIW_SEEKER.intro}
          />

          <div className="mkt-hiw-v3-seeker-layout">
            <div className="mkt-hiw-v3-funnel-wrap">
              <p className="mkt-hiw-v3-funnel-label">{HIW_SEEKER.funnelLabel}</p>
              <div className="mkt-hiw-v3-funnel">
                {HIW_SEEKER.funnel.map((step) => (
                  <div key={step.range} className="mkt-hiw-v3-funnel-step">
                    <span className="mkt-hiw-v3-funnel-range">{step.range}</span>
                    <div
                      className={cn('mkt-hiw-v3-funnel-bar', `is-${step.tone}`)}
                      style={{ width: `${step.width}%` }}
                    >
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mkt-hiw-v3-funnel-note">{HIW_SEEKER.funnelNote}</p>
            </div>

            <div className="mkt-hiw-v3-stat-cards">
              {HIW_SEEKER.stats.map((stat, index) => {
                const Icon = index === 0 ? ShieldCheck : UserCheck;
                return (
                  <article key={stat.label} className="mkt-hiw-v3-stat-card">
                    <Icon className="mkt-hiw-v3-stat-icon" aria-hidden="true" />
                    <p className="mkt-hiw-v3-stat-label">{stat.label}</p>
                    <p className="mkt-hiw-v3-stat-value">{stat.value}</p>
                    <p className="mkt-hiw-v3-stat-note">{stat.note}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <HiWStagesGrid
            label={HIW_SEEKER.stagesLabel}
            stages={HIW_SEEKER.stages}
            columns={4}
          />
        </MktShell>
      </section>
    </div>
  );
}
