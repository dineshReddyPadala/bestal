import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { skillCommunities, skillCommunitiesDraft } from '../../data/homeCopy';
import { SectionHeading } from './SectionHeading';
import { Draft } from './Draft';

export function SkillCommunities() {
  return (
    <section id="skill-communities" className="bg-cream py-16 md:py-24">
      <div className="section-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Skill Communities"
            title={skillCommunities.h2}
            intro={skillCommunities.intro}
          />
          <Link
            to="/communities"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-bright md:self-end"
          >
            {skillCommunities.button}
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillCommunities.items.map((item, i) => (
            <li
              key={item.name}
              className={`flex h-full flex-col rounded-card border border-line bg-white p-6 ${
                i === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[16px] font-semibold text-ink">{item.name}</h3>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/35" aria-hidden="true" />
              </div>
              <Draft className="mt-3">
                <p className="text-[14px] leading-relaxed text-ink/65">
                  {skillCommunitiesDraft[item.name]}
                </p>
              </Draft>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
