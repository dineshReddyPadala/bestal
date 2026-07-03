import {
  clientSearchCommunities,
  clientSearchRoles,
  clientSearchSkills,
  clientSearchTimezones,
} from '@bestal/mock-data';
import { cn } from '@bestal/shared-utils';
import { Button, SearchInput, Select } from '@bestal/ui';
import { RotateCcw } from 'lucide-react';
import {
  DEFAULT_CLIENT_SEARCH_FILTERS,
  type ClientSearchFilters,
} from '../../lib/client-search';

type PremiumSearchFiltersProps = {
  filters: ClientSearchFilters;
  onChange: (filters: ClientSearchFilters) => void;
  resultCount: number;
  className?: string;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function PremiumSearchFilters({
  filters,
  onChange,
  resultCount,
  className,
}: PremiumSearchFiltersProps) {
  const set = (patch: Partial<ClientSearchFilters>) => onChange({ ...filters, ...patch });

  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm',
        className,
      )}
    >
      <div className="mb-4">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Search
        </span>
        <SearchInput
          placeholder="Name, role, skill, or location…"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          onClear={() => set({ query: '' })}
          className="mt-1 max-w-xl"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Community"
          value={filters.community}
          onChange={(v) => set({ community: v })}
          options={[
            { value: 'all', label: 'All communities' },
            ...clientSearchCommunities.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterSelect
          label="Role"
          value={filters.role}
          onChange={(v) => set({ role: v })}
          options={[
            { value: 'all', label: 'All roles' },
            ...clientSearchRoles.map((r) => ({ value: r, label: r })),
          ]}
        />
        <FilterSelect
          label="Skills"
          value={filters.skill}
          onChange={(v) => set({ skill: v })}
          options={[
            { value: 'all', label: 'All skills' },
            ...clientSearchSkills.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Experience"
          value={filters.experience}
          onChange={(v) => set({ experience: v })}
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
          options={[
            { value: 'all', label: 'Any rate' },
            { value: '0-130', label: 'Under $130/hr' },
            { value: '130-160', label: '$130–160/hr' },
            { value: '160-999', label: '$160+/hr' },
          ]}
        />
        <FilterSelect
          label="Availability"
          value={filters.availability}
          onChange={(v) => set({ availability: v })}
          options={[
            { value: 'all', label: 'Any' },
            { value: 'IMMEDIATE', label: 'Immediate' },
            { value: 'WITHIN_2_WEEKS', label: 'Within 2 weeks' },
            { value: 'WITHIN_30_DAYS', label: 'Within 30 days' },
            { value: 'WITHIN_60_DAYS', label: 'Within 60 days' },
          ]}
        />
        <FilterSelect
          label="Timezone"
          value={filters.timezone}
          onChange={(v) => set({ timezone: v })}
          options={[
            { value: 'all', label: 'All timezones' },
            ...clientSearchTimezones.map((tz) => ({
              value: tz,
              label: tz.replace(/_/g, ' '),
            })),
          ]}
        />
        <label className="flex min-w-[140px] flex-1 flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            BesTal Score
          </span>
          <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3">
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={filters.minScore}
              onChange={(e) => set({ minScore: Number(e.target.value) })}
              className="w-full accent-brand"
            />
            <span className="w-8 shrink-0 text-xs font-medium tabular-nums">{filters.minScore}+</span>
          </div>
        </label>
        <FilterSelect
          label="Evaluation"
          value={filters.evaluation}
          onChange={(v) => set({ evaluation: v })}
          options={[
            { value: 'all', label: 'All' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'NOT_STARTED', label: 'Not Started' },
          ]}
        />
        <FilterSelect
          label="BGV"
          value={filters.bgv}
          onChange={(v) => set({ bgv: v })}
          options={[
            { value: 'all', label: 'All' },
            { value: 'CLEAR', label: 'Clear' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'NOT_STARTED', label: 'Not Started' },
          ]}
        />
        <FilterSelect
          label="Trial Eligible"
          value={filters.trialEligible}
          onChange={(v) => set({ trialEligible: v })}
          options={[
            { value: 'all', label: 'Any' },
            { value: 'yes', label: 'Eligible' },
            { value: 'no', label: 'Not eligible' },
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span> candidates match
        </p>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_CLIENT_SEARCH_FILTERS)}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
