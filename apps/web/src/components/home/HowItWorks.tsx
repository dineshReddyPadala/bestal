import { Link } from 'react-router-dom';
import { howItWorks, howItWorksDraft } from '../../data/homeCopy';
import { ForwardArrow } from '../ui/ForwardArrow';
import { SectionHeading } from './SectionHeading';
import { Draft } from './Draft';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-cream-deep py-16 md:py-24">
      <div className="section-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="How it works" title={howItWorks.h2} />
          <Link
            to="/how-it-works"
            className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-accent transition-colors duration-150 ease-out hover:text-ink md:self-end md:pb-1"
          >
            {howItWorks.link}
            <ForwardArrow />
          </Link>
        </div>

        <ol className="mt-10 border-t border-line">
          {howItWorks.steps.map((step) => (
            <li
              key={step.number}
              className="grid gap-3 border-b border-line py-6 md:grid-cols-[72px_1fr_1.2fr] md:items-baseline md:gap-10"
            >
              <span className="font-display text-[14px] font-semibold text-accent">
                {step.number}
              </span>
              <h3 className="font-display text-[19px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                {step.title}
              </h3>
              <Draft>
                <p className="text-[14px] leading-relaxed text-ink/65">
                  {howItWorksDraft[step.number]}
                </p>
              </Draft>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
