import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@bestal/shared-utils';
import {
  Briefcase,
  Check,
  Clock,
  Code2,
  Eye,
  Globe,
  MessageSquare,
  Monitor,
  Puzzle,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { images } from '../../data/homeCopy';
import { useFreeTrialHours } from '../../hooks/api/useTrialPolicy';
import {
  ASSESS_CTA,
  ASSESS_DIMENSIONS,
  ASSESS_HERO,
  ASSESS_PREVETTED,
  ASSESS_PROCESS_STEPS,
  ASSESS_SPOTLIGHT,
  ASSESS_VALIDATION,
  ASSESS_WHAT_WE_ASSESS,
  type AssessDimensionId,
} from '../../lib/marketing-assess-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

const DIMENSION_ICONS = {
  'technical-depth': Code2,
  'problem-solving': Puzzle,
  collaboration: Users,
  communication: MessageSquare,
  'client-readiness': Briefcase,
} as const;

const VALIDATION_ICONS = {
  team: Users,
  environment: Monitor,
  challenges: Globe,
  hours: Clock,
} as const;

function useInView<T extends HTMLElement>(threshold = 0.15, once = false) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const markVisible = () => {
      setInView(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markVisible();
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: [0, threshold], rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      markVisible();
      if (once) observer.disconnect();
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

function useScrollCounter(active: boolean, from = 5, to = 10, durationMs = 900) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!active) {
      setValue(from);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, from, to, durationMs]);

  return value;
}

function useStaggeredReveal(
  active: boolean,
  count: number,
  intervalMs = 450,
  pauseMs = 800,
) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!active || count <= 0) return undefined;

    let cancelled = false;
    let timeoutId = 0;
    let step = 0;
    let filling = true;

    const schedule = (delay: number) => {
      timeoutId = window.setTimeout(tick, delay);
    };

    const tick = () => {
      if (cancelled) return;

      if (filling) {
        setRevealed(step + 1);
        step += 1;

        if (step >= count) {
          filling = false;
          step = 0;
          schedule(pauseMs);
        } else {
          schedule(intervalMs);
        }
        return;
      }

      setRevealed(0);
      filling = true;
      schedule(0);
    };

    setRevealed(0);
    schedule(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, count, intervalMs, pauseMs]);

  return revealed;
}

const PROCESS_STEP_ICONS: Record<string, LucideIcon> = {
  'ai-assessment': Sparkles,
  'consistent-evaluation': Scale,
  'quality-review': ShieldCheck,
  published: Eye,
};

function StepCircle({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn('mkt-assess-step-icon', checked && 'is-checked')}
      aria-hidden="true"
    >
      <Check
        className={cn('mkt-assess-step-check', !checked && 'mkt-assess-step-check--hidden')}
        strokeWidth={2.5}
      />
    </span>
  );
}

type StepperStep = {
  id: string;
  num?: string;
  title: string;
  body: string;
};

