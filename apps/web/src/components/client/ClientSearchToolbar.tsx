import { cn } from '@bestal/shared-utils';
import { Button, SearchInput } from '@bestal/ui';
import { ChevronDown, LayoutGrid, List, RotateCcw, X } from 'lucide-react';
import {
  clearFilterChip,
  CLIENT_SEARCH_SORT_OPTIONS,
  countActiveFilters,
  DEFAULT_CLIENT_SEARCH_FILTERS,
  getActiveFilterChips,
  type ClientSearchFilters,
  type ClientSearchSort,
} from '../../lib/client-search';

export type ClientSearchViewMode = 'cards' | 'list';

type ClientSearchToolbarProps = {
  filters: ClientSearchFilters;
  onChange: (filters: ClientSearchFilters) => void;
  sort: Exclude<ClientSearchSort, 'best-match'>;
  onSortChange: (sort: Exclude<ClientSearchSort, 'best-match'>) => void;
  viewMode: ClientSearchViewMode;
  onViewModeChange: (mode: ClientSearchViewMode) => void;
  resultCount: number;
  timezoneOptions?: readonly string[];
  className?: string;
};

type FilterOption = { value: string; label: string };

function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-9 w-full cursor-pointer appearance-none rounded-lg border border-border/80 bg-background py-0 pl-3 pr-8 text-sm font-medium shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          value === 'all' ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

export function ClientSearchToolbar({
  filters,
  onChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  timezoneOptions = [],
  className,
}: ClientSearchToolbarProps) {
  const set = (patch: Partial<ClientSearchFilters>) => onChange({ ...filters, ...patch });
  const chips = getActiveFilterChips(filters);

  const timezoneSelectOptions =
    timezoneOptions.length > 0
      ? timezoneOptions
      : ['UTC', 'EST', 'PST', 'CET', 'IST', 'SGT', 'AEST'];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <div className="grid min-w-0 flex-1 grid-cols-2 items-center gap-2 sm:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(10rem,1fr)]">
          <FilterSelect
            value={filters.experience}
            onChange={(value) => set({ experience: value })}
            options={[
              { value: 'all', label: 'Any Experience' },
              { value: '0-5', label: '0-5 yrs' },
              { value: '6-10', label: '6-10 yrs' },
              { value: '11-99', label: '11+ yrs' },
            ]}
          />
          <FilterSelect
            value={filters.rate}
            onChange={(value) => set({ rate: value })}
            options={[
              { value: 'all', label: 'Any rate' },
              { value: '0-100', label: '<$100/hr' },
              { value: '0-130', label: 'Under $130/hr' },
              { value: '130-160', label: '$130–160/hr' },
              { value: '160-999', label: '$160+/hr' },
            ]}
          />
          <FilterSelect
            value={filters.timezone}
            onChange={(value) => set({ timezone: value })}
            options={[
              { value: 'all', label: 'All timezones' },
              ...timezoneSelectOptions.map((timezone) => ({
                value: timezone,
                label: timezone.replace(/_/g, ' '),
              })),
            ]}
          />
          <label className="col-span-2 flex h-9 items-center gap-2 rounded-lg border border-border/80 bg-background px-3 text-sm shadow-sm sm:col-span-1 lg:col-span-1">
            <span className="shrink-0 text-muted-foreground">Score</span>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={filters.minScore}
              onChange={(event) => set({ minScore: Number(event.target.value) })}
              className="min-w-0 flex-1 accent-brand"
            />
            <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums">
              {filters.minScore}+
            </span>
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {countActiveFilters(filters) > 0 ? (
              <>
                <span className="font-semibold text-foreground">{resultCount}</span> Candidates
                Matched
              </>
            ) : (
              'Candidates Matched'
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 text-xs"
            onClick={() => onChange(DEFAULT_CLIENT_SEARCH_FILTERS)}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={`${chip.key}-${chip.label}`}
              type="button"
              onClick={() => onChange(clearFilterChip(filters, chip.key))}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              {chip.label}
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-nowrap items-center gap-2">
        <SearchInput
          placeholder="Name, role, skill or any other"
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
          onClear={() => set({ query: '' })}
          className="min-w-0 flex-1"
        />
        <FilterSelect
          value={sort}
          onChange={(value) =>
            onSortChange(value as Exclude<ClientSearchSort, 'best-match'>)
          }
          className="w-[9.5rem] shrink-0"
          options={CLIENT_SEARCH_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
        <div
          className="flex shrink-0 overflow-hidden rounded-lg border border-border/80"
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center transition-colors',
              viewMode === 'cards'
                ? 'bg-brand text-white'
                : 'bg-background text-muted-foreground hover:bg-muted',
            )}
            aria-pressed={viewMode === 'cards'}
            title="Card view"
            onClick={() => onViewModeChange('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center border-l border-border/80 transition-colors',
              viewMode === 'list'
                ? 'bg-brand text-white'
                : 'bg-background text-muted-foreground hover:bg-muted',
            )}
            aria-pressed={viewMode === 'list'}
            title="List view"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
