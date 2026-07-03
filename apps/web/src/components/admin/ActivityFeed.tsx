import { formatDate } from '@bestal/shared-utils';
import { StatusBadge } from '@bestal/ui';
import type { DashboardActivity } from '@bestal/mock-data';
import { Link } from 'react-router-dom';

type ActivityFeedProps = {
  title: string;
  items: readonly DashboardActivity[];
  viewAllHref?: string;
};

export function ActivityFeed({ title, items, viewAllHref }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-xs font-medium text-brand hover:underline">
            View all
          </Link>
        )}
      </div>
      <ul className="divide-y divide-border/60">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-3 transition-colors hover:bg-muted/30">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.subtitle}</p>
                {item.actor && (
                  <p className="mt-1 text-xs text-muted-foreground/80">{item.actor}</p>
                )}
              </div>
              <StatusBadge status={item.status} className="shrink-0 text-[10px]" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {formatDate(item.timestamp)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
