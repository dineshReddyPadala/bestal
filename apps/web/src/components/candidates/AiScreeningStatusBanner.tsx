import { cn } from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import {
  aiScreeningStatusLabel,
  isAiScreeningActive,
  type AiScreeningJobStatus,
} from '../../lib/ai-screening-status';

type AiScreeningStatusBannerProps = {
  status: AiScreeningJobStatus | null;
  errorMessage?: string | null;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
};

export function AiScreeningStatusBanner({
  status,
  errorMessage,
  onRetry,
  retrying = false,
  className,
}: AiScreeningStatusBannerProps) {
  if (!status) return null;

  const label = aiScreeningStatusLabel(status);
  const active = isAiScreeningActive(status);
  const failed = status === 'FAILED';
  const completed = status === 'COMPLETED';
  const cancelled = status === 'CANCELLED';

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-3 text-sm',
        active && 'border-brand/30 bg-brand/5 text-foreground',
        completed && 'border-emerald-200 bg-success/10 text-emerald-800',
        failed && 'border-red-200 bg-red-50 text-red-700',
        cancelled && 'border-border bg-muted/30 text-muted-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start gap-2">
        {active ? (
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand" />
        ) : completed ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium">{label}</p>
          {failed && errorMessage ? (
            <p className="text-xs opacity-90">{errorMessage}</p>
          ) : null}
          {active ? (
            <p className="text-xs text-muted-foreground">
              Checking screening progress…
            </p>
          ) : null}
        </div>
        {failed && onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={retrying}
            onClick={onRetry}
          >
            {retrying ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
