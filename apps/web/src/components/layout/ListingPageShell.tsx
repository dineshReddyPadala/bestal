import { Select, useDashboardHeaderLeading } from '@bestal/ui';
import { useMemo, type ReactNode } from 'react';

import type { ToastVariant } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';

type ListingPageShellProps = {
  title: string;
  actions?: ReactNode;
  error?: string | null;
  message?: string | null;
  messageVariant?: ToastVariant;
  onMessageDismiss?: () => void;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

/** Listing layout: title in the dashboard top bar (before profile); actions sit below the header. */
export function ListingPageShell({
  title,
  actions,
  error,
  message,
  messageVariant = 'success',
  onMessageDismiss,
  loading = false,
  loadingLabel = 'Loading…',
  children,
}: ListingPageShellProps) {
  const headerLeading = useMemo(
    () => (
      <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
        {title}
      </h1>
    ),
    [title],
  );
  useDashboardHeaderLeading(headerLeading);

  return (
    <div className="flex h-[calc(100svh-var(--shell-header-h))] min-h-0 flex-col overflow-hidden bg-background">
      <ToastHost message={message} variant={messageVariant} onDismiss={onMessageDismiss} />

      {actions ? (
        <div className="flex shrink-0 items-center justify-end gap-2 px-5 pt-3 sm:px-6">
          {actions}
        </div>
      ) : null}

      {error ? (
        <div className="mx-5 mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:mx-6">
          {error}
        </div>
      ) : null}

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 sm:px-6">
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
  /** @deprecated Clear filters control removed from listing toolbars. */
  onClear?: () => void;
};

/** Inline filter chips to place beside search via TanStackDataTable `filtersInline`. */
export function ListingFiltersRow({ children }: ListingFiltersRowProps) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}
