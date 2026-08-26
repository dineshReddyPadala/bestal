import type {
  ClientCandidateProfile,
  ClientGroupedSkill,
  ClientProfileAttachment,
} from '@bestal/mock-data';
import { COLLABORATION_CULTURAL_FIT_LABEL, cn, formatCurrency, initials } from '@bestal/shared-utils';
import { Button, Tabs } from '@bestal/ui';
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
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
  formatClientEvaluationLabel,
} from '../../lib/client-status-labels';
import { isBgvClear } from '../../lib/candidate-approval-gates';
import { DocumentPreviewDialog } from '../documents/DocumentPreviewDialog';

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

function SkillBar({
  label,
  score,
  scoreLabel,
}: {
  label: string;
  score: number;
  scoreLabel?: string;
}) {
  const displayScore = scoreLabel ?? `${score}/100`;
  const barWidth = scoreLabel === 'NA' ? 0 : Math.min(Math.max(score, 0), 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{displayScore}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

function scoreOrNa(value: number | null | undefined): string {
  return value != null ? `${normalizeScore(value)}/100` : 'NA';
}

function textOrNa(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'NA';
}

function normalizeScore(value: number): number {
  if (value <= 10) return Math.round(value * 10);
  return Math.round(value);
}

function formatAttachmentSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0) return 'NA';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAttachmentDate(value: string | null | undefined): string {
  if (!value?.trim()) return 'NA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function TabStatusLine({
  label,
  statusText,
  showCheck,
}: {
  label: string;
  statusText: string;
  showCheck?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/70">
        {showCheck ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
        {statusText}
      </span>
    </div>
  );
}

function ReportCheckRow({ label, cleared }: { label: string; cleared: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {cleared ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Clear" />
      ) : (
        <span className="text-xs font-medium text-muted-foreground">NA</span>
      )}
    </div>
  );
}

function ProfileAttachments({
  attachments,
}: {
  attachments: readonly (ClientProfileAttachment | null | undefined)[];
}) {
  const [preview, setPreview] = useState<ClientProfileAttachment | null>(null);
  const items = attachments.filter(
    (item): item is ClientProfileAttachment => Boolean(item?.fileName?.trim()),
  );

  if (items.length === 0) {
    return (
      <section>
        <p className="text-sm text-muted-foreground">No attachments</p>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-3">
        {items.map((attachment) => (
          <div
            key={attachment.fileName}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{attachment.fileName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[attachment.categoryLabel, formatAttachmentSize(attachment.fileSize), formatAttachmentDate(attachment.createdAt)]
                    .filter((part) => part && part !== 'NA')
                    .join(' · ') || 'NA'}
                </p>
              </div>
            </div>
            {attachment.url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 font-semibold text-brand"
                onClick={() => setPreview(attachment)}
              >
                View
              </Button>
            ) : (
              <span className="shrink-0 text-sm font-medium text-muted-foreground">View</span>
            )}
          </div>
        ))}
      </section>

      <DocumentPreviewDialog
        open={preview != null}
        onClose={() => setPreview(null)}
        title={preview?.fileName ?? 'Document preview'}
        url={preview?.url}
        mimeType={preview?.mimeType}
        fileName={preview?.fileName}
      />
    </>
  );
}

function isBgvCheckClear(status: string | null | undefined): boolean {
  const value = (status ?? '').toUpperCase();
  return value === 'CLEAR' || value === 'VERIFIED' || value === 'COMPLETED_CLEAR';
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

  const evaluationReportRows = useMemo(
    () => [
      { label: 'Technical', value: profile.evaluation.technical },
      { label: 'Problem solving', value: profile.evaluation.problemSolving },
      {
        label: COLLABORATION_CULTURAL_FIT_LABEL,
        value: profile.evaluation.collaborationCulturalFit,
      },
      { label: 'Communication', value: profile.evaluation.communication },
      { label: 'Client Readiness', value: profile.evaluation.clientReadinessScore },
    ],
    [profile.evaluation],
  );

  const evaluationCompleted =
    (profile.evaluation.status ?? '').toUpperCase() === 'COMPLETED';
  const bgvClear = isBgvClear(profile.bgv.status);

  const resumeTab = (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Candidate Summary</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {textOrNa(profile.clientAiSummary)}
        </p>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Skills</h3>
        {rankedSkills.length > 0 ? (
          <div className="space-y-4">
            {rankedSkills.map((skill) => (
              <SkillBar
                key={`${skill.skillCommunityName}-${skill.skillName ?? ''}`}
                label={skillLabel(skill)}
                score={proficiencyScore(skill.proficiencyLevel)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">NA</p>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Expertise</h3>
        {expertiseTags.length > 0 ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">NA</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Education</h3>
        <p className="text-sm text-muted-foreground">{textOrNa(profile.education)}</p>
      </section>

      <ProfileAttachments attachments={[profile.resumeAttachment]} />
    </div>
  );

  const evaluationTab = (
    <div className="space-y-6">
      <TabStatusLine
        label="Evaluation:"
        statusText={formatClientEvaluationLabel(profile.evaluation.status)}
        showCheck={evaluationCompleted}
      />

      <section>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Evaluation Report</h3>
        <div className="space-y-4">
          {evaluationReportRows.map((row) => (
            <SkillBar
              key={row.label}
              label={row.label}
              score={row.value != null ? normalizeScore(row.value) : 0}
              scoreLabel={scoreOrNa(row.value)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recommendation</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {textOrNa(profile.evaluation.recommendation)}
        </p>
      </section>

      <ProfileAttachments attachments={[profile.evaluation.attachment]} />
    </div>
  );

  const bgvTab = (
    <div className="space-y-6">
      <TabStatusLine
        label="BGV:"
        statusText={formatClientBgvLabel(profile.bgv.status)}
      />

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">BGV Report</h3>
        <div className="divide-y divide-border/60">
          {profile.bgv.completedChecks.length > 0 ? (
            profile.bgv.completedChecks.map((check) => (
              <ReportCheckRow
                key={check.label}
                label={check.label}
                cleared={isBgvCheckClear(check.status)}
              />
            ))
          ) : (
            <>
              <ReportCheckRow label="ID Check" cleared={bgvClear} />
              <ReportCheckRow label="Criminal Check" cleared={bgvClear} />
              <ReportCheckRow label="Employment Verification" cleared={bgvClear} />
            </>
          )}
        </div>
      </section>

      <ProfileAttachments attachments={[profile.bgv.attachment]} />
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
            defaultTab="resume"
            variant="primary"
            tabs={[
              { id: 'resume', label: 'Resume', content: resumeTab },
              { id: 'evaluation', label: 'Evaluation', content: evaluationTab },
              { id: 'bgv', label: 'BGV', content: bgvTab },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
