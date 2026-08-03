import { cn } from '@bestal/shared-utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

export type PremiumStatCardProps = {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky';
  className?: string;
};

const accentStyles = {
  brand: 'from-brand/10 to-brand/5 text-brand border-brand/20',
  emerald: 'from-emerald-500/10 to-emerald-500/5 text-success border-emerald-500/20',
  amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20',
  violet: 'from-violet-500/10 to-violet-500/5 text-violet-600 border-violet-500/20',
  rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-500/20',
  sky: 'from-brand/10 to-brand/5 text-brand border-brand/20',
};

export function PremiumStatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  accent = 'brand',
  className,
}: PremiumStatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/30 p-5 shadow-sm transition-all hover:shadow-elevated',
        accentStyles[accent],
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-40" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p>
          {change !== undefined && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span className={cn('font-semibold', isPositive ? 'text-success' : 'text-red-600')}>
                {isPositive ? '+' : ''}
                {change}%
              </span>
              {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'shrink-0 rounded-xl border bg-gradient-to-br p-3 shadow-sm',
              accentStyles[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
