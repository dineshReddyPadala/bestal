import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency, initials } from '@bestal/shared-utils';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  clientBgvStatusText,
  clientEvaluationStatusText,
} from '../../lib/client-status-labels';

export type ToptalCandidateCardProps = {
  record: ClientSearchRecord;
  onView: () => void;
  /** When false, selection for free trial is disabled (e.g. client account not linked). */
  canRequestTrial?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  layout?: 'grid' | 'list';
  className?: string;
};

const MAX_SKILLS = 3;

function TrialPill({ eligible }: { eligible: boolean }) {
  if (eligible) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200/80">
        <CheckCircle2 className="h-3 w-3" />
        Trial eligible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      Trial pending
    </span>
  );
}

function StatusLabels({ record }: { record: ClientSearchRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80">
        {clientBgvStatusText(record.bgvStatus)}
      </span>
      <span className="inline-flex items-center rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80">
        {clientEvaluationStatusText(record.evaluationStatus)}
      </span>
      <TrialPill eligible={record.trialEligible} />
    </div>
  );
}

function companyLine(record: ClientSearchRecord): string | null {
  const parts = [record.currentCompany, record.currentTitle].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

function SelectionCheckbox({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        onChange(e.target.checked);
      }}
      className="h-4 w-4 shrink-0 rounded border-border text-brand focus:ring-brand disabled:opacity-40"
      aria-label="Select for free trial"
      title={disabled ? 'Not eligible for free trial' : 'Select for free trial'}
    />
  );
}

/** Full-height portrait panel — matches talent-directory card style (~45% width). */
function ProfilePhotoPanel({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src?.trim();
  const showImage = Boolean(imageSrc) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-muted',
        className,
      )}
    >
      {showImage ? (
        <img
          src={imageSrc}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand-light">
          <span className="text-3xl font-semibold tracking-tight text-brand sm:text-4xl">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}

export function ToptalCandidateCard({
  record,
  onView,
  canRequestTrial = true,
  selected = false,
  onSelectedChange,
  layout = 'grid',
  className,
}: ToptalCandidateCardProps) {
  const visibleSkills = record.topSkills.slice(0, MAX_SKILLS);
  const extraSkills = record.topSkills.length - MAX_SKILLS;
  const company = companyLine(record);
  const canSelect = record.trialEligible && canRequestTrial;

  if (layout === 'list') {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={onView}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView();
          }
        }}
        className={cn(
          'group flex cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm',
          'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-md',
          'min-h-[9.5rem] sm:min-h-[10.5rem]',
          selected && 'border-brand/50 ring-1 ring-brand/30',
          className,
        )}
      >
        <ProfilePhotoPanel
          name={record.fullName}
          src={record.photoUrl}
          className="w-[38%] max-w-[12rem] min-w-[7.5rem] self-stretch sm:w-[42%] sm:max-w-[14rem]"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {record.fullName}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{record.role}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Previously at
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {company || record.community}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {record.community} · {record.yearsExperience} yrs
            </p>
          </div>

          {visibleSkills.length > 0 ? (
            <p className="min-w-0 shrink text-xs text-foreground/80 sm:max-w-[12rem] sm:truncate lg:max-w-[16rem]">
              {visibleSkills.join(' · ')}
              {extraSkills > 0 && (
                <span className="text-muted-foreground"> +{extraSkills}</span>
              )}
            </p>
          ) : null}

          <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm sm:flex-col sm:items-end sm:gap-0.5 sm:text-right">
            <span className="font-semibold tabular-nums text-foreground">
              {record.bestalScore}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">score</span>
            </span>
            <span className="text-xs">{record.availability}</span>
            <span className="text-xs font-medium">
              {formatCurrency(record.hourlyRate, record.currency)}/hr
            </span>
          </div>

          <div className="shrink-0 sm:max-w-[11rem]">
            <StatusLabels record={record} />
          </div>

          {onSelectedChange ? (
            <div className="flex shrink-0 items-center self-start sm:self-center sm:pl-1">
              <SelectionCheckbox
                checked={selected}
                disabled={!canSelect}
                onChange={onSelectedChange}
              />
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      className={cn(
        'group flex h-full min-h-[14rem] cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-md',
        selected && 'border-brand/50 ring-1 ring-brand/30',
        className,
      )}
    >
      <ProfilePhotoPanel
        name={record.fullName}
        src={record.photoUrl}
        className="w-[44%] min-w-[7rem] self-stretch"
      />

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {record.fullName}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
              {record.role}
            </p>
          </div>
          {onSelectedChange ? (
            <SelectionCheckbox
              checked={selected}
              disabled={!canSelect}
              onChange={onSelectedChange}
            />
          ) : null}
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Previously at
        </p>
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {company || record.community}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {record.community}
          <span className="mx-1">·</span>
          {record.yearsExperience} yrs
        </p>

        {visibleSkills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80"
              >
                {skill}
              </span>
            ))}
            {extraSkills > 0 ? (
              <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                +{extraSkills}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/50 pt-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Score
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-foreground">
              {record.bestalScore}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Rate
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(record.hourlyRate, record.currency)}
              <span className="text-xs font-normal text-muted-foreground">/hr</span>
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{record.availability}</p>
          </div>
        </div>

        <div className="mt-3">
          <StatusLabels record={record} />
        </div>
      </div>
    </article>
  );
}
