import { cn } from '@bestal/shared-utils';
import { useMemo, type ReactNode } from 'react';

import { useDashboardHeaderLeading } from '../layouts/dashboard-layout.js';

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  const headerLeading = useMemo(
    () => (
      <div className="flex min-w-0 items-center gap-3">
        {breadcrumbs ? (
          <>
            <div className="shrink-0 text-sm text-muted-foreground">{breadcrumbs}</div>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          </>
        ) : null}
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
      </div>
    ),
    [title, breadcrumbs],
  );

  const inDashboard = useDashboardHeaderLeading(headerLeading);

  if (inDashboard) {
    if (!description && !actions) {
      return null;
    }

    return (
      <div
        className={cn(
          'flex flex-col gap-2 px-6 pt-4 sm:flex-row sm:items-center',
          description && actions
            ? 'sm:justify-between'
            : actions
              ? 'sm:justify-end'
              : undefined,
          className,
        )}
      >
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn('border-b border-border bg-background px-6 py-6', className)}>
      {breadcrumbs && <div className="mb-3 text-sm text-muted-foreground">{breadcrumbs}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
