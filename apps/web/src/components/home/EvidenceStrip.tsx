import {
  BadgeCheck,
  ShieldCheck,
  Clock,
  Tag,
  CalendarCheck,
  PlayCircle,
} from 'lucide-react';
import { evidence } from '../../data/homeCopy';

const icons = [BadgeCheck, ShieldCheck, Clock, Tag, CalendarCheck, PlayCircle];

export function EvidenceStrip() {
  return (
    <section id="evidence" className="bg-cream py-16 md:py-20">
      <div className="section-shell">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {evidence.map((point, i) => {
            const Icon = icons[i]!;
            return (
              <li
                key={point.title}
                className="flex h-full flex-col rounded-card border border-line bg-white p-6 md:p-7"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep">
                  <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-semibold text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{point.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
