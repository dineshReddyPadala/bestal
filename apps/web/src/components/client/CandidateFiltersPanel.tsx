import { skillCommunities } from '@bestal/mock-data';
import { cn } from '@bestal/shared-utils';
import { Button, SearchInput, Select } from '@bestal/ui';
import { SlidersHorizontal, X } from 'lucide-react';
import { type CandidateFilters, DEFAULT_FILTERS } from '../../lib/client-candidates';

type CandidateFiltersPanelProps = {
  filters: CandidateFilters;
  onChange: (filters: CandidateFilters) => void;
  resultCount: number;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function FilterFields({
  filters,
  onChange,
  resultCount,
}: {
  filters: CandidateFilters;
  onChange: (filters: CandidateFilters) => void;
  resultCount: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">Search</p>
        <SearchInput
          placeholder="Name, skill, location…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          onClear={() => onChange({ ...filters, query: '' })}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Community</label>
        <Select
          value={filters.community}
          onChange={(e) => onChange({ ...filters, community: e.target.value })}
          className="mt-2"
        >
          <option value="all">All communities</option>
          {skillCommunities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Min experience ({filters.minExperience}+ yrs)
        </label>
        <input
          type="range"
          min={0}
          max={15}
          value={filters.minExperience}
          onChange={(e) =>
            onChange({ ...filters, minExperience: Number(e.target.value) })
          }
          className="mt-2 w-full accent-brand"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Max rate (${filters.maxRate}/hr)
        </label>
        <input
          type="range"
          min={80}
          max={250}
          step={5}
          value={filters.maxRate}
          onChange={(e) => onChange({ ...filters, maxRate: Number(e.target.value) })}
          className="mt-2 w-full accent-brand"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Min BesTal Score ({filters.minScore}+)
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.minScore}
          onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
          className="mt-2 w-full accent-brand"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Availability</label>
        <Select
          value={filters.availability}
          onChange={(e) => onChange({ ...filters, availability: e.target.value })}
          className="mt-2"
        >
          <option value="all">Any availability</option>
          <option value="2weeks">Within 2 weeks</option>
          <option value="immediate">Within 30 days</option>
        </Select>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">{resultCount} candidates</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

export function CandidateFiltersPanel({
  filters,
  onChange,
  resultCount,
  className,
  mobileOpen,
  onMobileClose,
}: CandidateFiltersPanelProps) {
  return (
    <>
      <aside
        className={cn(
          'hidden w-72 shrink-0 rounded-xl border border-border bg-background p-5 lg:block',
          className,
        )}
      >
        <h2 className="mb-4 font-semibold text-foreground">Filters</h2>
        <FilterFields filters={filters} onChange={onChange} resultCount={resultCount} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} aria-hidden />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-background p-5 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <Button variant="ghost" size="sm" onClick={onMobileClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FilterFields filters={filters} onChange={onChange} resultCount={resultCount} />
          </div>
        </div>
      )}
    </>
  );
}

export function MobileFilterButton({ onClick, activeCount }: { onClick: () => void; activeCount: number }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="lg:hidden">
      <SlidersHorizontal className="mr-2 h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
          {activeCount}
        </span>
      )}
    </Button>
  );
}
