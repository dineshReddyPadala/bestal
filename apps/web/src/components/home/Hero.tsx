import { Clock, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';
import { hero, images } from '../../data/homeCopy';

export function Hero() {
  return (
    <section id="top" className="bg-ink pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[52px] lg:text-[56px]">
            {hero.h1}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/65">{hero.sub}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/sample-talent"
              className="inline-flex items-center gap-2 rounded-full bg-accent-bright px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent"
            >
              {hero.primaryCta}
              <ForwardArrow />
            </Link>
            <a
              href="#live-profile"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:border-white/50"
            >
              {hero.secondaryCta}
            </a>
          </div>

          <p className="mt-5 text-[13px] text-white/45">{hero.micro}</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-card border border-white/10">
            <img
              src={images.hero}
              alt="A technology professional working at a monitor in a sunlit office"
              className="h-[340px] w-full object-cover lg:h-[420px]"
            />
          </div>

          <div className="absolute -left-3 bottom-6 w-[232px] rounded-card border border-line bg-cream p-3 shadow-lg">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
              <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              Expert Evaluated
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-[12px] font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              Background Verified
            </div>
          </div>

          <div className="absolute -right-2 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-forest px-3 py-2 text-[12px] font-semibold text-white">
            <Clock className="h-3.5 w-3.5 text-accent-bright" aria-hidden="true" />
            Your Working Hours
          </div>
        </div>
      </div>
    </section>
  );
}
