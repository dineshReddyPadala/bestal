import { cn } from '@bestal/shared-utils';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { usePublicCareerOpenings } from '../../hooks/api/useCareerOpenings';
import { useCarouselVisibleCount } from '../../hooks/useCarouselVisibleCount';
import { useMarketingInView } from '../../hooks/useMarketingReveal';
import { useAutoCycleIndex } from '../../hooks/useMarketingTouchViewport';
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
import { CAREERS_IMAGES, CAREERS_V2_PAGE, openCareersEmail } from '../../lib/careers-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

const EMPTY_FILTERS: CareersFilterState = {
  jobName: '',
  disciplines: [],
  experienceLevels: [],
};

const PATHS_CAROUSEL_INTERVAL_MS = 4500;
const CAREERS_HIGHLIGHT_INTERVAL_MS = 1200;

type CareersEmptyOpeningsCopy = (typeof CAREERS_V2_PAGE)['emptyOpenings'];

function CareersNoOpeningsEmpty({ copy }: { copy: CareersEmptyOpeningsCopy }) {
  return (
    <div className="mkt-careers-v2-openings-empty">
      <div className="mkt-careers-v2-openings-empty-copy">
        {/* <div className="mkt-careers-v2-openings-empty-label">
          <span>{copy.label}</span>
          <span className="mkt-careers-v2-openings-empty-rule" aria-hidden="true" />
        </div> */}
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="mkt-careers-v2-openings-empty-actions">
          <a href={copy.primaryHref} className="mkt-btn mkt-btn-primary">
            {copy.primaryCta}
            <ForwardArrow />
          </a>
          <button type="button" className="mkt-btn mkt-btn-secondary">
            {copy.secondaryCta}
          </button>
        </div>
      </div>
      <div className="mkt-careers-v2-openings-empty-visual">
        <div className="mkt-careers-v2-openings-empty-bg" aria-hidden="true">
          <span className="mkt-careers-v2-openings-empty-shape is-one" />
          <span className="mkt-careers-v2-openings-empty-shape is-two" />
        </div>
        <div className="mkt-careers-v2-openings-empty-photo">
          <img
            src={copy.image}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = CAREERS_IMAGES.join;
            }}
          />
        </div>
        <div className="mkt-careers-v2-openings-empty-card">
          <span className="mkt-careers-v2-openings-empty-card-icon" aria-hidden="true">
            <Users strokeWidth={2} />
          </span>
          <p>{copy.cardText}</p>
        </div>
      </div>
    </div>
  );
}

function CareersOpeningsSection() {
  const [filters, setFilters] = useState<CareersFilterState>(EMPTY_FILTERS);
  const { data: openings = [], isLoading, isError } = usePublicCareerOpenings();

  const disciplines = useMemo(() => getCareersDisciplines(openings), [openings]);
  const experienceLevels = useMemo(() => getCareersExperienceLevels(openings), [openings]);
  const disciplineCounts = useMemo(() => countCareersJobsByDiscipline(openings), [openings]);
  const experienceCounts = useMemo(() => countCareersJobsByExperienceLevel(openings), [openings]);
  const filteredOpenings = useMemo(
    () => filterCareersJobs(openings, filters),
    [filters, openings],
  );

  const hasActiveFilters =
    filters.jobName.trim().length > 0 ||
    filters.disciplines.length > 0 ||
    filters.experienceLevels.length > 0;

  const showEmptyOpeningsState =
    !isLoading && !hasActiveFilters && (isError || openings.length === 0);

  return (
    <section id="openings" className="mkt-careers-v2-openings">
      <MktShell>
        {isLoading && !hasActiveFilters ? (
          <div className="mkt-careers-v2-openings-loading" aria-live="polite">
            Loading openings…
          </div>
        ) : showEmptyOpeningsState ? (
          <CareersNoOpeningsEmpty copy={CAREERS_V2_PAGE.emptyOpenings} />
        ) : (
          <>
            <h2 className="mkt-careers-v2-openings-title">Current Openings</h2>

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
            {isLoading ? (
              <p className="mkt-careers-openings-empty">Loading openings…</p>
            ) : isError ? (
              <p className="mkt-careers-openings-empty">Unable to load openings. Please try again.</p>
            ) : (
              <>
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
                  <p className="mkt-careers-openings-empty">
                    {hasActiveFilters
                      ? 'No openings match your filters.'
                      : 'There are no current openings. Check back soon.'}
                  </p>
                ) : null}
              </>
            )}
          </div>
            </div>
          </>
        )}
      </MktShell>
    </section>
  );
}

