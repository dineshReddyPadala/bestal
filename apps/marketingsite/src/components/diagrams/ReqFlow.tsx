import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';

const STEPS = [
  {
    id: 'need',
    title: 'Client Requirement',
    icon: 'target',
    body: 'A client brings a technology challenge — an outcome, constraint or capability gap — not a generic headcount request.',
  },
  {
    id: 'community',
    title: 'Relevant Community',
    icon: 'community',
    body: 'The need is mapped to the specialist community with the right technologies, evaluation criteria and depth.',
  },
  {
    id: 'capability',
    title: 'Specialist Capability',
    icon: 'star',
    body: 'Evaluated professionals and delivery approaches from that community become the working material.',
  },
  {
    id: 'service',
    title: 'The service that fits',
    icon: 'layers',
    body: 'The same capability engine is delivered as Consulting, Managed Services or Talent Solutions — whichever fits the engagement.',
  },
] as const;

const SERVICE_LINKS = [
  { to: ROUTES.consulting, label: 'Consulting' },
  { to: ROUTES.delivery, label: 'Managed Services' },
  { to: ROUTES.talent, label: 'Talent Solutions' },
];

export function ReqFlow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = STEPS[active];

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % STEPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="req-flow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="req-flow-track">
        <span className="req-flow-rail" aria-hidden="true">
          <span className="req-flow-rail-fill" style={{ width: `${(active / (STEPS.length - 1)) * 100}%` }} />
        </span>
        <ol className="req-flow-steps" aria-label="How a requirement flows">
          {STEPS.map((item, index) => {
            const selected = index === active;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`req-flow-step${selected ? ' is-on' : ''}${index < active ? ' is-done' : ''}`}
                  aria-current={selected ? 'step' : undefined}
                  onClick={() => setActive(index)}
                >
                  <span className="req-flow-icon" aria-hidden="true">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="req-flow-copy">
                    <span className="req-flow-num">{String(index + 1).padStart(2, '0')}</span>
                    <span className="req-flow-title">{item.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="req-flow-panel" aria-live="polite">
        <div key={step.id} className="req-flow-panel-inner">
          <p className="req-flow-kicker">
            Step {String(active + 1).padStart(2, '0')} of {String(STEPS.length).padStart(2, '0')}
          </p>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          {step.id === 'service' ? (
            <div className="req-flow-links">
              {SERVICE_LINKS.map((link) => (
                <Link key={link.to} className="req-flow-chip" to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
