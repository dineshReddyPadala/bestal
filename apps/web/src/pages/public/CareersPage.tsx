import { publicJobs } from '@bestal/mock-data';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import {
  countCareersJobsByDiscipline,
  countCareersJobsByExperienceLevel,
  filterCareersJobs,
  getCareersDisciplines,
  getCareersExperienceLevels,
  getCareersJobExperienceLevel,
  toggleFilterValue,
  type CareersFilterState,
} from '../../lib/careers-filters';
import { formatCareersJobLocation } from '../../lib/careers-job-descriptions';
import { PAGE_SEO } from '../../lib/marketing-seo';

const EMPTY_FILTERS: CareersFilterState = {
  jobName: '',
  disciplines: [],
  experienceLevels: [],
};

export function CareersPage() {
  const [filters, setFilters] = useState<CareersFilterState>(EMPTY_FILTERS);

  const disciplines = useMemo(() => getCareersDisciplines(), []);
  const experienceLevels = useMemo(() => getCareersExperienceLevels(), []);

  const disciplineCounts = useMemo(() => countCareersJobsByDiscipline(publicJobs), []);
  const experienceCounts = useMemo(() => countCareersJobsByExperienceLevel(publicJobs), []);

  const filteredOpenings = useMemo(
    () => filterCareersJobs(publicJobs, filters),
    [filters],
  );

  const hasActiveFilters =
    filters.jobName.trim().length > 0 ||
    filters.disciplines.length > 0 ||
    filters.experienceLevels.length > 0;

  return (
    <div className="mkt-careers-page">
      <PageMeta title={PAGE_SEO.careers.title} description={PAGE_SEO.careers.description} />

      <section className="mkt-careers-openings">
        <MktShell>
          <h2 className="mkt-careers-section-title">CURRENT OPENINGS</h2>

          <div className="mkt-careers-openings-layout">
            <aside className="mkt-careers-filters" aria-label="Filter jobs">
              <h3 className="mkt-careers-filters-title">All Filters</h3>

              <div className="mkt-careers-filter-group">
                <h4 className="mkt-careers-filter-label">Filter by</h4>

                <label className="mkt-careers-filter-field-label" htmlFor="careers-job-name">
                  Search by Job name
                </label>
                <input
                  id="careers-job-name"
                  type="search"
                  className="mkt-careers-openings-search mkt-careers-filter-search"
                  placeholder="Search by job title"
                  value={filters.jobName}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, jobName: event.target.value }))
                  }
                  enterKeyHint="search"
                  autoComplete="off"
                />
              </div>

              <div className="mkt-careers-filter-group">
                <h4 className="mkt-careers-filter-label">Disciplines</h4>
                <ul className="mkt-careers-filter-options">
                  {disciplines.map((discipline) => {
                    const checked = filters.disciplines.includes(discipline);
                    return (
                      <li key={discipline}>
                        <label className="mkt-careers-filter-option">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setFilters((current) => ({
                                ...current,
                                disciplines: toggleFilterValue(current.disciplines, discipline),
                              }))
                            }
                          />
                          <span>{discipline}</span>
                          <span className="mkt-careers-filter-count">
                            ({disciplineCounts[discipline] ?? 0})
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mkt-careers-filter-group">
                <h4 className="mkt-careers-filter-label">Experience Level</h4>
                <ul className="mkt-careers-filter-options">
                  {experienceLevels.map((level) => {
                    const checked = filters.experienceLevels.includes(level);
                    return (
                      <li key={level}>
                        <label className="mkt-careers-filter-option">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setFilters((current) => ({
                                ...current,
                                experienceLevels: toggleFilterValue(current.experienceLevels, level),
                              }))
                            }
                          />
                          <span>{level}</span>
                          <span className="mkt-careers-filter-count">
                            ({experienceCounts[level] ?? 0})
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  className="mkt-careers-openings-clear mkt-careers-filters-clear"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                >
                  Clear all filters
                </button>
              ) : null}
            </aside>

            <div className="mkt-careers-openings-results">
              <p className="mkt-careers-openings-count">
                Showing {filteredOpenings.length}{' '}
                {filteredOpenings.length === 1 ? 'opening' : 'openings'}
              </p>

              <ul className="mkt-careers-jobs-list">
                {filteredOpenings.map((job) => (
                  <li key={job.id}>
                    <Link to={`/careers/${job.slug}`} className="mkt-careers-job-row">
                      <div className="mkt-careers-job-row-main">
                        <span className="mkt-careers-job-level">
                          {getCareersJobExperienceLevel(job).toUpperCase()}
                        </span>
                        <h3>{job.title}</h3>
                        <p className="mkt-careers-job-discipline">{job.skillCommunity}</p>
                        <p className="mkt-careers-job-location">{formatCareersJobLocation(job)}</p>
                      </div>
                      <ChevronRight
                        className="mkt-careers-job-row-chevron"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {filteredOpenings.length === 0 ? (
                <p className="mkt-careers-openings-empty">No openings match your filters.</p>
              ) : null}
            </div>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
