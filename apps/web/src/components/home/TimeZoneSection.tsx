import { Link } from 'react-router-dom';
import { timeZone, timeZoneDraft } from '../../data/homeCopy';
import { SectionHeading } from './SectionHeading';
import { Draft } from './Draft';

export function TimeZoneSection() {
  return (
    <section id="time-zone" className="bg-forest py-16 md:py-24">
      <div className="section-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Time-zone overlap" title={timeZone.h2} tone="dark" />
          <Link
            to="/sample-talent"
            className="inline-flex shrink-0 items-center rounded-full border border-white/25 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:border-white/50 md:self-end"
          >
            {timeZone.button}
          </Link>
        </div>

        <Draft className="mt-6 max-w-2xl">
          <p className="text-[15px] leading-relaxed text-white/65">{timeZoneDraft.body}</p>
        </Draft>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {timeZone.blocks.map((block, i) => (
            <li
              key={block.title}
              className="flex h-full flex-col rounded-card border border-white/10 bg-moss p-6 md:p-7"
            >
              <span className="font-display text-[13px] font-semibold text-accent-bright">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-[17px] font-semibold leading-snug text-white">
                {block.title}
              </h3>
              <Draft className="mt-3">
                <p className="text-[14px] leading-relaxed text-white/65">
                  {timeZoneDraft.blocks[block.title]}
                </p>
              </Draft>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
