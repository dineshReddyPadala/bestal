import type { ClientCandidateProfile } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { Avatar, Badge, Button, Tabs } from '@bestal/ui';
import { ArrowLeft, Calendar, FlaskConical, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clientBgvStatusText,
  clientEvaluationStatusText,
  formatClientBgvLabel,
  formatClientEvaluationLabel,
} from '../../lib/client-status-labels';

type ClientCandidateProfileViewProps = {
  profile: ClientCandidateProfile;
  onTrial: () => void;
  onRequestDeployment?: () => void;
  /** @deprecated Use onTrial */
  onPilot?: () => void;
  /** When false, Free trial is disabled (e.g. client account not linked). */
  canRequestTrial?: boolean;
  canRequestDeployment?: boolean;
};

function ScoreDisplay({ score }: { score: number }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        BesTal score
      </p>
      <p className="mt-0.5 flex items-center justify-center gap-1 text-2xl font-bold tabular-nums">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        {score}
      </p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function scoreOrDash(value: number | null | undefined): string {
  return value != null ? String(value) : '—';
}

export function ClientCandidateProfileView({
  profile,
  onTrial,
  onRequestDeployment,
  onPilot,
  canRequestTrial = true,
  canRequestDeployment = true,
}: ClientCandidateProfileViewProps) {
  const rateLabel = `${formatCurrency(profile.billRate, profile.currency)}/hr`;
  const trialHandler = onTrial ?? onPilot;
  const companyLine = [profile.currentCompany, profile.currentTitle].filter(Boolean).join(' · ');
  const trialEnabled = profile.trialEligible && canRequestTrial;
  const deployEnabled = Boolean(onRequestDeployment) && canRequestDeployment;

  const summaryTab = (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Client AI Summary
        </h3>
        <p className="text-base leading-relaxed text-foreground/90">{profile.clientAiSummary}</p>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Strengths
        </h3>
        {profile.strengths.length > 0 ? (
          <ul className="space-y-2">
            {profile.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm leading-relaxed text-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No strengths listed yet.</p>
        )}
      </section>
      {profile.industryExperience.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Industry Experience
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.industryExperience.map((d) => (
              <Badge key={d} variant="secondary" className="font-normal">
                {d}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );

  const evaluationTab = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        <Badge variant="secondary">{formatClientEvaluationLabel(profile.evaluation.status)}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricPill label="Technical" value={scoreOrDash(profile.evaluation.technical)} />
        <MetricPill label="Communication" value={scoreOrDash(profile.evaluation.communication)} />
        <MetricPill label="Architecture" value={scoreOrDash(profile.evaluation.architecture)} />
        <MetricPill label="BesTal score" value={String(profile.bestalScore)} />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recommendation
        </h3>
        <p className="text-sm leading-relaxed text-foreground/90">
          {profile.evaluation.recommendation?.trim() || 'No recommendation recorded yet.'}
        </p>
      </section>
    </div>
  );

  const bgvTab = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        <Badge variant="secondary">{formatClientBgvLabel(profile.bgv.status)}</Badge>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Summary
        </h3>
        <p className="text-sm leading-relaxed text-foreground/90">
          {profile.bgv.summary?.trim() || 'Background verification summary is not available yet.'}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Checks
        </h3>
        {profile.bgv.completedChecks.length > 0 ? (
          <div className="space-y-2">
            {profile.bgv.completedChecks.map((check) => (
              <div
                key={check.label}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{check.label}</span>
                <Badge variant="outline" className="font-normal">
                  {formatClientBgvLabel(check.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Individual check details are not available. Overall status:{' '}
            {formatClientBgvLabel(profile.bgv.status)}.
          </p>
        )}
      </section>
    </div>
  );

  return (
    <div className="min-h-full bg-muted/10">
      <div className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <Link
            to="/client/search"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to search
          </Link>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar
                name={profile.fullName}
                src={profile.photoUrl}
                size="lg"
                className="h-24 w-24 shrink-0 rounded-2xl ring-2 ring-border/40 sm:h-28 sm:w-28"
              />
              <div className="min-w-0 space-y-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {profile.displayName}
                  </h1>
                  <p className="mt-1 text-lg text-muted-foreground">{profile.role}</p>
                  {companyLine ? (
                    <p className="mt-1 text-sm text-muted-foreground">{companyLine}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {profile.location}
                  </span>
                  <span>{profile.yearsExperience} years experience</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {profile.bestalScore} BesTal
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {profile.availability}
                  </span>
                  <span className="font-semibold text-foreground">{rateLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-xs font-medium text-foreground/80">
                    {clientBgvStatusText(profile.bgv.status)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-xs font-medium text-foreground/80">
                    {clientEvaluationStatusText(profile.evaluation.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:shrink-0">
              <Button
                variant="primary"
                onClick={trialHandler}
                disabled={!trialEnabled}
                title={
                  trialEnabled
                    ? 'Request a free trial'
                    : !canRequestTrial
                      ? 'Your login is not linked to a client account'
                      : 'Candidate is not yet trial eligible'
                }
              >
                <FlaskConical className="mr-1.5 h-4 w-4" />
                Free trial
              </Button>
              {onRequestDeployment ? (
                <Button
                  variant="outline"
                  onClick={onRequestDeployment}
                  disabled={!deployEnabled}
                  title={
                    deployEnabled
                      ? 'Request deployment'
                      : !canRequestDeployment
                        ? 'Your login is not linked to a client account or lacks deploy permission'
                        : 'Request deployment'
                  }
                >
                  Request deployment
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
            <MetricPill label="Experience" value={`${profile.yearsExperience} yrs`} />
            <MetricPill label="Score" value={String(profile.bestalScore)} />
            <MetricPill label="Rate" value={rateLabel} />
            <div className="col-span-2 sm:col-span-1">
              <ScoreDisplay score={profile.bestalScore} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:p-8">
          <Tabs
            defaultTab="summary"
            tabs={[
              { id: 'summary', label: 'Summary', content: summaryTab },
              { id: 'evaluation', label: 'Evaluation', content: evaluationTab },
              { id: 'bgv', label: 'BGV', content: bgvTab },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
