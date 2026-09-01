import {
  Award,
  Flag,
  Heart,
  HeartHandshake,
  Lightbulb,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { publicJobs } from '@bestal/mock-data';
import { useMemo, useState } from 'react';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import {
  CAREERS_CORE_VALUES,
  CAREERS_EQUAL,
  CAREERS_HERO,
  CAREERS_WHY_TABS,
  CAREERS_APPLY_MAILTO,
  openCareersEmail,
  type CareersWhyTabId,
} from '../../lib/careers-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

const VALUE_ICONS: Record<(typeof CAREERS_CORE_VALUES)[number]['id'], LucideIcon> = {
  innovation: Lightbulb,
  excellence: Award,
  integrity: HeartHandshake,
  empathy: Heart,
  inclusivity: Users,
  expectancy: Flag,
};

function getPublicJobLevelLabel(title: string): string {
  const normalized = title.toLowerCase();
  if (/\b(principal|staff|architect)\b/.test(normalized)) return 'SENIOR LEVEL';
  if (/\blead\b/.test(normalized)) return 'MID-SENIOR LEVEL';
  if (/\bsenior\b/.test(normalized)) return 'SENIOR LEVEL';
  return 'MID LEVEL';
}

function formatCareersJobLocation(job: (typeof publicJobs)[number]): string {
  return job.remote ? `${job.location} · Remote` : job.location;
}

export function CareersPage() {
  const [activeTab, setActiveTab] = useState<CareersWhyTabId>('impact');
  const [search, setSearch] = useState('');

  const selectedTab = CAREERS_WHY_TABS.find((tab) => tab.id === activeTab) ?? CAREERS_WHY_TABS[0];

  const filteredOpenings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return publicJobs;
    return publicJobs.filter((job) => {
      const level = getPublicJobLevelLabel(job.title);
      return (
        job.title.toLowerCase().includes(query) ||
        job.skillCommunity.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.engagementType.toLowerCase().includes(query) ||
        level.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div className="mkt-careers-page">
      <PageMeta title={PAGE_SEO.careers.title} description={PAGE_SEO.careers.description} />

      <section className="mkt-careers-hero">
        <MktShell className="mkt-careers-hero-inner">
          <span className="mkt-careers-hero-label">{CAREERS_HERO.label}</span>
          <h1>{CAREERS_HERO.title}</h1>
          <p>{CAREERS_HERO.body}</p>
        </MktShell>
      </section>

      <section className="mkt-careers-why">
        <MktShell>
          <div className="mkt-careers-why-hd">
            <h2>Why BesTal</h2>
            <div className="mkt-careers-tabs" role="tablist" aria-label="Why BesTal">
              {CAREERS_WHY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`mkt-careers-tab${activeTab === tab.id ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mkt-careers-why-body">
            <div className="mkt-careers-why-visual">
              <img
                key={selectedTab.id}
                src={selectedTab.image}
                alt={selectedTab.imageAlt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mkt-careers-why-copy" role="tabpanel">
              <h3>{selectedTab.title}</h3>
              <p>{selectedTab.body}</p>
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-careers-values">
        <MktShell>
          <h2 className="mkt-careers-section-title">Our Core Values</h2>
          <ul className="mkt-careers-values-grid">
            {CAREERS_CORE_VALUES.map((value) => {
              const Icon = VALUE_ICONS[value.id];
              return (
                <li key={value.id}>
                  <article className="mkt-careers-value-card">
                    <span className="mkt-careers-value-icon" aria-hidden="true">
                      <Icon strokeWidth={1.75} />
                    </span>
                    <h3>{value.title}</h3>
                    <p>{value.body}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        </MktShell>
      </section>

      <section className="mkt-careers-equal">
        <MktShell>
          <h2 className="mkt-careers-equal-title">{CAREERS_EQUAL.title}</h2>
          <p className="mkt-careers-equal-intro">{CAREERS_EQUAL.intro}</p>
          <div className="mkt-careers-equal-grid">
            <div className="mkt-careers-equal-visual">
              <img
                src={CAREERS_EQUAL.image}
                alt={CAREERS_EQUAL.imageAlt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mkt-careers-equal-list">
              {CAREERS_EQUAL.items.map((item) => (
                <article key={item.title} className="mkt-careers-equal-item">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <section className="mkt-careers-openings">
        <MktShell>
          <h2 className="mkt-careers-section-title">CURRENT OPENINGS</h2>
          <div className="mkt-careers-openings-filter">
            <span className="mkt-careers-openings-filter-label">Filter by</span>
            <input
              type="search"
              className="mkt-careers-openings-search"
              placeholder="Search jobs by skill or keyword"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              enterKeyHint="search"
              autoComplete="off"
            />
            <button
              type="button"
              className="mkt-careers-openings-clear"
              onClick={() => setSearch('')}
            >
              Clear
            </button>
          </div>
          <ul className="mkt-careers-jobs-grid">
            {filteredOpenings.map((job) => (
              <li key={job.id}>
                <article className="mkt-careers-job-card">
                  <span className="mkt-careers-job-level">{getPublicJobLevelLabel(job.title)}</span>
                  <h3>{job.title}</h3>
                  <div className="mkt-careers-job-foot">
                    <span className="mkt-careers-job-location">{formatCareersJobLocation(job)}</span>
                    <a
                      href={CAREERS_APPLY_MAILTO}
                      className="mkt-careers-job-apply"
                      onClick={(event) => {
                        event.preventDefault();
                        openCareersEmail();
                      }}
                    >
                      Apply Now
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {filteredOpenings.length === 0 ? (
            <p className="mkt-careers-openings-empty">No openings match your search.</p>
          ) : null}
        </MktShell>
      </section>
    </div>
  );
}
