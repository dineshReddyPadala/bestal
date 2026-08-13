import { cn } from '@bestal/shared-utils';
import { Button, SearchInput, Select } from '@bestal/ui';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  CLIENT_SEARCH_SCORE_FILTER_OPTIONS,
  DEFAULT_CLIENT_SEARCH_FILTERS,
  type ClientSearchFilters,
} from '../../lib/client-search';

type PremiumSearchFiltersProps = {
  filters: ClientSearchFilters;
  onChange: (filters: ClientSearchFilters) => void;
  resultCount: number;
  communityOptions?: readonly string[];
  timezoneOptions?: readonly string[];
  /** `panel` = stacked left sidebar; `inline` = horizontal wrap (legacy). */
  layout?: 'panel' | 'inline';
  className?: string;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
  fullWidth,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex flex-col gap-1',
        fullWidth ? 'w-full' : 'min-w-[140px] flex-1',
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

function FilterFields({
  filters,
  set,
  communityOptions,
  timezoneOptions,
  stacked,
}: {
  filters: ClientSearchFilters;
  set: (patch: Partial<ClientSearchFilters>) => void;
  communityOptions: readonly string[];
  timezoneOptions: readonly string[];
  stacked: boolean;
}) {
  return (
    <>
      <FilterSelect
        label="Community"
        value={filters.community}
        onChange={(v) => set({ community: v })}
        fullWidth={stacked}
        options={[
          { value: 'all', label: 'All communities' },
          ...communityOptions.map((c) => ({ value: c, label: c })),
        ]}
      />
      <FilterSelect
        label="Experience"
        value={filters.experience}
        onChange={(v) => set({ experience: v })}
        fullWidth={stacked}
        options={[
          { value: 'all', label: 'Any' },
          { value: '0-5', label: '0–5 yrs' },
          { value: '6-10', label: '6–10 yrs' },
          { value: '11-99', label: '11+ yrs' },
        ]}
      />
      <FilterSelect
        label="Rate"
        value={filters.rate}
        onChange={(v) => set({ rate: v })}
        fullWidth={stacked}
        options={[
          { value: 'all', label: 'Any rate' },
          { value: '0-100', label: 'Under $100/hr' },
          { value: '0-130', label: 'Under $130/hr' },
          { value: '130-160', label: '$130–160/hr' },
          { value: '160-999', label: '$160+/hr' },
        ]}
      />
      <FilterSelect
        label="Availability"
        value={filters.availability}
        onChange={(v) => set({ availability: v })}
        fullWidth={stacked}
        options={[
          { value: 'all', label: 'Any' },
          { value: 'IMMEDIATE', label: 'Immediate' },
          { value: 'WITHIN_2_WEEKS', label: 'Within 2 weeks' },
          { value: 'NOT_AVAILABLE', label: 'Not available' },
        ]}
      />
      {timezoneOptions.length > 0 ? (
        <FilterSelect
          label="Timezone"
          value={filters.timezone}
          onChange={(v) => set({ timezone: v })}
          fullWidth={stacked}
          options={[
            { value: 'all', label: 'All timezones' },
            ...timezoneOptions.map((tz) => ({
              value: tz,
              label: tz.replace(/_/g, ' '),
            })),
          ]}
        />
      ) : null}
      <FilterSelect
        label="High score"
        value={filters.minScore === 0 ? '0' : String(filters.minScore)}
        onChange={(v) => set({ minScore: Number(v) })}
        fullWidth={stacked}
        options={CLIENT_SEARCH_SCORE_FILTER_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
    </>
  );
}

export function PremiumSearchFilters({
  filters,
  onChange,
  resultCount,
  communityOptions = [],
  timezoneOptions = [],
  layout = 'panel',
  className,
}: PremiumSearchFiltersProps) {
  const set = (patch: Partial<ClientSearchFilters>) => onChange({ ...filters, ...patch });
  const [mobileOpen, setMobileOpen] = useState(false);
  const stacked = layout === 'panel';

  const searchBlock = (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Search
      </span>
      <SearchInput
        placeholder="Name, role, skill, or location…"
        value={filters.query}
        onChange={(e) => set({ query: e.target.value })}
        onClear={() => set({ query: '' })}
        className={cn('mt-1', stacked ? 'w-full' : 'max-w-xl')}
      />
    </div>
  );

  const footer = (
    <div
      className={cn(
        'flex gap-2 border-t border-border/60 pt-3',
        stacked ? 'flex-col' : 'flex-wrap items-center justify-between',
      )}
    >
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{resultCount}</span> candidates match
      </p>
      <Button
        variant="ghost"
        size="sm"
        className={stacked ? 'w-full justify-center' : undefined}
        onClick={() => onChange(DEFAULT_CLIENT_SEARCH_FILTERS)}
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Reset filters
      </Button>
    </div>
  );

  if (layout === 'inline') {
    return (
      <div
        className={cn(
          'rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm',
          className,
        )}
      >
        <div className="mb-4">{searchBlock}</div>
        <div className="flex flex-wrap gap-3">
          <FilterFields
            filters={filters}
            set={set}
            communityOptions={communityOptions}
            timezoneOptions={timezoneOptions}
            stacked={false}
          />
        </div>
        <div className="mt-4">{footer}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm',
        className,
      )}
    >
      {/* Mobile accordion */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Filters</p>
          <p className="text-xs text-muted-foreground">{resultCount} candidates match</p>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            mobileOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'flex-col gap-4 p-4',
          mobileOpen ? 'flex' : 'hidden',
          'md:flex',
        )}
      >
        {searchBlock}
        <div className="flex flex-col gap-3">
          <FilterFields
            filters={filters}
            set={set}
            communityOptions={communityOptions}
            timezoneOptions={timezoneOptions}
            stacked
          />
        </div>
        {footer}
      </div>
    </div>
  );
}
