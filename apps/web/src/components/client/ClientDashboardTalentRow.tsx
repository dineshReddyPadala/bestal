import { cn, formatCurrency, initials } from '@bestal/shared-utils';
import { Link } from 'react-router-dom';

type ClientDashboardTalentRowProps = {
  id: number;
  name: string;
  subtitle: string;
  score?: number | null;
  rate?: number | null;
  currency?: string;
  photoUrl?: string | null;
  className?: string;
};

export function ClientDashboardTalentRow({
  id,
  name,
  subtitle,
  score,
  rate,
  currency = 'USD',
  photoUrl,
  className,
}: ClientDashboardTalentRowProps) {
  const imageSrc = photoUrl?.trim();

  return (
    <Link
      to={`/client/candidates/${id}`}
      className={cn(
        'flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted/40',
        className,
      )}
    >
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-brand-light">
        {imageSrc ? (
          <img src={imageSrc} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-brand">
            {initials(name)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="shrink-0 text-right text-xs">
        {score != null ? (
          <p className="font-semibold tabular-nums text-foreground">{score}</p>
        ) : null}
        {rate != null && rate > 0 ? (
          <p className="text-muted-foreground">{formatCurrency(rate, currency)}/hr</p>
        ) : null}
      </div>
    </Link>
  );
}
