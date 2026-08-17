import { Link } from 'react-router-dom';
import { trial, trialDraft, scale, scaleDraft } from '../../data/homeCopy';
import { ForwardArrow } from '../ui/ForwardArrow';
import { Draft } from './Draft';

export function TrialAndScale() {
  return (
    <section id="one-week" className="bg-cream py-16 md:py-24">
      <div className="section-shell grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <article className="flex flex-col rounded-card border border-line bg-forest p-8 md:p-10">
          <h2 className="max-w-md font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em] text-white sm:text-[34px]">
            {trial.h2}
          </h2>
          <Draft className="mt-6 max-w-xl">
            <p className="text-[15px] leading-relaxed text-white/70">{trialDraft.body}</p>
          </Draft>
          <Link
            to="/try-for-a-week"
            className="mt-auto inline-flex items-center gap-1.5 pt-8 text-[14px] font-semibold text-accent-bright transition-colors duration-150 ease-out hover:text-white"
          >
            {trial.link}
            <ForwardArrow />
          </Link>
        </article>

        <article className="flex flex-col rounded-card border border-line bg-white p-8 md:p-10">
          <h2 className="font-display text-[24px] font-semibold leading-[1.14] tracking-[-0.02em] text-ink sm:text-[28px]">
            {scale.h2}
          </h2>
          <Draft className="mt-6">
            <p className="text-[15px] leading-relaxed text-ink/70">{scaleDraft.body}</p>
          </Draft>
        </article>
      </div>
    </section>
  );
}
