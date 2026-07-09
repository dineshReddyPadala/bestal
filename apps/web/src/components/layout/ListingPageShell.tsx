import { Button, Select } from '@bestal/ui';
import type { ReactNode } from 'react';

type ListingPageShellProps = {
  title: string;
  actions?: ReactNode;
  error?: string | null;
  message?: string | null;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

/** Baseline table page layout: compact title bar, fixed viewport, content fills remaining height. */
export function ListingPageShell({
  title,
  actions,
  error,
  message,
  loading = false,
  loadingLabel = 'Loading…',
  children,
}: ListingPageShellProps) {
  return (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-5 sm:px-6">
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {message ? (
        <div className="mx-5 mt-3 shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 sm:mx-6">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mx-5 mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:mx-6">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col px-5 py-4 sm:px-6">
        {loading ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
            {loadingLabel}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

type ListingFilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

export function ListingFilterSelect({
  label,
  value,
  onChange,
  options,
  className = 'w-[160px] min-w-[140px]',
}: ListingFilterSelectProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

type ListingFiltersRowProps = {
  children: ReactNode;
  onClear?: () => void;
};

/** Inline filter chips to place beside search via TanStackDataTable `filtersInline`. */
export function ListingFiltersRow({ children, onClear }: ListingFiltersRowProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {children}
      {onClear ? (
        <Button variant="ghost" size="sm" className="mb-0.5 shrink-0" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
