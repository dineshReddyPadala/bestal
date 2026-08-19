import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DemoEngineerCard } from '../../components/marketing/DemoEngineerCard';
import { MktSelect, mktOptionsFromStrings } from '../../components/marketing/MktSelect';
import { MktShell } from '../../components/marketing/MktShell';
import { SampleTalentCompareView } from '../../components/marketing/SampleTalentCompareView';
import { SampleTalentCommunitiesHero } from '../../components/marketing/SampleTalentCommunitiesHero';
import { SampleTalentCommunityCard } from '../../components/marketing/SampleTalentCommunityCard';
import { SampleTalentSelectionBar } from '../../components/marketing/SampleTalentSelectionBar';
import { SampleTalentShortlistView } from '../../components/marketing/SampleTalentShortlistView';
import { TalentUnlockDialog } from '../../components/marketing/TalentUnlockPage';
import { PageMeta } from '../../components/PageMeta';
import { ToastHost } from '../../components/ui/ToastHost';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { useAuth } from '../../contexts/AuthContext';
import { MAX_COMPARE, useSampleTalentShortlist } from '../../hooks/useSampleTalentShortlist';
import { useDemoToast } from '../../lib/use-demo-toast';
import { communityToDiscipline } from '../../lib/community-discipline';
import {
  DEMO_ENGINEERS,
  DISCIPLINES,
  SORT_OPTIONS,
  START_DATES,
  TIMEZONES,
} from '../../lib/demo-engineers';
import { COMMUNITY_DETAILS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

type Discipline = (typeof DISCIPLINES)[number];
type ListingView = 'browse' | 'shortlist' | 'compare';

function isListingView(value: string | null): value is ListingView {
  return value === 'browse' || value === 'shortlist' || value === 'compare';
}
function isDiscipline(value: string | null): value is Discipline {
  return Boolean(value && (DISCIPLINES as readonly string[]).includes(value));
}

type SampleTalentBrowsePageProps = {
  onDisciplineClick: (name: string) => void;
};

function SampleTalentBrowsePage({ onDisciplineClick }: SampleTalentBrowsePageProps) {
  return (
    <>
      <section className="mkt-white mkt-section mkt-st-comm-hero">
        <MktShell className="mkt-g2">
          <div className="mkt-st-comm-copy">
            <div className="mkt-st-comm-label">Engineering Communities</div>
            <h1 className="mkt-st-comm-title">
              Engineers, organised by{' '}
              <span className="mkt-st-comm-highlight">
                discipline
               
              </span>
            </h1>
            <p className="mkt-st-comm-lead howitworks-body-style">
            Complete profiles in the real format — test results, verification status, rate, start date and assigned time zone, exactly as they appear in the platform.

            </p>
            <p className="mkt-st-comm-lead howitworks-body-style">The engineers below are fictional. They show the structure and depth of the evidence, not current capacity.
            </p>
          </div>
          <div className="mkt-st-comm-orbit-wrap">
            <SampleTalentCommunitiesHero />
          </div>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section mkt-st-comm-cards">
        <MktShell>
          <div className="mkt-st-comm-grid">
            {COMMUNITY_DETAILS.map((community) => (
              <SampleTalentCommunityCard
                key={community.name}
                name={community.name}
                body={community.body}
                onClick={() => onDisciplineClick(communityToDiscipline(community.name))}
              />
            ))}
          </div>
        </MktShell>
      </section>
    </>
  );
}

type SampleTalentListingPageProps = {
  initialDiscipline: Discipline;
};

function SampleTalentListingPage({ initialDiscipline }: SampleTalentListingPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const listingView: ListingView = isListingView(viewParam) ? viewParam : 'browse';
  const { message, variant, show, showError, dismiss } = useDemoToast();

  const {
    shortlistedIds,
    compareIds,
    isShortlisted,
    isInCompare,
    toggleShortlist,
    toggleCompare,
    removeFromCompare,
    addManyToCompare,
    clearShortlist,
    clearCompare,
    compareFull,
  } = useSampleTalentShortlist();

  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>(initialDiscipline);
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('All Timezones');
  const [start, setStart] = useState<(typeof START_DATES)[number]>('Any Start date');
  const [maxRate, setMaxRate] = useState(60);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('score');

  const filtered = DEMO_ENGINEERS.filter((engineer) => {
    const q = query.trim().toLowerCase();
    const hay = `${engineer.name} ${engineer.role} ${engineer.skills.join(' ')}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (discipline !== 'All Disciplines' && engineer.discipline !== discipline) return false;
    if (timezone !== 'All Timezones' && engineer.timezone !== timezone) return false;
    if (start === 'Available now' && engineer.availabilityWeeks !== 0) return false;
    if (start === 'Within 2 weeks' && engineer.availabilityWeeks > 2) return false;
    if (start === 'Within 4 weeks' && engineer.availabilityWeeks > 4) return false;
    if (engineer.rate > maxRate) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'rate-low') return a.rate - b.rate;
    if (sort === 'rate-high') return b.rate - a.rate;
    if (sort === 'availability') return a.availabilityWeeks - b.availabilityWeeks;
    return b.score - a.score;
  });

  function handleDisciplineChange(value: Discipline) {
    setDiscipline(value);
    setSearchParams({ discipline: value, ...(listingView !== 'browse' ? { view: listingView } : {}) });
  }

  function setListingView(next: ListingView) {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (next === 'browse') params.delete('view');
      else params.set('view', next);
      return params;
    });
  }

  function engineerName(id: string) {
    return DEMO_ENGINEERS.find((engineer) => engineer.id === id)?.name ?? 'Profile';
  }

  function handleShortlist(id: string) {
    const name = engineerName(id);
    if (isShortlisted(id)) {
      toggleShortlist(id);
      show(`${name} removed from shortlist`);
      return;
    }
    toggleShortlist(id);
    show(`${name} added to shortlist`);
  }

  function handleCompare(id: string) {
    const name = engineerName(id);
    if (isInCompare(id)) {
      toggleCompare(id);
      show(`${name} removed from compare`);
      return;
    }
    if (compareFull) {
      showError(`Compare is full — remove one profile first (max ${MAX_COMPARE}).`);
      return;
    }
    toggleCompare(id);
    show(`${name} added to compare`);
  }

  function handleCompareAll() {
    const idsToAdd = shortlistedEngineers
      .filter((engineer) => !isInCompare(engineer.id))
      .map((engineer) => engineer.id)
      .slice(0, MAX_COMPARE - compareIds.length);

    if (idsToAdd.length === 0) {
      showError(`Compare is full or all shortlisted profiles are already included (max ${MAX_COMPARE}).`);
      return;
    }

    addManyToCompare(idsToAdd);
    show(
      idsToAdd.length === 1
        ? `${engineerName(idsToAdd[0]!)} added to compare`
        : `${idsToAdd.length} profiles added to compare`,
    );
    setListingView('compare');
  }

  function handleRemoveFromCompare(id: string) {
    removeFromCompare(id);
    show(`${engineerName(id)} removed from compare`);
  }

  function handleClearCompare() {
    clearCompare();
    show('Compare list cleared');
  }

  function handleClearShortlist() {
    clearShortlist();
    show('Shortlist cleared');
  }

  const shortlistedEngineers = useMemo(
    () => DEMO_ENGINEERS.filter((engineer) => shortlistedIds.includes(engineer.id)),
    [shortlistedIds],
  );

  const compareEngineers = useMemo(
    () =>
      compareIds
        .map((id) => DEMO_ENGINEERS.find((engineer) => engineer.id === id))
        .filter((engineer): engineer is (typeof DEMO_ENGINEERS)[number] => Boolean(engineer)),
    [compareIds],
  );

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <section className="mkt-white mkt-section mkt-eng-listing-banner">
        <MktShell>
          <div className="mt-5">
            <div className="max-w-[700px]">
              <div className="mkt-eng-label">Available Engineers</div>
              <h1 className="mt-3 mb-0">Engineers, organised by discipline</h1>
            </div>
            <p className="mkt-big mt-3 mkt-eng-banner-copy howitworks-body-style">
              Not a general résumé database. Every engineer belongs to a specialist community with its
              own tests and its own outside testers.
            </p>
            <p className="mkt-lead mt-4 mkt-eng-banner-copy howitworks-body-style">
              Complete profiles in the real format — test results, verification status, rate, start date
              and assigned time zone. The engineers below are fictional demos of the evidence structure.
            </p>
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-eng-listing">
        <MktShell className="mkt-eng-layout">
          <aside className="mkt-eng-filters">
            <h3>Filters</h3>
            {listingView === 'browse' ? (
              <>
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
              <MktSelect
                value={discipline}
                onChange={(value) => handleDisciplineChange(value as Discipline)}
                options={mktOptionsFromStrings(DISCIPLINES)}
                searchable
              />
            </label>
            <label>
              Time zone
              <MktSelect
                value={timezone}
                onChange={(value) => setTimezone(value as typeof timezone)}
                options={mktOptionsFromStrings(TIMEZONES)}
              />
            </label>
            <label>
              Start date
              <MktSelect
                value={start}
                onChange={(value) => setStart(value as typeof start)}
                options={mktOptionsFromStrings(START_DATES)}
              />
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
              </>
            ) : (
              <p className="mkt-st-sl-filter-note">
                {listingView === 'shortlist'
                  ? 'Review saved profiles side by side before you reach out.'
                  : `Compare up to ${MAX_COMPARE} engineers on rate, score, skills and test results.`}
              </p>
            )}
          </aside>

          <div>
            <div className="mkt-eng-toolbar">
              <div className="mkt-eng-toolbar-meta">
                <Link to="/sample-talent" className="mkt-btn mkt-btn-secondary mkt-btn-sm mkt-eng-back">
                  <ForwardArrow className="h-4 w-4 rotate-180" />
                  Back
                </Link>
                <div className="mkt-st-sl-tabs" role="tablist" aria-label="Vetted talent views">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={listingView === 'browse'}
                    className={`mkt-st-sl-tab${listingView === 'browse' ? ' is-active' : ''}`}
                    onClick={() => setListingView('browse')}
                  >
                    Browse
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={listingView === 'shortlist'}
                    className={`mkt-st-sl-tab${listingView === 'shortlist' ? ' is-active' : ''}${shortlistedIds.length ? ' has-items' : ''}`}
                    onClick={() => setListingView('shortlist')}
                  >
                    Shortlist{shortlistedIds.length ? ` (${shortlistedIds.length})` : ''}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={listingView === 'compare'}
                    className={`mkt-st-sl-tab${listingView === 'compare' ? ' is-active' : ''}${compareIds.length ? ' has-items' : ''}`}
                    onClick={() => setListingView('compare')}
                  >
                    Compare{compareIds.length ? ` (${compareIds.length})` : ''}
                  </button>
                </div>
              </div>
              {listingView === 'browse' ? (
              <label>
                Sort by
                <MktSelect
                  value={sort}
                  onChange={(value) => setSort(value as typeof sort)}
                  options={SORT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  variant="toolbar"
                />
              </label>
              ) : null}
            </div>

            {listingView === 'browse' && (
              <>
            {compareFull && (
              <p className="mkt-st-compare-limit" role="status">
                Compare limit reached — remove a profile from Compare to add another (max {MAX_COMPARE}).
              </p>
            )}
            <span className="mkt-eng-toolbar-count mkt-st-sl-toolbar-count">
              Showing {filtered.length} of {DEMO_ENGINEERS.length} engineers in {discipline}
            </span>
            <div className="mkt-eng-grid mkt-eng-grid--with-bar">
              {filtered.map((engineer) => (
                <DemoEngineerCard
                  key={engineer.id}
                  engineer={engineer}
                  showTalentActions
                  isShortlisted={isShortlisted(engineer.id)}
                  isInCompare={isInCompare(engineer.id)}
                  compareDisabled={compareFull && !isInCompare(engineer.id)}
                  onShortlist={() => handleShortlist(engineer.id)}
                  onCompare={() => handleCompare(engineer.id)}
                />
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
            <SampleTalentSelectionBar
              shortlistedCount={shortlistedIds.length}
              compareCount={compareIds.length}
              compareEngineers={compareEngineers}
              onViewShortlist={() => setListingView('shortlist')}
              onViewCompare={() => setListingView('compare')}
            />
              </>
            )}

            {listingView === 'shortlist' && (
              <SampleTalentShortlistView
                engineers={shortlistedEngineers}
                compareCount={compareIds.length}
                isShortlisted={isShortlisted}
                isInCompare={isInCompare}
                compareFull={compareFull}
                onShortlist={handleShortlist}
                onCompare={handleCompare}
                onCompareAll={handleCompareAll}
                onClear={handleClearShortlist}
                onGoToBrowse={() => setListingView('browse')}
              />
            )}

            {listingView === 'compare' && (
              <SampleTalentCompareView
                engineers={compareEngineers}
                onRemove={handleRemoveFromCompare}
                onClear={handleClearCompare}
                onGoToBrowse={() => setListingView('browse')}
              />
            )}
          </div>
        </MktShell>
      </section>
    </>
  );
}

export function SampleTalentPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [unlockDiscipline, setUnlockDiscipline] = useState<string | null>(null);

  const disciplineParam = searchParams.get('discipline');
  const listingDiscipline = isDiscipline(disciplineParam) ? disciplineParam : null;

  useEffect(() => {
    if (
      isLoading ||
      isAuthenticated ||
      !listingDiscipline ||
      listingDiscipline === 'All Disciplines'
    ) {
      return;
    }
    setUnlockDiscipline(listingDiscipline);
    setSearchParams({}, { replace: true });
  }, [isLoading, isAuthenticated, listingDiscipline, setSearchParams]);

  function handleDisciplineClick(name: string) {
    if (isLoading) return;
    if (isAuthenticated) {
      setSearchParams({ discipline: name });
      return;
    }
    setUnlockDiscipline(name);
  }

  const showListing = Boolean(listingDiscipline && isAuthenticated);

  return (
    <div className="mkt-eng-page">
      <PageMeta title={PAGE_SEO.sampleTalent.title} description={PAGE_SEO.sampleTalent.description} />
      {showListing && listingDiscipline ? (
        <SampleTalentListingPage initialDiscipline={listingDiscipline} />
      ) : (
        <>
          <SampleTalentBrowsePage onDisciplineClick={handleDisciplineClick} />
          <TalentUnlockDialog
            open={Boolean(unlockDiscipline)}
            discipline={unlockDiscipline ?? ''}
            onClose={() => setUnlockDiscipline(null)}
          />
        </>
      )}
    </div>
  );
}
