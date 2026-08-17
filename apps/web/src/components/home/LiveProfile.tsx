import { BadgeCheck, ShieldCheck, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { liveProfile, images } from '../../data/homeCopy';

export function LiveProfile() {
  return (
    <section id="live-profile" className="bg-cream py-16 md:py-24">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
        <div>
          <p className="mb-3 text-[13px] font-medium text-accent-bright">Live profile</p>
          <h2 className="font-display text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[38px]">
            {liveProfile.h2}
          </h2>
          <p className="mt-4 text-[16px] font-medium text-ink/70">{liveProfile.sub}</p>
          <Link
            to="/sample-talent"
            className="mt-8 inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-bright"
          >
            {liveProfile.button}
          </Link>
        </div>

        <div>
          <div className="rounded-card border border-line bg-white p-6">
            <div className="flex items-start gap-4">
              <img
                src={images.avatar}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-[17px] font-semibold text-ink">Sarah Johnson</h3>
                  <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                </div>
                <p className="text-[13px] text-ink/60">Senior Data Engineer · Data &amp; AI</p>
                <div className="mt-1.5 flex items-center gap-1 text-[12px] text-ink/60">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
                  <span className="font-semibold text-ink">4.6</span>
                  <span>evaluation score</span>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line">
              <div className="bg-cream p-4">
                <dt className="text-[12px] text-ink/55">Transparent Rate</dt>
                <dd className="mt-1 font-display text-[20px] font-semibold text-ink">
                  $38<span className="text-[13px] font-medium text-ink/55">/hour</span>
                </dd>
              </div>
              <div className="bg-cream p-4">
                <dt className="text-[12px] text-ink/55">Availability, Stated</dt>
                <dd className="mt-1 font-display text-[15px] font-semibold text-ink">Immediate</dd>
              </div>
              <div className="bg-cream p-4">
                <dt className="text-[12px] text-ink/55">Your Working Hours</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-display text-[15px] font-semibold text-ink">
                  <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                  6 hrs · US Eastern
                </dd>
              </div>
              <div className="bg-cream p-4">
                <dt className="text-[12px] text-ink/55">Background Verified</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-display text-[15px] font-semibold text-ink">
                  <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                  Cleared
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[12px] text-ink/55">
                <span>Expert Evaluated — scorecard</span>
                <span className="font-semibold text-ink">92 / 100</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
                <div className="h-full w-[92%] rounded-full bg-accent" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {['Python', 'Snowflake', 'dbt', 'Airflow'].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-cream px-3 py-1 text-[12px] font-medium text-ink/70"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to="/sample-talent"
                className="flex-1 rounded-full bg-accent px-4 py-2.5 text-center text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-bright"
              >
                View Profile
              </Link>
              <Link
                to="/try-for-a-week"
                className="flex-1 rounded-full border border-line px-4 py-2.5 text-center text-[13px] font-semibold text-ink transition-colors duration-150 ease-out hover:border-ink/40"
              >
                One-Week Proof
              </Link>
            </div>
          </div>

          <p className="mt-3 text-[12px] italic text-ink/45">{liveProfile.caption}</p>
        </div>
      </div>
    </section>
  );
}
