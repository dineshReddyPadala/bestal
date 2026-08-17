import { Link } from 'react-router-dom';
import { differentiation, differentiationDraft } from '../../data/homeCopy';
import { ForwardArrow } from '../ui/ForwardArrow';
import { Draft } from './Draft';

export function Differentiation() {
  return (
    <section id="differentiation" className="border-y border-line bg-cream-deep py-16 md:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-20">
        <h2 className="font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[42px]">
          {differentiation.h2}
        </h2>

        <div className="lg:pt-2">
          <Draft>
            <p className="text-[15px] leading-relaxed text-ink/70">{differentiationDraft.body}</p>
          </Draft>
          <Link
            to="/evaluation-standard"
            className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent transition-colors duration-150 ease-out hover:text-ink"
          >
            {differentiation.link}
            <ForwardArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
