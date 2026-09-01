import { publicJobs } from '@bestal/mock-data';
import type { PublicJob } from '@bestal/mock-data';
import { useMemo, useState } from 'react';
import { CareersJobDialog } from '../../components/marketing/CareersJobDialog';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { formatCareersJobLocation } from '../../lib/careers-job-descriptions';
import { PAGE_SEO } from '../../lib/marketing-seo';

function getPublicJobLevelLabel(title: string): string {
  const normalized = title.toLowerCase();
  if (/\b(principal|staff|architect)\b/.test(normalized)) return 'SENIOR LEVEL';
  if (/\blead\b/.test(normalized)) return 'MID-SENIOR LEVEL';
  if (/\bsenior\b/.test(normalized)) return 'SENIOR LEVEL';
  return 'MID LEVEL';
}

export function CareersPage() {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);

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
                    <button
                      type="button"
                      className="mkt-careers-job-apply"
                      onClick={() => setSelectedJob(job)}
                    >
                      Apply Now
                    </button>
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

      <CareersJobDialog job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
