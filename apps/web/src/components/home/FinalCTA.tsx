import { Link } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';
import { finalCta, images } from '../../data/homeCopy';

export function FinalCTA() {
  return (
    <section id="final-cta" className="bg-cream pb-16 pt-4 md:pb-24">
      <div className="section-shell">
        <div className="grid overflow-hidden rounded-card bg-forest lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
            <h2 className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[38px]">
              {finalCta.h2}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              {finalCta.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/sample-talent"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-cream"
              >
                {finalCta.primaryCta}
                <ForwardArrow />
              </Link>
              <Link
                to="/reach-out"
                className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:border-white/60"
              >
                {finalCta.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[240px] lg:min-h-[320px]">
            <img
              src={images.cta}
              alt="A team of technology professionals collaborating around a table"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
