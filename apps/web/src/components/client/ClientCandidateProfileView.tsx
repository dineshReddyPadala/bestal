import type { ClientCandidateProfile, ClientGroupedSkill } from '@bestal/mock-data';
import { COLLABORATION_CULTURAL_FIT_LABEL, cn, formatCurrency, initials } from '@bestal/shared-utils';
import { Button, Tabs } from '@bestal/ui';
import {
  BadgeCheck,
  Calendar,
  Clock,
  FlaskConical,
  Globe,
  Laptop,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ForwardArrow } from '../ui/ForwardArrow';
import {
  clientBgvStatusText,
  clientEvaluationStatusText,
  formatClientBgvLabel,
} from '../../lib/client-status-labels';

type ClientCandidateProfileViewProps = {
  profile: ClientCandidateProfile;
  onTrial: () => void;
  onRequestDeployment?: () => void;
  /** @deprecated Use onTrial */
  onPilot?: () => void;
  canRequestTrial?: boolean;
  canRequestDeployment?: boolean;
  trialBlockReason?: string | null;
  deploymentBlockReason?: string | null;
};

const PROFICIENCY_SCORE: Record<string, number> = {
  EXPERT: 96,
  ADVANCED: 88,
  INTERMEDIATE: 75,
  BEGINNER: 60,
};

function proficiencyScore(level: string): number {
  return PROFICIENCY_SCORE[level.toUpperCase()] ?? 70;
}

function skillLabel(skill: ClientGroupedSkill): string {
  return skill.skillName?.trim() || skill.skillCommunityName;
}

function ProfilePhoto({ name, src }: { name: string; src?: string | null }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src?.trim();
  const showImage = Boolean(imageSrc) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  return (
    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60 sm:h-32 sm:w-32">
      {showImage ? (
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand-light text-2xl font-semibold text-brand">
          {initials(name)}
        </div>
      )}
    </div>
  );
}

function MetadataItem({ icon: Icon, label }: { icon: typeof Laptop; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground/80" />
      <span>{label}</span>
    </span>
  );
}

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/70">
      {children}
    </span>
  );
}

function SkillBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
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
  trialBlockReason = null,
  deploymentBlockReason = null,
}: ClientCandidateProfileViewProps) {
  const rateLabel = `${formatCurrency(profile.billRate, profile.currency)}/hr`;
  const trialHandler = onTrial ?? onPilot;
  const trialRequested = Boolean(trialBlockReason);
  const trialEnabled =
    profile.trialEligible && canRequestTrial && !trialBlockReason;
  const deployEnabled =
    Boolean(onRequestDeployment) && canRequestDeployment && !deploymentBlockReason;
  const companyLine = [profile.currentCompany, profile.currentTitle].filter(Boolean).join(' | ');
  const timezoneLabel =
    profile.availabilityDetail.timezone.replace(/_/g, ' ') || profile.location;
  const locationLine = profile.location ? `${timezoneLabel}` : timezoneLabel;
  const primarySkill =
    profile.primarySkillCommunityName.trim() ||
    profile.primarySkills[0]?.skillCommunityName ||
    profile.role;
  const isExpert = profile.bestalScore >= 85;

  const rankedSkills = useMemo(() => {
    const all = [...profile.primarySkills, ...profile.secondarySkills];
    return [...all]
      .sort((a, b) => proficiencyScore(b.proficiencyLevel) - proficiencyScore(a.proficiencyLevel))
      .slice(0, 6);
  }, [profile.primarySkills, profile.secondarySkills]);

  const expertiseTags = useMemo(() => {
    const tags = new Set<string>();
    for (const domain of profile.industryExperience) tags.add(domain);
    for (const skill of [...profile.primarySkills, ...profile.secondarySkills]) {
      if (skill.skillCommunityName) tags.add(skill.skillCommunityName);
    }
    return [...tags].slice(0, 8);
  }, [profile.industryExperience, profile.primarySkills, profile.secondarySkills]);

  const evaluationScoreCards = useMemo(
    () => [
      { label: 'Technical', value: scoreOrDash(profile.evaluation.technical) },
      { label: 'Communication', value: scoreOrDash(profile.evaluation.communication) },
      {
        label: COLLABORATION_CULTURAL_FIT_LABEL,
        value: scoreOrDash(profile.evaluation.collaborationCulturalFit),
      },
      { label: 'BesTal Score', value: String(profile.bestalScore) },
    ],
    [profile.bestalScore, profile.evaluation],
  );

  const evaluationScoreGrid = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {evaluationScoreCards.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-center"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );

  const summaryTab = (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Client Summary</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.clientAiSummary.trim() || 'Summary is not available yet.'}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Evaluation scores</h3>
        {evaluationScoreGrid}
      </section>

      {rankedSkills.length > 0 ? (
        <section>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Skills</h3>
          <div className="space-y-4">
            {rankedSkills.map((skill) => (
              <SkillBar
                key={`${skill.skillCommunityName}-${skill.skillName ?? ''}`}
                label={skillLabel(skill)}
                score={proficiencyScore(skill.proficiencyLevel)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {expertiseTags.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {expertiseTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {profile.education.trim() ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Education</h3>
          <p className="text-sm text-muted-foreground">{profile.education}</p>
        </section>
      ) : null}
    </div>
  );

  const evaluationTab = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        <StatusPill>{clientEvaluationStatusText(profile.evaluation.status)}</StatusPill>
      </div>

      {evaluationScoreGrid}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Recommendation</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.evaluation.recommendation?.trim() || 'No recommendation recorded yet.'}
        </p>
      </section>
    </div>
  );

  const bgvTab = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        <StatusPill>{clientBgvStatusText(profile.bgv.status)}</StatusPill>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Summary</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.bgv.summary?.trim() || 'Background verification summary is not available yet.'}
        </p>
      </section>

      {profile.bgv.completedChecks.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Checks</h3>
          <div className="space-y-2">
            {profile.bgv.completedChecks.map((check) => (
              <div
                key={check.label}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{check.label}</span>
                <span className="text-xs font-medium text-emerald-700">
                  {formatClientBgvLabel(check.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-full bg-muted/10">
      <div className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <ProfilePhoto name={profile.fullName} src={profile.photoUrl} />

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {profile.fullName}
                  </h1>
                  {isExpert ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/70">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Expert
                    </span>
                  ) : null}
                </div>

                <div>
                  <p className="text-lg font-medium text-foreground">{profile.role}</p>
                  {companyLine ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{companyLine}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <MetadataItem icon={Laptop} label={primarySkill} />
                  <MetadataItem
                    icon={Clock}
                    label={`${profile.yearsExperience} Years Experience`}
                  />
                  <MetadataItem icon={Globe} label={locationLine} />
                  <MetadataItem icon={Calendar} label={profile.availability} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill>{clientBgvStatusText(profile.bgv.status)}</StatusPill>
                  <StatusPill>{clientEvaluationStatusText(profile.evaluation.status)}</StatusPill>
                  {profile.trialEligible ? (
                    <StatusPill>Trial: eligible</StatusPill>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {profile.bestalScore} BesTal Score
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {rateLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 xl:pt-1">
              <Button
                variant={trialRequested ? 'outline' : 'primary'}
                className={cn(
                  trialRequested &&
                    'border-border/70 bg-muted/40 text-muted-foreground disabled:opacity-100 disabled:cursor-default',
                )}
                onClick={trialRequested ? undefined : trialHandler}
                disabled={trialRequested || !trialEnabled}
                title={
                  trialRequested
                    ? 'Trial requested'
                    : trialEnabled
                      ? 'Request a trial'
                      : trialBlockReason
                        ? trialBlockReason
                        : !canRequestTrial
                          ? 'Your login is not linked to a client account'
                          : 'Candidate is not yet trial eligible'
                }
              >
                <FlaskConical className="mr-1.5 h-4 w-4" />
                {trialRequested ? 'Trial requested' : 'Request Trial'}
              </Button>
              {onRequestDeployment ? (
                <Button
                  variant="ghost"
                  onClick={onRequestDeployment}
                  disabled={!deployEnabled}
                  className={cn(!deployEnabled && 'opacity-50')}
                  title={
                    deployEnabled
                      ? 'Request deployment'
                      : deploymentBlockReason
                        ? deploymentBlockReason
                      : !canRequestDeployment
                        ? 'Your login is not linked to a client account or lacks deploy permission'
                        : 'Request deployment'
                  }
                >
                  Request Deployment
                  <ForwardArrow className="ml-1.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-border/70 bg-white p-5 shadow-sm sm:p-6">
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
