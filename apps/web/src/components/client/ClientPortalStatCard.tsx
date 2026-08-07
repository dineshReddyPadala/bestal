import { cn } from '@bestal/shared-utils';
import type { ReactNode } from 'react';

export type ClientPortalStatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'orange' | 'green' | 'amber' | 'blue' | 'rose' | 'brand';
  className?: string;
};

const accentStyles = {
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-sky-100 text-sky-600',
  rose: 'bg-rose-100 text-rose-600',
  brand: 'bg-brand-light text-brand',
};

export function ClientPortalStatCard({
  label,
  value,
  icon,
  accent = 'brand',
  className,
}: ClientPortalStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tabular-nums leading-tight tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-[10px] text-muted-foreground">upto date</p>
        </div>
        <div className={cn('shrink-0 rounded-md p-1.5 [&_svg]:h-4 [&_svg]:w-4', accentStyles[accent])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
