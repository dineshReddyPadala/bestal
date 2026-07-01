import { cn } from '@bestal/shared-utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { type ReactNode } from 'react';
import { Card, CardContent } from './card.js';

export type StatCardProps = {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5 text-xs">
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                )}
                <span className={cn('font-medium', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                  {isPositive ? '+' : ''}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-brand-light p-2.5 text-brand">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
