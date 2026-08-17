import { useMemo, useState } from 'react';
import { DemoEngineerCard } from '../../components/marketing/DemoEngineerCard';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import {
  DEMO_ENGINEERS,
  DISCIPLINES,
  SORT_OPTIONS,
  START_DATES,
  TIMEZONES,
} from '../../lib/demo-engineers';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function SampleTalentPage() {
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<(typeof DISCIPLINES)[number]>('All Disciplines');
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('All Timezones');
  const [start, setStart] = useState<(typeof START_DATES)[number]>('Any Start date');
  const [maxRate, setMaxRate] = useState(60);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('score');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = DEMO_ENGINEERS.filter((engineer) => {
      const hay = `${engineer.name} ${engineer.role} ${engineer.skills.join(' ')}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (discipline !== 'All Disciplines' && engineer.discipline !== discipline) return false;
      if (timezone !== 'All Timezones' && engineer.timezone !== timezone) return false;
      if (start === 'Available now' && engineer.availabilityWeeks !== 0) return false;
      if (start === 'Within 2 weeks' && engineer.availabilityWeeks > 2) return false;
      if (start === 'Within 4 weeks' && engineer.availabilityWeeks > 4) return false;
      if (engineer.rate > maxRate) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === 'rate-low') return a.rate - b.rate;
      if (sort === 'rate-high') return b.rate - a.rate;
      if (sort === 'availability') return a.availabilityWeeks - b.availabilityWeeks;
      return b.score - a.score;
    });
  }, [query, discipline, timezone, start, maxRate, sort]);

  return (
    <div className="mkt-eng-page">
      <PageMeta title={PAGE_SEO.sampleTalent.title} description={PAGE_SEO.sampleTalent.description} />

      <div className="mkt-white">
        <MktShell className="mkt-eng-hero">
          <div className="mkt-eng-label">Available Engineers</div>
          <h1>Engineers, organised by discipline</h1>
          <p className="mkt-lead">
            Complete profiles in the real format — test results, verification status, rate, start date
            and assigned time zone, exactly as they appear in the platform.
          </p>
          <p className="mkt-lead">
            The engineers below are fictional. They show the structure and depth of the evidence, not
            current capacity.
          </p>
        </MktShell>
      </div>

      <section className="mkt-section mkt-eng-listing">
        <MktShell className="mkt-eng-layout">
          <aside className="mkt-eng-filters">
            <h3>Filters</h3>
            <label>
              Search
              <input
                type="search"
                placeholder="Name, role or skill"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              Discipline
              <select value={discipline} onChange={(e) => setDiscipline(e.target.value as typeof discipline)}>
                {DISCIPLINES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Time zone
              <select value={timezone} onChange={(e) => setTimezone(e.target.value as typeof timezone)}>
                {TIMEZONES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start date
              <select value={start} onChange={(e) => setStart(e.target.value as typeof start)}>
                {START_DATES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Max rate — ${maxRate}/hour
              <input
                type="range"
                min={20}
                max={60}
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
              />
            </label>
            <p className="mkt-eng-match">
              <strong>{filtered.length}</strong> engineer{filtered.length === 1 ? '' : 's'} match
            </p>
          </aside>

          <div>
            <div className="mkt-eng-toolbar">
              <span>
                Showing {filtered.length} of {DEMO_ENGINEERS.length} engineers
              </span>
              <label>
                Sort by
                <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                  {SORT_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mkt-eng-grid">
              {filtered.map((engineer) => (
                <DemoEngineerCard key={engineer.id} engineer={engineer} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="mkt-eng-empty">
                <p className="mkt-eng-empty-title">No engineers match these filters</p>
                <p className="mkt-eng-empty-body">
                  Widen the rate, the time zone or the start date to see more profiles.
                </p>
              </div>
            )}
          </div>
        </MktShell>
      </section>
    </div>
  );
}
