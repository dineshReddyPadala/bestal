import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency, initials } from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { CheckCircle2, Loader2, Star } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ForwardArrow } from '../ui/ForwardArrow';
import { isBgvClear } from '../../lib/candidate-approval-gates';
import {
  availabilityStatusClasses,
  isImmediatelyAvailable,
  resolveClientAvailabilityLabel,
} from '../../lib/availability-display';

export type ClientCandidateSearchCardProps = {
  record: ClientSearchRecord;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onView: () => void;
  onRequestTrial?: () => void;
  canRequestTrial?: boolean;
  trialRequested?: boolean;
  className?: string;
};

function StatusRow({
  icon,
  label,
  tone,
  iconPosition = 'start',
}: {
  icon: ReactNode;
  label: string;
  tone: 'success' | 'warning' | 'muted';
  iconPosition?: 'start' | 'end';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-[11px] leading-tight',
        tone === 'success' && 'text-emerald-700',
        tone === 'warning' && 'text-amber-700',
        tone === 'muted' && 'text-muted-foreground',
      )}
    >
      {iconPosition === 'start' ? icon : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {iconPosition === 'end' ? icon : null}
    </div>
  );
}

function ProfilePhoto({
  name,
  src,
  verified,
}: {
  name: string;
  src?: string | null;
  verified?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src?.trim();
  const showImage = Boolean(imageSrc) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  return (
    <div className="relative h-[80px] w-[80px] shrink-0 sm:h-[84px] sm:w-[84px]">
      <div className="h-full w-full overflow-hidden rounded-lg bg-muted">
        {showImage ? (
          <img
            src={imageSrc}
            alt={name}
            className="h-full w-full object-cover object-top"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-light text-lg font-semibold text-brand">
            {initials(name)}
          </div>
        )}
      </div>
      {verified ? (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
          <CheckCircle2 className="h-2.5 w-2.5" />
        </span>
      ) : null}
    </div>
  );
}

function companyLabel(record: ClientSearchRecord): string {
  const company = record.currentCompany?.trim();
  if (company) return company;
  return '—';
}

export function ClientCandidateSearchCard({
  record,
  selected = false,
  onSelectedChange,
  onView,
  onRequestTrial,
  canRequestTrial = true,
  trialRequested = false,
  className,
}: ClientCandidateSearchCardProps) {
  const bgvClear = isBgvClear(record.bgvStatus);
  const bgvInProgress =
    !bgvClear &&
    record.bgvStatus &&
    !['NOT_STARTED', 'FAILED', 'ADVERSE'].includes(record.bgvStatus.toUpperCase());
  const evaluationDone =
    (record.evaluationStatus ?? '').toUpperCase() === 'COMPLETED';
  const primarySkill =
    record.primarySkillCommunityName.trim() || record.community.trim();
  const availableNow = isImmediatelyAvailable(record);
  const availabilityClasses = availabilityStatusClasses(availableNow);
  const availabilityLabel = resolveClientAvailabilityLabel(record);

  return (
    <article
      className={cn(
        'relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-xl border border-border/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:min-h-[320px] sm:p-5',
        selected && 'border-brand/40 ring-1 ring-brand/25',
        className,
      )}
    >
      {onSelectedChange ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
          className="absolute right-3 top-3 z-10 h-4 w-4 rounded border-border text-brand focus:ring-brand"
          aria-label={`Select ${record.fullName}`}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 items-start gap-3.5 pr-5 sm:gap-4">
        <div className="flex w-[88px] shrink-0 flex-col items-center gap-2.5 sm:w-[92px] sm:gap-3">
          <ProfilePhoto
            name={record.fullName}
            src={record.photoUrl}
            verified={bgvClear && evaluationDone}
          />
          <div className="w-full space-y-1.5 text-left">
          <p className="text-[10px] leading-tight text-muted-foreground">BesTal Score</p>
            <p className="flex items-center justify-left gap-0.5 text-[11px] font-medium text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{record.bestalScore}</span>
            </p>
            <p
              className={cn(
                'flex items-center justify-left gap-1 text-[10px]',
                availabilityClasses.text,
              )}
            >
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  availabilityClasses.dot,
                )}
              />
              {availabilityLabel}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between space-y-2 sm:space-y-2.5">
          <div className="space-y-1.5">
            <h3 className="truncate text-sm font-semibold text-brand sm:text-base">{record.fullName}</h3>

            {record.headline ? (
              <p className="truncate text-xs text-muted-foreground sm:text-[13px]">
                {record.headline}
              </p>
            ) : null}

            <div className="flex items-end justify-between gap-3">
              {primarySkill ? (
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    Expertise
                  </p>
                  <span className="mt-0.5 inline-flex rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200/80 sm:text-[11px]">
                    {primarySkill}
                  </span>
                </div>
              ) : (
                <div className="min-w-0 flex-1" />
              )}

              <p className="shrink-0 self-end text-right text-[14px] font-bold tabular-nums text-foreground sm:text-[16px]">
                {formatCurrency(record.hourlyRate, record.currency)}
                <span className="text-[10px] font-normal text-muted-foreground">/hr</span>
              </p>
            </div>

            {record.yearsExperience != null && record.yearsExperience > 0 ? (
              <p className="text-xs text-muted-foreground">
                Experience:{' '}
                <span className="font-medium text-foreground">
                  {record.yearsExperience} {record.yearsExperience === 1 ? 'year' : 'years'}
                </span>
              </p>
            ) : null}

            <div className="space-y-1 pt-0.5">
            {evaluationDone ? (
              <StatusRow
                tone="success"
                icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
                iconPosition="end"
                label="Tech Evaluation"
              />
            ) : (
              <StatusRow
                tone="muted"
                icon={<Loader2 className="h-3 w-3 shrink-0" />}
                iconPosition="end"
                label="Evaluation Pending"
              />
            )}
            {bgvClear ? (
              <StatusRow
                tone="success"
                icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
                iconPosition="end"
                label="BGV Clear"
              />
            ) : bgvInProgress ? (
              <StatusRow
                tone="warning"
                icon={<Loader2 className="h-3 w-3 shrink-0 animate-spin" />}
                iconPosition="end"
                label="BGV in Progress"
              />
            ) : (
              <StatusRow
                tone="muted"
                icon={<Loader2 className="h-3 w-3 shrink-0" />}
                iconPosition="end"
                label="BGV Pending"
              />
            )}
            </div>
          </div>

          <div className="pb-0.5 pt-1">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Previously worked at
            </p>
            <div className="mt-0.5">
              <span className="truncate text-xs font-semibold text-foreground">
                {companyLabel(record)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex shrink-0 gap-2 border-t border-border/50 pt-3.5 sm:gap-2.5 sm:pt-4">
        <Button
          type="button"
          variant={trialRequested ? 'outline' : 'primary'}
          size="sm"
          className={cn(
            'h-9 flex-1 text-xs sm:h-10 sm:text-sm',
            trialRequested &&
              'border-border/70 bg-muted/40 text-muted-foreground disabled:opacity-100 disabled:cursor-default',
          )}
          disabled={trialRequested || !canRequestTrial || !record.trialEligible}
          onClick={(event) => {
            if (trialRequested) return;
            event.stopPropagation();
            onRequestTrial?.();
          }}
        >
          {trialRequested ? 'Trial requested' : 'Request Trial'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shell-no-press-bg h-9 flex-1 gap-1.5 border-transparent text-xs shadow-none transition-colors hover:border-transparent hover:bg-background hover:shadow-none hover:ring-0 active:border-transparent active:bg-background active:text-foreground active:ring-0 sm:h-10 sm:text-sm"
          onClick={(event) => {
            event.stopPropagation();
            onView();
          }}
        >
          Resume
          <ForwardArrow />
        </Button>
      </div>
    </article>
  );
}
