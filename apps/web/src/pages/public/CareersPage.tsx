import { useMemo, useState } from 'react';
import { CareersJobDialog } from '../../components/marketing/CareersJobDialog';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { usePublicCareerOpenings } from '../../hooks/api/useCareerOpenings';
import type { CareerOpeningPublic } from '../../lib/api/career-openings';
import { formatCareersJobLocation } from '../../lib/careers-job-descriptions';
import { PAGE_SEO } from '../../lib/marketing-seo';

function getPublicJobLevelLabel(jobLevel: string, title: string): string {
  const source = `${jobLevel} ${title}`.toLowerCase();
  if (/\b(principal|staff|architect)\b/.test(source)) return 'SENIOR LEVEL';
  if (/\blead\b/.test(source)) return 'MID-SENIOR LEVEL';
  if (/\bsenior\b/.test(source)) return 'SENIOR LEVEL';
  return jobLevel.trim() ? jobLevel.toUpperCase() : 'MID LEVEL';
}

export function CareersPage() {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<CareerOpeningPublic | null>(null);
  const { data: openings = [], isLoading, isError } = usePublicCareerOpenings();

  const filteredOpenings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return openings;
    return openings.filter((job) => {
      const level = getPublicJobLevelLabel(job.jobLevel, job.title);
      return (
        job.title.toLowerCase().includes(query) ||
        job.skillCommunity.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.jobLevel.toLowerCase().includes(query) ||
        level.toLowerCase().includes(query)
      );
    });
  }, [openings, search]);

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
          {isLoading ? (
            <p className="mkt-careers-openings-empty">Loading openings…</p>
          ) : isError ? (
            <p className="mkt-careers-openings-empty">Unable to load openings. Please try again.</p>
          ) : (
            <>
              <ul className="mkt-careers-jobs-grid">
                {filteredOpenings.map((job) => (
                  <li key={job.id}>
                    <article className="mkt-careers-job-card">
                      <span className="mkt-careers-job-level">
                        {getPublicJobLevelLabel(job.jobLevel, job.title)}
                      </span>
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
                <p className="mkt-careers-openings-empty">
                  {search.trim()
                    ? 'No openings match your search.'
                    : 'There are no current openings. Check back soon.'}
                </p>
              ) : null}
            </>
          )}
        </MktShell>
      </section>

      <CareersJobDialog job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
