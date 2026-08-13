import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency, initials } from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { Ban, CheckCircle2, Loader2, Star } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { isBgvClear } from '../../lib/candidate-approval-gates';

export type ClientCandidateSearchCardProps = {
  record: ClientSearchRecord;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onView: () => void;
  onRequestTrial?: () => void;
  canRequestTrial?: boolean;
  className?: string;
};

function StatusRow({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: 'success' | 'warning' | 'muted';
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
      {icon}
      <span className="truncate">{label}</span>
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
    <div className="relative h-[72px] w-[72px] shrink-0">
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
  const availableNow =
    record.availabilityCategory === 'IMMEDIATE' ||
    record.availability.toLowerCase().includes('immediate') ||
    record.availability.toLowerCase().includes('available');

  return (
    <article
      className={cn(
        'relative flex h-full min-h-[252px] flex-col overflow-hidden rounded-xl border border-border/70 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md',
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

      <div className="flex min-h-0 flex-1 gap-3 pr-5">
        <div className="flex w-[84px] shrink-0 flex-col items-center gap-2">
          <ProfilePhoto
            name={record.fullName}
            src={record.photoUrl}
            verified={bgvClear && evaluationDone}
          />
          <div className="w-full space-y-1.5 text-center">
            <p className="flex items-center justify-center gap-0.5 text-[11px] font-medium text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{record.bestalScore}</span>
            </p>
            <p className="text-[10px] leading-tight text-muted-foreground">BesTal Score</p>
            <p className="flex items-center justify-center gap-1 text-[10px] text-emerald-700">
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  availableNow ? 'bg-emerald-500' : 'bg-amber-400',
                )}
              />
              {availableNow ? 'Available Now' : record.availability}
            </p>
            <p className="text-xs font-bold tabular-nums text-foreground">
              {formatCurrency(record.hourlyRate, record.currency)}
              <span className="text-[10px] font-normal text-muted-foreground">/hr</span>
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="truncate text-sm font-semibold text-brand">{record.fullName}</h3>

          {record.headline ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{record.headline}</p>
          ) : null}

          {primarySkill ? (
            <div>
              <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                Expertise
              </p>
              <span className="mt-0.5 inline-flex rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200/80">
                {primarySkill}
              </span>
            </div>
          ) : null}

          <div className="space-y-1 pt-0.5">
            {bgvClear ? (
              <StatusRow
                tone="success"
                icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
                label="BGV Clear"
              />
            ) : bgvInProgress ? (
              <StatusRow
                tone="warning"
                icon={<Loader2 className="h-3 w-3 shrink-0 animate-spin" />}
                label="BGV in Progress"
              />
            ) : (
              <StatusRow
                tone="muted"
                icon={<Loader2 className="h-3 w-3 shrink-0" />}
                label="BGV Pending"
              />
            )}
            {evaluationDone ? (
              <StatusRow
                tone="success"
                icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
                label="Evaluation Completed"
              />
            ) : (
              <StatusRow
                tone="muted"
                icon={<Loader2 className="h-3 w-3 shrink-0" />}
                label="Evaluation Pending"
              />
            )}
            {record.trialEligible ? (
              <StatusRow
                tone="success"
                icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
                label="Trial Eligible"
              />
            ) : (
              <StatusRow
                tone="muted"
                icon={<Ban className="h-3 w-3 shrink-0" />}
                label="Not eligible"
              />
            )}
          </div>

          <div className="pt-1">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Previously worked at
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-bold uppercase text-muted-foreground">
                {companyLabel(record).slice(0, 1)}
              </span>
              <span className="truncate text-xs font-semibold text-foreground">
                {companyLabel(record)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex shrink-0 gap-2 border-t border-border/50 pt-2.5">
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="h-8 flex-1 text-xs"
          disabled={!canRequestTrial || !record.trialEligible}
          onClick={(event) => {
            event.stopPropagation();
            onRequestTrial?.();
          }}
        >
          Request Trial
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onView();
          }}
        >
          Profile →
        </Button>
      </div>
    </article>
  );
}
