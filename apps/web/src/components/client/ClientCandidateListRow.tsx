import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency, formatTimezoneLabel, initials } from '@bestal/shared-utils';
import { Avatar, Button } from '@bestal/ui';
import { Star } from 'lucide-react';
import { isBgvClear } from '../../lib/candidate-approval-gates';
import {
  availabilityStatusClasses,
  isImmediatelyAvailable,
  resolveClientAvailabilityLabel,
} from '../../lib/availability-display';
export type ClientCandidateListRowProps = {
  record: ClientSearchRecord;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onView: () => void;
  onRequestTrial?: () => void;
  canRequestTrial?: boolean;
  trialRequested?: boolean;
  className?: string;
};

export function ClientCandidateListRow({
  record,
  selected = false,
  onSelectedChange,
  onView,
  onRequestTrial,
  canRequestTrial = true,
  trialRequested = false,
  className,
}: ClientCandidateListRowProps) {
  const bgvClear = isBgvClear(record.bgvStatus);
  const evaluationDone = (record.evaluationStatus ?? '').toUpperCase() === 'COMPLETED';
  const primarySkill =
    record.primarySkillCommunityName.trim() || record.community.trim();
  const availableNow = isImmediatelyAvailable(record);
  const availabilityClasses = availabilityStatusClasses(availableNow);
  const availabilityLabel = resolveClientAvailabilityLabel(record);
  const timezoneLabel = formatTimezoneLabel(record.timezone);
  return (
    <article
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md sm:flex-nowrap',
        selected && 'border-brand/40 ring-1 ring-brand/25',
        className,
      )}
    >
      {onSelectedChange ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-border text-brand focus:ring-brand"
          aria-label={`Select ${record.fullName}`}
        />
      ) : null}

      <button
        type="button"
        onClick={onView}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar name={record.fullName} src={record.photoUrl ?? undefined} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{record.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {record.currentTitle || record.role}
          </p>
        </div>
      </button>

      <div className="hidden min-w-[7rem] shrink-0 text-sm text-muted-foreground md:block">
        <p className="truncate">{primarySkill}</p>
        <p className="truncate text-xs">{record.community}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-sm">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="font-medium tabular-nums">{record.bestalScore}</span>
      </div>

      <div className="hidden shrink-0 text-xs lg:block">
        <span
          className={cn(
            'inline-flex items-center gap-1',
            availabilityClasses.text,
          )}
        >
          <span
            className={cn('inline-block h-2 w-2 rounded-full', availabilityClasses.dot)}
          />
          {availabilityLabel}
        </span>
        {timezoneLabel ? (
          <p className="mt-0.5 truncate text-muted-foreground" title={timezoneLabel}>
            Timezone: {timezoneLabel}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 text-sm font-semibold tabular-nums">
        {formatCurrency(record.hourlyRate, record.currency)}
        <span className="text-xs font-normal text-muted-foreground">/hr</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {bgvClear && evaluationDone ? (
          <span
            className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:inline"
            title="Verified profile"
          >
            Verified
          </span>
        ) : (
          <span className="hidden text-[10px] text-muted-foreground sm:inline">
            {initials(record.fullName)}
          </span>
        )}
        {record.trialEligible && (trialRequested || (canRequestTrial && onRequestTrial)) ? (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 text-xs',
              trialRequested &&
                'border-border/70 bg-muted/40 text-muted-foreground disabled:opacity-100 disabled:cursor-default',
            )}
            disabled={trialRequested}
            onClick={trialRequested ? undefined : onRequestTrial}
          >
            {trialRequested ? 'Trial requested' : 'Trial'}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onView}>
          View
        </Button>
      </div>
    </article>
  );
}