function AssessStepper({
  steps,
  hoveredId,
  onHover,
  showNumbers = true,
  showMeta = false,
  compactTimeline = false,
  centered = false,
  stepIcons,
  titleTag: TitleTag = 'h2',
  filledCount,
  showCardNumbers = false,
}: {
  steps: readonly StepperStep[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  showNumbers?: boolean;
  showMeta?: boolean;
  compactTimeline?: boolean;
  centered?: boolean;
  stepIcons?: Record<string, LucideIcon>;
  titleTag?: 'h2' | 'h3';
  filledCount?: number;
  showCardNumbers?: boolean;
}) {
  const useTimeline = compactTimeline || showMeta;

  return (
    <div
      className={cn(
        'mkt-assess-stepper',
        useTimeline && 'mkt-assess-stepper--timeline',
        showMeta && 'mkt-assess-stepper--with-meta',
        centered && 'mkt-assess-stepper--centered',
      )}
    >
      {steps.map((step, index) => {
        const isFilled = filledCount === undefined ? true : index < filledCount;
        const checked = hoveredId === step.id;
        const isLast = index === steps.length - 1;
        const MetaIcon = stepIcons?.[step.id];
        return (
          <div key={step.id} className="mkt-assess-stepper-col">
            <div
              className={cn(
                'mkt-assess-stepper-track-col',
                (checked ||
                  (filledCount !== undefined &&
                    filledCount > 0 &&
                    index < filledCount - 1)) &&
                  'is-line-active',
              )}
            >
              <div
                className="mkt-assess-stepper-node"
                onMouseEnter={() => onHover(step.id)}
                onMouseLeave={() => onHover(null)}
              >
                <StepCircle checked={isFilled} />
                {showNumbers && !showMeta && !useTimeline && step.num ? (
                  <span className="mkt-assess-process-num">{step.num}</span>
                ) : null}
              </div>
              {!isLast && !useTimeline ? (
                <span className={cn('mkt-assess-step-connector', checked && 'is-active')} />
              ) : null}
            </div>
            <article
              className="mkt-assess-stepper-card"
              onMouseEnter={() => onHover(step.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(step.id)}
              onBlur={() => onHover(null)}
              tabIndex={0}
            >
              {showMeta && MetaIcon && step.num ? (
                <div className="mkt-assess-stepper-meta">
                  <MetaIcon className="mkt-assess-stepper-meta-icon" aria-hidden="true" />
                  <span className="mkt-assess-process-num">{step.num}</span>
                </div>
              ) : null}
              {showCardNumbers && step.num ? (
                <span className="mkt-assess-stepper-card-num">{step.num}</span>
              ) : null}
              <TitleTag>{step.title}</TitleTag>
              <p>{step.body}</p>
            </article>
          </div>
        );
      })}
    </div>
  );
}

export function EvaluationStandardPage() {
  const freeTrialHours = useFreeTrialHours();
  const [hoveredProcess, setHoveredProcess] = useState<string | null>(null);
  const [activeDimension, setActiveDimension] = useState<AssessDimensionId>('technical-depth');
  const [hoveredPrevetted, setHoveredPrevetted] = useState<string | null>(null);
  const [spotlightHovered, setSpotlightHovered] = useState(false);

  const validation = useInView<HTMLElement>(0.4);
  const prevettedStepper = useInView<HTMLDivElement>(0.08, true);
  const trialValue = useScrollCounter(validation.inView, 5, freeTrialHours, 900);
  const processFilled = useStaggeredReveal(true, ASSESS_PROCESS_STEPS.length, 450);
  const prevettedFilled = useStaggeredReveal(
    prevettedStepper.inView,
    ASSESS_PREVETTED.steps.length,
    450,
  );

  const selectedDimension =
    ASSESS_DIMENSIONS.find((item) => item.id === activeDimension) ?? ASSESS_DIMENSIONS[0];

  return (
    <div className="mkt-assess-page">
      <PageMeta
        title={PAGE_SEO.evaluationStandard.title}
        description={PAGE_SEO.evaluationStandard.description}
      />

      <section className="mkt-assess-hero-band">
        <MktShell className="mkt-hiw-v3-hero mkt-assess-hero">
          <h1>{ASSESS_HERO.title}</h1>
          <p className="mkt-assess-hero-sub howitworks-body-style">{ASSESS_HERO.subtitle}</p>

          <div className="mkt-assess-process-stepper-wrap">
            <AssessStepper
              steps={ASSESS_PROCESS_STEPS}
              hoveredId={hoveredProcess}
              onHover={setHoveredProcess}
              showMeta
              stepIcons={PROCESS_STEP_ICONS}
              titleTag="h2"
              filledCount={processFilled}
            />
          </div>
        </MktShell>
      </section>

      <section
        className={cn('mkt-assess-spotlight', spotlightHovered && 'is-active')}
        onMouseEnter={() => setSpotlightHovered(true)}
        onMouseLeave={() => setSpotlightHovered(false)}
        onFocus={() => setSpotlightHovered(true)}
        onBlur={() => setSpotlightHovered(false)}
        tabIndex={0}
      >
        <MktShell className="mkt-assess-spotlight-inner">
          <div className="mkt-assess-spotlight-content">
            <h2>{ASSESS_SPOTLIGHT.title}</h2>
            <p>{ASSESS_SPOTLIGHT.body}</p>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-assess-dimensions-section">
        <MktShell>
          <div className="mkt-assess-section-hd mkt-assess-dimensions-hd">
            <h2>{ASSESS_WHAT_WE_ASSESS.title}</h2>
            <p className="howitworks-body-style">{ASSESS_WHAT_WE_ASSESS.intro}</p>
          </div>

          <div className="mkt-assess-dimensions-layout">
            <div className="mkt-assess-dimensions-nav-col">
              <div className="mkt-assess-dimensions-nav" role="tablist" aria-label="Assessment dimensions">
                {ASSESS_DIMENSIONS.map((item) => {
                  const Icon = DIMENSION_ICONS[item.id];
                  const isActive = activeDimension === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={cn('mkt-assess-dimensions-nav-item', isActive && 'is-active')}
                      onMouseEnter={() => setActiveDimension(item.id)}
                      onFocus={() => setActiveDimension(item.id)}
                    >
                      <span className="mkt-assess-dimensions-nav-marker" aria-hidden="true" />
                      <span className="mkt-assess-dimensions-nav-num">{item.num}</span>
                      <Icon className="mkt-assess-dimensions-nav-icon" aria-hidden="true" />
                      <span className="mkt-assess-dimensions-nav-label">{item.title}</span>
                    </button>
                  );
                })}
              </div>
              <span className="mkt-assess-dimensions-rail" aria-hidden="true" />
            </div>

            <article className="mkt-assess-dimensions-panel" role="tabpanel">
              <div className="mkt-assess-dimensions-panel-top">
                <span className="mkt-assess-dimensions-panel-num" aria-hidden="true">
                  {selectedDimension.num}
                </span>
              </div>
              <h3>{selectedDimension.title}</h3>
              <p className="mkt-assess-dimensions-panel-desc">{selectedDimension.description}</p>
              <ul className="mkt-assess-dimensions-bullets">
                {selectedDimension.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span className="mkt-assess-dimensions-bullet-line" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-assess-prevetted-section">
        <MktShell>
          <div className="mkt-assess-section-hd mkt-assess-prevetted-hd">
            <h2>{ASSESS_PREVETTED.title}</h2>
            <p className="howitworks-body-style">{ASSESS_PREVETTED.intro}</p>
          </div>

          <div ref={prevettedStepper.ref} className="mkt-assess-prevetted-stepper-wrap">
            <AssessStepper
              steps={ASSESS_PREVETTED.steps}
              hoveredId={hoveredPrevetted}
              onHover={setHoveredPrevetted}
              compactTimeline
              titleTag="h3"
              filledCount={prevettedFilled}
              showCardNumbers
            />
          </div>

          <div className="mkt-assess-prevetted-footer">
            {ASSESS_PREVETTED.footer.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="howitworks-body-style">
                {paragraph}
              </p>
            ))}
          </div>
        </MktShell>
      </section>

      <section ref={validation.ref} className="mkt-section mkt-assess-validation-section">
        <MktShell>
          <div className="mkt-assess-validation-layout">
            <div className="mkt-assess-validation-copy">
              <div className="mkt-hiw-v3-section-title-row mkt-assess-validation-hd">
                <h2>{ASSESS_VALIDATION.title}</h2>
                <p className="howitworks-body-style">{ASSESS_VALIDATION.intro}</p>
              </div>

              <div className="mkt-assess-trial-meter" aria-live="polite">
                <div className="mkt-assess-trial-meter-value">
                  <span className="mkt-assess-trial-meter-number">
                    {trialValue.toFixed(1)}
                  </span>
                  <span className="mkt-assess-trial-meter-label">hour free trial</span>
                </div>
                <div className="mkt-assess-trial-meter-bars" aria-hidden="true">
                  {Array.from({ length: freeTrialHours }, (_, index) => {
                    const filled = trialValue >= index + 1;
                    return (
                      <span
                        key={index}
                        className={cn('mkt-assess-trial-meter-bar', filled && 'is-filled')}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mkt-assess-validation-grid">
              {ASSESS_VALIDATION.cards.map((card) => {
                const Icon = VALIDATION_ICONS[card.id as keyof typeof VALIDATION_ICONS];
                return (
                  <article key={card.id} className="mkt-assess-validation-cell" tabIndex={0}>
                    <div className="mkt-assess-validation-cell-hd">
                      <Icon className="mkt-assess-validation-cell-icon" aria-hidden="true" />
                      <span className="mkt-assess-validation-cell-num">{card.num}</span>
                    </div>
                    <h3>{card.title}</h3>
                    <span className="mkt-assess-validation-cell-line" aria-hidden="true">
                      <span className="mkt-assess-validation-cell-line-fill" />
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section-tight">
        <MktShell>
          <div className="mkt-cta-banner mkt-assess-cta-banner">
            <div className="mkt-cta-copy">
              <h2>{ASSESS_CTA.title}</h2>
              <div className="mkt-actions">
                <Link to="/sample-talent" className="mkt-btn mkt-btn-dark mkt-btn-lg">
                  {ASSESS_CTA.button}
                  <ForwardArrow />
                </Link>
              </div>
            </div>
            <div className="mkt-cta-photo">
              <img src={images.cta} alt="Team collaborating during a working trial" />
            </div>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
