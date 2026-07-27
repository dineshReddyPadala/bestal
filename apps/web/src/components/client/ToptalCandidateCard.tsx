import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency } from '@bestal/shared-utils';
import { Avatar, Button, StatusBadge } from '@bestal/ui';
import { CheckCircle2, Heart, ShieldCheck } from 'lucide-react';

export type ToptalCandidateCardProps = {
  record: ClientSearchRecord;
  shortlisted: boolean;
  onView: () => void;
  onShortlist: () => void;
  onPilot?: () => void;
  layout?: 'grid' | 'list';
  className?: string;
};

const MAX_SKILLS = 4;

function TrialPill({ eligible }: { eligible: boolean }) {
  if (eligible) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/80">
        <CheckCircle2 className="h-3 w-3" />
        Trial eligible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Trial pending
    </span>
  );
}

function CardActions({
  shortlisted,
  onView,
  onShortlist,
  onPilot,
  horizontal = false,
}: {
  shortlisted: boolean;
  onView: () => void;
  onShortlist: () => void;
  onPilot?: () => void;
  horizontal?: boolean;
}) {
  return (
    <div className={cn('flex gap-2', horizontal ? 'flex-row flex-wrap' : 'flex-col sm:flex-row')}>
      <Button variant="primary" size="sm" onClick={onView} className={cn('font-medium', !horizontal && 'sm:flex-1')}>
        View
      </Button>
      <Button
        variant={shortlisted ? 'primary' : 'outline'}
        size="sm"
        onClick={onShortlist}
        className={cn(!horizontal && 'sm:flex-1')}
      >
        <Heart className={cn('mr-1.5 h-3.5 w-3.5', shortlisted && 'fill-current')} />
        Shortlist
      </Button>
      {onPilot ? (
        <Button variant="outline" size="sm" onClick={onPilot} className={cn(!horizontal && 'sm:flex-1')}>
          Request Pilot
        </Button>
      ) : null}
    </div>
  );
}

export function ToptalCandidateCard({
  record,
  shortlisted,
  onView,
  onShortlist,
  onPilot,
  layout = 'grid',
  className,
}: ToptalCandidateCardProps) {
  const visibleSkills = record.topSkills.slice(0, MAX_SKILLS);
  const extraSkills = record.topSkills.length - MAX_SKILLS;

  if (layout === 'list') {
    return (
      <article
        className={cn(
          'group flex flex-col gap-6 rounded-2xl border border-border/60 bg-white p-6 shadow-sm',
          'transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)]',
          'sm:flex-row sm:items-center sm:justify-between',
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-5">
          <Avatar
            name={record.fullName}
            src={record.photoUrl}
            size="lg"
            className="h-[72px] w-[72px] shrink-0 ring-2 ring-transparent transition-all duration-300 group-hover:ring-brand/20"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {record.displayName}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{record.role}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {record.community} · {record.yearsExperience} years
              </p>
            </div>
            <p className="line-clamp-1 text-sm text-foreground/80">
              {visibleSkills.join(' · ')}
              {extraSkills > 0 && <span className="text-muted-foreground"> +{extraSkills}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold tabular-nums text-foreground">
                {record.bestalScore}
                <span className="ml-1 text-xs font-normal text-muted-foreground">score</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span>{record.availability}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium">
                {formatCurrency(record.hourlyRate, record.currency)}/hr
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={record.evaluationStatus} className="text-[10px]" />
              <StatusBadge status={record.bgvStatus} className="text-[10px]" />
              <TrialPill eligible={record.trialEligible} />
            </div>
          </div>
        </div>
        <div className="shrink-0 opacity-95 transition-opacity duration-300 group-hover:opacity-100 sm:w-auto">
          <CardActions
            shortlisted={shortlisted}
            onView={onView}
            onShortlist={onShortlist}
            onPilot={onPilot}
            horizontal
          />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-2xl border border-border/60 bg-white shadow-sm',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-border hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.14)]',
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-5">
          <Avatar
            name={record.fullName}
            src={record.photoUrl}
            size="lg"
            className="h-20 w-20 shrink-0 rounded-2xl ring-2 ring-transparent transition-all duration-300 group-hover:ring-brand/15 group-hover:shadow-md"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {record.displayName}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
              {record.role}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
              {record.community}
              <span className="mx-1.5 font-normal normal-case">·</span>
              {record.yearsExperience} yrs experience
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Top skills
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {visibleSkills.join(' · ')}
            {extraSkills > 0 && (
              <span className="text-muted-foreground"> +{extraSkills} more</span>
            )}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border/50 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              BesTal score
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {record.bestalScore}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Rate
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {formatCurrency(record.hourlyRate, record.currency)}
              <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{record.availability}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            BGV
          </span>
          <StatusBadge status={record.bgvStatus} className="text-[10px]" />
          <span className="mx-1 h-3 w-px bg-border" aria-hidden />
          <span className="text-[11px] text-muted-foreground">Evaluation</span>
          <StatusBadge status={record.evaluationStatus} className="text-[10px]" />
          <span className="mx-1 h-3 w-px bg-border" aria-hidden />
          <TrialPill eligible={record.trialEligible} />
        </div>
      </div>

      <div
        className={cn(
          'border-t border-border/50 bg-muted/20 px-6 py-4',
          'transition-colors duration-300 group-hover:bg-muted/35',
        )}
      >
        <CardActions
          shortlisted={shortlisted}
          onView={onView}
          onShortlist={onShortlist}
          onPilot={onPilot}
        />
      </div>
    </article>
  );
}