export function CareersPage() {
  const copy = CAREERS_V2_PAGE;
  const pathCards = copy.paths.cards;
  const [pathIndex, setPathIndex] = useState(0);
  const [isPathsPaused, setIsPathsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const pathVisibleCount = useCarouselVisibleCount({ desktop: 4, tablet: 2, mobile: 1 });
  const maxPathIndex = Math.max(0, pathCards.length - pathVisibleCount);
  const whySection = useMarketingInView<HTMLElement>(0.08, true);
  const journeySection = useMarketingInView<HTMLElement>(0.08, true);
  const valuesSection = useMarketingInView<HTMLElement>(0.08, true);
  const whyHighlightActive = whySection.inView && !prefersReducedMotion;
  const journeyHighlightActive = journeySection.inView && !prefersReducedMotion;
  const valuesHighlightActive = valuesSection.inView && !prefersReducedMotion;
  const activeWhyIndex = useAutoCycleIndex(
    copy.why.items.length,
    CAREERS_HIGHLIGHT_INTERVAL_MS,
    whyHighlightActive,
  );
  const activeJourneyIndex = useAutoCycleIndex(
    copy.journey.steps.length,
    CAREERS_HIGHLIGHT_INTERVAL_MS,
    journeyHighlightActive,
  );
  const activeValuesIndex = useAutoCycleIndex(
    copy.values.items.length,
    CAREERS_HIGHLIGHT_INTERVAL_MS,
    valuesHighlightActive,
  );
  const journeyLineProgress = useMemo(() => {
    const count = copy.journey.steps.length;
    if (!journeyHighlightActive || count <= 1) return 0;
    return (activeJourneyIndex / (count - 1)) * 100;
  }, [journeyHighlightActive, activeJourneyIndex, copy.journey.steps.length]);

  useEffect(() => {
    setPathIndex((current) => Math.min(current, maxPathIndex));
  }, [maxPathIndex]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (isPathsPaused || maxPathIndex <= 0) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const timerId = window.setInterval(() => {
      setPathIndex((current) => (current >= maxPathIndex ? 0 : current + 1));
    }, PATHS_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [isPathsPaused, maxPathIndex]);

  return (
    <div className="mkt-careers-v2-page">
      <PageMeta title={PAGE_SEO.careers.title} description={PAGE_SEO.careers.description} />

      <section className="mkt-careers-v2-hero">
        <MktShell className="mkt-careers-v2-hero-grid">
          <div className="mkt-careers-v2-hero-copy">
            {/* <span className="mkt-careers-v2-hero-label">{copy.hero.label}</span> */}
            <h1>
              {copy.hero.titleLine1}
              <br />
              {copy.hero.titleLine2}
            </h1>
            <p className="mkt-careers-v2-hero-lead">{copy.hero.lead}</p>
            <p className="mkt-careers-v2-hero-body">{copy.hero.body}</p>
            <a href="#openings" className="mkt-btn mkt-btn-primary">
              {copy.hero.primaryCta}
              <ForwardArrow />
            </a>
          </div>
          <div className="mkt-careers-v2-hero-visual">
            <img src={copy.hero.image} alt="" loading="eager" />
          </div>
        </MktShell>
      </section>

      <section className="mkt-careers-v2-vision">
        <MktShell>
          <div className="mkt-careers-v2-vision-photo">
            <img src={copy.vision.image} alt="" loading="lazy" />
          </div>
          <div className="mkt-careers-v2-vision-copy">
            <p className="mkt-careers-v2-vision-lead">{copy.vision.lead}</p>
            <p className="mkt-careers-v2-vision-body">{copy.vision.body}</p>
          </div>
        </MktShell>
      </section>

      <section ref={whySection.ref} className="mkt-careers-v2-why">
        <MktShell>
          <div className="mkt-careers-v2-why-layout">
            <h2 className="mkt-careers-v2-why-title">{copy.why.title}</h2>
            <div className="mkt-careers-v2-why-left">
              <p className="mkt-careers-v2-why-sub">{copy.why.subtitle}</p>
              <div className="mkt-careers-v2-why-photo">
                <img src={copy.why.image} alt="" loading="lazy" />
              </div>
            </div>
            <ol className="mkt-careers-v2-why-list">
              {copy.why.items.map((item, index) => {
                const isActive = whyHighlightActive && index === activeWhyIndex;

                return (
                  <li
                    key={item.title}
                    className={cn(isActive && 'is-active')}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="mkt-careers-v2-why-num">{item.num}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </MktShell>
      </section>

      <section
        id="career-paths"
        className="mkt-careers-v2-paths"
        onMouseEnter={() => setIsPathsPaused(true)}
        onMouseLeave={() => setIsPathsPaused(false)}
        onFocusCapture={() => setIsPathsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPathsPaused(false);
          }
        }}
      >
        <MktShell>
          <div className="mkt-careers-v2-paths-hd">
            <div>
              <h2>{copy.paths.title}</h2>
              <p>{copy.paths.intro}</p>
            </div>
            <div className="mkt-careers-v2-paths-controls">
              <button
                type="button"
                className="mkt-careers-v2-paths-arrow"
                aria-label="Previous career paths"
                disabled={pathIndex === 0}
                onClick={() => setPathIndex((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="mkt-careers-v2-paths-arrow"
                aria-label="Next career paths"
                disabled={pathIndex >= maxPathIndex}
                onClick={() => setPathIndex((current) => Math.min(maxPathIndex, current + 1))}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mkt-careers-v2-paths-track-wrap">
            <div
              className="mkt-careers-v2-paths-track"
              style={{
                transform: `translateX(calc(${-pathIndex} * (100% / ${pathVisibleCount})))`,
              }}
            >
              {pathCards.map((card) => (
                <article key={card.title} className="mkt-careers-v2-path-card">
                  <div className="mkt-careers-v2-path-card-photo">
                    <img src={card.image} alt="" loading="lazy" decoding="async" />
                  </div>
                  <h3 className="mkt-careers-v2-path-card-hd">
                    <span>{card.title}</span>
                    <ForwardArrow className="mkt-careers-v2-path-card-arrow" />
                  </h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <section ref={journeySection.ref} className="mkt-careers-v2-journey">
        <MktShell>
          <h2>{copy.journey.title}</h2>
          <ol className="mkt-careers-v2-journey-list">
            <span
              className="mkt-careers-v2-journey-line-fill"
              aria-hidden="true"
              style={{ height: `${journeyLineProgress}%` }}
            />
            {copy.journey.steps.map((step, index) => {
              const isActive = journeyHighlightActive && index === activeJourneyIndex;

              return (
                <li
                  key={step.title}
                  className={cn(isActive && 'is-active')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="mkt-careers-v2-journey-marker" aria-hidden="true" />
                  <div className="mkt-careers-v2-journey-label">{step.title}</div>
                  <p className="mkt-careers-v2-journey-body">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </MktShell>
      </section>

      {copy.regions.map((region, index) => (
        <section
          key={region.title}
          className={cn('mkt-careers-v2-region', index % 2 === 1 && 'is-reverse')}
        >
          <MktShell>
            <div className="mkt-careers-v2-region-layout">
              <div className="mkt-careers-v2-region-photo">
                <img src={region.image} alt="" loading="lazy" />
              </div>
              <div className="mkt-careers-v2-region-copy">
                <h2 className={cn('mkt-careers-v2-region-title', region.accent === 'slate' && 'is-slate')}>
                  {region.title}
                  <span className="mkt-careers-v2-region-rule" aria-hidden="true" />
                </h2>
                {region.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </MktShell>
        </section>
      ))}

      <section ref={valuesSection.ref} className="mkt-careers-v2-values">
        <MktShell>
          <div className="mkt-careers-v2-values-layout">
            <div className="mkt-careers-v2-values-left">
              <h2>{copy.values.title}</h2>
              <p>{copy.values.intro}</p>
              <div className="mkt-careers-v2-values-photo">
                <img src={copy.values.image} alt="" loading="lazy" />
              </div>
            </div>
            <ol className="mkt-careers-v2-values-list">
              {copy.values.items.map((item, index) => {
                const isActive = valuesHighlightActive && index === activeValuesIndex;

                return (
                  <li
                    key={item}
                    className={cn(isActive && 'is-active')}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="mkt-careers-v2-values-num">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{item}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </MktShell>
      </section>

      <section className="mkt-careers-v2-join">
        <MktShell>
          <div className="mkt-careers-v2-join-layout">
            <div className="mkt-careers-v2-join-copy">
              <h2>{copy.join.title}</h2>
              <p className="mkt-careers-v2-join-sub">{copy.join.subtitle}</p>
              <p>{copy.join.body}</p>
              <button type="button" className="mkt-btn mkt-btn-primary" onClick={openCareersEmail}>
                {copy.join.primaryCta}
                <ForwardArrow />
              </button>
            </div>
            <div className="mkt-careers-v2-join-photo">
              <img src={copy.join.image} alt="" loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="mkt-careers-v2-process">
            <h2>{copy.process.title}</h2>
            <div className="mkt-careers-v2-process-copy">
              {copy.process.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </MktShell>
      </section>

      <CareersOpeningsSection />

      <section className="mkt-careers-v2-closing">
        <div className="mkt-careers-v2-closing-bg" aria-hidden="true">
          <img src={copy.closing.image} alt="" />
          <span className="mkt-careers-v2-closing-overlay" />
        </div>
        <MktShell>
          <div className="mkt-careers-v2-closing-grid">
            <div className="mkt-careers-v2-closing-copy">
              <h2>{copy.closing.title}</h2>
              <p>{copy.closing.body}</p>
            </div>
            <div className="mkt-careers-v2-closing-aside">
              <h3>{copy.closing.asideTitle}</h3>
              <div className="mkt-careers-v2-closing-actions">
                <a href="#openings" className="mkt-btn mkt-btn-primary">
                  {copy.closing.cta}
                  <ForwardArrow />
                </a>
                <p className="mkt-careers-v2-closing-secondary">
                  {copy.closing.secondaryPrompt}{' '}
                  <button type="button" onClick={openCareersEmail}>
                    {copy.closing.secondaryCta}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
