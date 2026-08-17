import { Lock, FilePen, Gauge, RefreshCw } from 'lucide-react';
import { enterpriseDraft } from '../../data/homeCopy';
import { SectionHeading } from './SectionHeading';
import { Draft } from './Draft';

const icons = [Lock, FilePen, Gauge, RefreshCw];

export function EnterpriseAssurance() {
  return (
    <section id="enterprise" className="bg-cream-deep py-16 md:py-24">
      <div className="section-shell">
        <Draft label="Draft section — pending approval">
          <SectionHeading
            eyebrow={enterpriseDraft.eyebrow}
            title={enterpriseDraft.h2}
            intro={enterpriseDraft.intro}
          />

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {enterpriseDraft.items.map((item, i) => {
              const Icon = icons[i]!;
              return (
                <li
                  key={item.title}
                  className="flex h-full flex-col rounded-card border border-line bg-white p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep">
                    <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-[16px] font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{item.body}</p>
                </li>
              );
            })}
          </ul>
        </Draft>
      </div>
    </section>
  );
}
