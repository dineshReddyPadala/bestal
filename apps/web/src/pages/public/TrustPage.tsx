import { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Check,
  ChevronDown,
  Eye,
  Lock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@bestal/shared-utils';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { TRUST_PAGE } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

const COMMITMENT_ICONS = [ShieldCheck, TrendingUp, Eye] as const;
const PILLAR_STEP_ICONS = [ShieldCheck, Briefcase, Lock] as const;
const SCROLL_OFFSET = 88;

type TrustPillar = (typeof TRUST_PAGE.pillars)[number];

function TrustPillarStepper({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="mkt-trust-v2-stepper" aria-label="Trust pillars">
      <ol className="mkt-trust-v2-stepper-list">
        {TRUST_PAGE.pillars.map((pillar, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;
          const isLast = index === TRUST_PAGE.pillars.length - 1;
          const Icon = PILLAR_STEP_ICONS[index] ?? ShieldCheck;
          const num = String(index + 1).padStart(2, '0');
          const isLineActive = isComplete || (isActive && activeIndex === 0);

          return (
            <li
              key={pillar.id}
              className={cn(
                'mkt-trust-v2-stepper-item',
                isActive && 'is-active',
                isComplete && 'is-complete',
              )}
            >
              <button
                type="button"
                className="mkt-trust-v2-stepper-btn"
                onClick={() => onSelect(index)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="mkt-trust-v2-stepper-icon" aria-hidden="true">
                  <Icon strokeWidth={2} />
                </span>
                <span className="mkt-trust-v2-stepper-copy">
                  <span className="mkt-trust-v2-stepper-title">
                    <span className="mkt-trust-v2-stepper-index">{num}</span> {pillar.title}
                  </span>
                  <span className="mkt-trust-v2-stepper-sub">{pillar.subtitle}</span>
                </span>
              </button>
              {!isLast ? (
                <span
                  className={cn('mkt-trust-v2-stepper-line', isLineActive && 'is-active')}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TrustPillarAccordion({ items }: { items: TrustPillar['items'] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mkt-trust-v2-accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.title} className={cn('mkt-trust-v2-accordion-item', isOpen && 'is-open')}>
            <button
              type="button"
              className="mkt-trust-v2-accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span className="mkt-trust-v2-accordion-icon" aria-hidden="true">
                <ChevronDown className={cn('mkt-trust-v2-accordion-chev', isOpen && 'is-open')} />
              </span>
              <span className="mkt-trust-v2-accordion-title">{item.title}</span>
              <span className="mkt-trust-v2-accordion-mark" aria-hidden="true">
                <Check strokeWidth={2.5} />
              </span>
            </button>
            {isOpen ? <p className="mkt-trust-v2-accordion-body">{item.body}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function TrustPillarBlock({
  pillar,
  index,
  isActive,
}: {
  pillar: TrustPillar;
  index: number;
  isActive: boolean;
}) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <article className={cn('mkt-trust-v2-pillar', isActive && 'is-active')}>
      <span className="mkt-trust-v2-pillar-index">{num}</span>
      <h2 className="mkt-trust-v2-pillar-title">{pillar.title}</h2>
      <p className="mkt-trust-v2-pillar-subtitle">{pillar.subtitle}</p>
      <p className="mkt-trust-v2-pillar-intro">{pillar.intro}</p>
      <TrustPillarAccordion items={pillar.items} />
    </article>
  );
}

export function TrustPage() {
  const [activeStep, setActiveStep] = useState(0);
  const pillarRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    let frame = 0;

    function updateActiveStep() {
      const nodes = pillarRefs.current.filter(Boolean) as HTMLElement[];
      if (nodes.length === 0) return;

      const triggerLine = SCROLL_OFFSET + 96;
      let next = 0;

      nodes.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom > SCROLL_OFFSET) {
          next = index;
        }
      });

      setActiveStep(next);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveStep);
    }

    updateActiveStep();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  function scrollToPillar(index: number) {
    setActiveStep(index);
    const node = pillarRefs.current[index];
    if (!node) return;

    const top = node.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    <div className="mkt-trust-page mkt-trust-v2-page">
      <PageMeta title={PAGE_SEO.trust.title} description={PAGE_SEO.trust.description} />

      <section className="mkt-trust-v2-hero-band">
        <MktShell className="mkt-trust-v2-hero">
          <div className="mkt-trust-v2-hero-copy">
            <div className="mkt-trust-v2-label">{TRUST_PAGE.hero.label}</div>
            <h1 className="mkt-trust-v2-hero-title">
              Trust at the{' '}
              <span className="mkt-trust-v2-em">Core of Every Engagement</span>
            </h1>
            {TRUST_PAGE.hero.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mkt-trust-v2-body">
                {paragraph}
              </p>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trust-v2-pillars mkt-cream">
        <MktShell>
          <div className="mkt-trust-v2-pillars-layout">
            <aside className="mkt-trust-v2-pillars-aside">
              <TrustPillarStepper activeIndex={activeStep} onSelect={scrollToPillar} />
            </aside>
            <div className="mkt-trust-v2-pillars-main">
              {TRUST_PAGE.pillars.map((pillar, index) => (
                <div
                  key={pillar.id}
                  ref={(node) => {
                    pillarRefs.current[index] = node;
                  }}
                  id={`trust-pillar-${pillar.id}`}
                  className={cn('mkt-trust-v2-pillar-wrap', index === activeStep && 'is-active')}
                >
                  <TrustPillarBlock pillar={pillar} index={index} isActive={index === activeStep} />
                </div>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trust-v2-commitment mkt-white">
        <MktShell className="mkt-trust-v2-commitment-grid">
          <h2 className="mkt-trust-v2-commitment-title">{TRUST_PAGE.commitment.title}</h2>
          <ul className="mkt-trust-v2-commitment-list">
            {TRUST_PAGE.commitment.paragraphs.map((paragraph, index) => {
              const Icon = COMMITMENT_ICONS[index] ?? ShieldCheck;
              return (
                <li key={paragraph.slice(0, 40)} className="mkt-trust-v2-commitment-item">
                  <span className="mkt-trust-v2-commitment-icon" aria-hidden="true">
                    <Icon strokeWidth={2} />
                  </span>
                  <p className="mkt-trust-v2-body mb-0">{paragraph}</p>
                </li>
              );
            })}
          </ul>
        </MktShell>
      </section>

      <section className="mkt-trust-v2-closing">
        <MktShell className="mkt-trust-v2-closing-inner">
          <div className="mkt-trust-v2-closing-icon" aria-hidden="true">
            <ShieldCheck strokeWidth={1.5} />
          </div>
          <div className="mkt-trust-v2-closing-copy">
            <h2>{TRUST_PAGE.closing.title}</h2>
            <p>{TRUST_PAGE.closing.body}</p>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
