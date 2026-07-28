import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency } from '@bestal/shared-utils';
import { Avatar } from '@bestal/ui';
import { CheckCircle2 } from 'lucide-react';
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
          'group flex cursor-pointer flex-col gap-4 rounded-xl border border-border/60 bg-white p-4 shadow-sm',
          'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-md',
          'sm:flex-row sm:items-center sm:justify-between',
          selected && 'border-brand/50 ring-1 ring-brand/30',
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {onSelectedChange ? (
            <SelectionCheckbox
              checked={selected}
              disabled={!canSelect}
              onChange={onSelectedChange}
            />
          ) : null}
          <Avatar
            name={record.fullName}
            src={record.photoUrl}
            size="md"
            className="h-12 w-12 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {record.displayName}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{record.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {record.community} · {record.yearsExperience} yrs
                {company ? ` · ${company}` : ''}
              </p>
            </div>
            <p className="line-clamp-1 text-xs text-foreground/80">
              {visibleSkills.join(' · ')}
              {extraSkills > 0 && <span className="text-muted-foreground"> +{extraSkills}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold tabular-nums text-foreground">
                {record.bestalScore}
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">score</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs">{record.availability}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs font-medium">
                {formatCurrency(record.hourlyRate, record.currency)}/hr
              </span>
            </div>
            <StatusLabels record={record} />
          </div>
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
        'group flex h-full cursor-pointer flex-col rounded-xl border border-border/60 bg-white shadow-sm',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-md',
        selected && 'border-brand/50 ring-1 ring-brand/30',
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          {onSelectedChange ? (
            <SelectionCheckbox
              checked={selected}
              disabled={!canSelect}
              onChange={onSelectedChange}
            />
          ) : null}
          <Avatar
            name={record.fullName}
            src={record.photoUrl}
            size="md"
            className="h-12 w-12 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {record.displayName}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
              {record.role}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {record.community}
              <span className="mx-1">·</span>
              {record.yearsExperience} yrs
            </p>
            {company ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{company}</p>
            ) : null}
          </div>
        </div>

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

        <div className="mt-3 flex items-end justify-between gap-3 border-y border-border/50 py-3">
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
