import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  Tabs,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  Download,
  FileText,
  Globe,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
  UserCircle,
  XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidate, useCandidateMutations } from '../../hooks/api/useCandidates';
import { usePermissions } from '../../hooks/usePermissions';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { CandidateDocumentDto, CandidateDto, CandidateSkillDto } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';
import { DetailPageShell, type WorkflowAction } from './DetailPageShell';
import { SchemaFieldGrid, type SchemaFieldDef } from './SchemaFieldGrid';

type CandidateDetailViewProps = {
  candidateId: number;
  basePath: '/admin/candidates' | '/recruiter/candidates';
};

function splitLines(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/\n|;|•/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function ScoreCard({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/30 p-4 text-center shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand">{value ?? '—'}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BulletList({
  items,
  variant = 'default',
}: {
  items: readonly string[];
  variant?: 'default' | 'risk';
}) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">None</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-2 text-sm ${variant === 'risk' ? 'text-amber-700' : 'text-foreground'}`}
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function DocumentSlot({
  label,
  doc,
  onDownload,
}: {
  label: string;
  doc?: CandidateDocumentDto | null;
  onDownload: (doc: CandidateDocumentDto) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-brand" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          {doc ? (
            <p className="text-xs text-muted-foreground">
              {doc.fileName} · {formatDate(doc.createdAt)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Not uploaded</p>
          )}
        </div>
      </div>
      {doc ? (
        <div className="flex items-center gap-2">
          <StatusBadge status={doc.status} className="text-[10px]" />
          <Button variant="ghost" size="sm" onClick={() => onDownload(doc)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Badge variant="outline">Missing</Badge>
      )}
    </div>
  );
}

function OverviewTab({ candidate, fullName }: { candidate: CandidateDto; fullName: string }) {
  const contactFields: SchemaFieldDef[] = [
    { key: 'fullName', label: 'Full Name', value: fullName },
    { key: 'displayName', label: 'Display Name', value: candidate.displayName },
    { key: 'email', label: 'Email', value: candidate.email },
    { key: 'phone', label: 'Phone', value: candidate.phone },
    { key: 'location', label: 'Location', value: candidate.location },
    { key: 'linkedin', label: 'LinkedIn', value: candidate.linkedinUrl, format: 'link' },
    { key: 'github', label: 'GitHub', value: candidate.githubUrl, format: 'link' },
    { key: 'naukri', label: 'Naukri', value: candidate.naukriUrl, format: 'link' },
  ];

  const professionalFields: SchemaFieldDef[] = [
    { key: 'company', label: 'Current Company', value: candidate.currentCompany },
    { key: 'role', label: 'Role', value: candidate.primaryRole },
    {
      key: 'community',
      label: 'Community',
      value: candidate.primarySkillCommunityName,
      format: 'badge',
    },
    {
      key: 'experience',
      label: 'Experience',
      value: `${candidate.yearsExperience ?? 0} years`,
    },
    { key: 'education', label: 'Education', value: candidate.education },
    { key: 'source', label: 'Source', value: candidate.source },
  ];

  const statusFields: SchemaFieldDef[] = [
    { key: 'profile', label: 'Profile Status', value: candidate.profileStatus, format: 'badge' },
    { key: 'eval', label: 'Evaluation Status', value: candidate.evaluationStatus, format: 'badge' },
    { key: 'bgv', label: 'BGV Status', value: candidate.bgvStatus, format: 'badge' },
    { key: 'visibility', label: 'Visibility', value: candidate.visibility, format: 'badge' },
    {
      key: 'deployment',
      label: 'Deployment Status',
      value: candidate.deploymentStatus,
      format: 'badge',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar
              name={fullName}
              src={candidate.profileImage?.url ?? undefined}
              size="lg"
              className="h-28 w-28"
            />
            <h2 className="mt-4 text-xl font-semibold">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{candidate.displayName || candidate.email}</p>
            <p className="mt-2 text-sm">{candidate.primaryRole || candidate.headline || '—'}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusBadge status={candidate.profileStatus ?? candidate.status} />
              <StatusBadge status={candidate.visibility} />
              <StatusBadge status={candidate.approvalStatus} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Contact & Links">
            <SchemaFieldGrid fields={contactFields} columns={2} />
          </SectionCard>
          <SectionCard title="Professional">
            <SchemaFieldGrid fields={professionalFields} columns={2} />
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ScoreCard label="BesTal Score" value={candidate.bestalScore} />
        <ScoreCard label="Technical Score" value={candidate.technicalScore} />
        <ScoreCard label="Communication Score" value={candidate.communicationScore} />
        <ScoreCard label="Reliability Score" value={candidate.reliabilityScore} />
        <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-3">
            <SchemaFieldGrid fields={statusFields} columns={1} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="AI Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {candidate.aiSummary || candidate.summary || 'No AI summary yet.'}
          </p>
        </SectionCard>
        <SectionCard title="Client Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {candidate.clientProfileSummary || candidate.summary || 'No client summary yet.'}
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Strengths">
          <BulletList items={splitLines(candidate.strengths)} />
        </SectionCard>
        <SectionCard title="Weaknesses">
          <BulletList items={splitLines(candidate.weaknesses)} />
        </SectionCard>
        <SectionCard title="Risk Flags">
          <BulletList items={splitLines(candidate.riskFlags)} variant="risk" />
        </SectionCard>
      </div>
    </div>
  );
}

export function CandidateDetailView({ candidateId, basePath }: CandidateDetailViewProps) {
  const navigate = useNavigate();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const {
    canApproveCandidates,
    canWriteCandidates,
    canUploadEvaluation,
    canUploadBgv,
    canDeleteCandidates,
  } = usePermissions();
  const { data: candidate, isLoading, isError, error } = useCandidate(candidateId);
  const mutations = useCandidateMutations();

  const skillColumns = useMemo<ColumnDef<CandidateSkillDto>[]>(
    () => [
      {
        accessorKey: 'isPrimary',
        header: 'Type',
        cell: ({ getValue }) => (
          <Badge variant={(getValue() as boolean) ? 'default' : 'secondary'}>
            {(getValue() as boolean) ? 'Primary' : 'Secondary'}
          </Badge>
        ),
      },
      {
        id: 'skill',
        header: 'Skill / Community',
        cell: ({ row }) => row.original.skillName || row.original.skillCommunityName,
      },
      {
        accessorKey: 'proficiencyLevel',
        header: 'Proficiency',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'yearsExperience', header: 'Years' },
      { accessorKey: 'notes', header: 'Notes' },
    ],
    [],
  );

  const workflowActions = useMemo(() => {
    const actions: WorkflowAction[] = [];
    const profile = (candidate?.profileStatus ?? '').toUpperCase();
    const editableStatuses = new Set([
      'SOURCED',
      'AI_SCREENED',
      'RECRUITER_SCREENED',
      'EVALUATION_PENDING',
      'EVALUATION_COMPLETE',
      'BGV_PENDING',
      'BGV_COMPLETE',
      'PROFILE_DRAFT',
    ]);
    const canEditProfile =
      canWriteCandidates &&
      (editableStatuses.has(profile) || !profile);

    if (canEditProfile) {
      actions.push({
        id: 'edit',
        label: 'Edit Profile',
        variant: 'primary',
        icon: <Pencil className="mr-1.5 h-3.5 w-3.5" />,
        to: `${basePath}/${candidateId}/edit`,
      });
    }

    if (canWriteCandidates) {
      actions.push(
        {
          id: 'run-ai',
          label: 'Run AI',
          variant: 'outline',
          icon: <Sparkles className="mr-1.5 h-3.5 w-3.5" />,
        },
        {
          id: 'upload-resume',
          label: 'Upload Resume',
          variant: 'outline',
          icon: <Upload className="mr-1.5 h-3.5 w-3.5" />,
        },
        {
          id: 'client-profile',
          label: 'Generate Client Profile',
          variant: 'outline',
          icon: <UserCircle className="mr-1.5 h-3.5 w-3.5" />,
        },
      );
    }

    if (canUploadEvaluation) {
      actions.push({
        id: 'upload-eval',
        label: 'Upload Evaluation',
        variant: 'outline',
        icon: <Upload className="mr-1.5 h-3.5 w-3.5" />,
      });
    }

    if (canUploadBgv) {
      actions.push({
        id: 'upload-bgv',
        label: 'Upload BGV',
        variant: 'outline',
        icon: <Upload className="mr-1.5 h-3.5 w-3.5" />,
      });
    }

    if (canApproveCandidates) {
      actions.push(
        {
          id: 'approve',
          label: 'Approve',
          variant: 'primary',
          icon: <CheckCircle className="mr-1.5 h-3.5 w-3.5" />,
        },
        {
          id: 'publish',
          label: 'Publish',
          variant: 'outline',
          icon: <Globe className="mr-1.5 h-3.5 w-3.5" />,
        },
        {
          id: 'reject',
          label: 'Reject',
          variant: 'outline',
          icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
        },
      );
    }

    actions.push({
      id: 'download-resume',
      label: 'Download Resume',
      variant: 'outline',
      icon: <Download className="mr-1.5 h-3.5 w-3.5" />,
    });

    if (canDeleteCandidates) {
      actions.push({
        id: 'delete',
        label: 'Delete',
        variant: 'outline',
        icon: <Trash2 className="mr-1.5 h-3.5 w-3.5" />,
      });
    }

    return actions;
  }, [
    basePath,
    candidate?.approvalStatus,
    candidate?.profileStatus,
    candidateId,
    canApproveCandidates,
    canDeleteCandidates,
    canUploadBgv,
    canUploadEvaluation,
    canWriteCandidates,
  ]);

  async function handleAction(id: string) {
    if (!candidate) return;

    try {
      switch (id) {
        case 'run-ai':
          await mutations.runAiScreening.mutateAsync({ id: candidateId });
          show('AI screening completed');
          return;
        case 'approve':
          await mutations.approve.mutateAsync(candidateId);
          show('Candidate approved');
          return;
        case 'publish':
          await mutations.publish.mutateAsync(candidateId);
          show('Candidate published to clients');
          return;
        case 'reject':
          await mutations.reject.mutateAsync({ id: candidateId });
          show('Candidate rejected');
          return;
        case 'download-resume': {
          const url = candidate.resume?.url;
          if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            show('Opening resume');
          } else {
            showError('No resume available to download');
          }
          return;
        }
        case 'upload-eval':
          navigate(`${basePath.includes('admin') ? '/admin' : '/recruiter'}/evaluations`);
          return;
        case 'upload-bgv':
          navigate(`${basePath.includes('admin') ? '/admin' : '/recruiter'}/background-checks`);
          return;
        default:
          show(
            {
              'upload-resume': 'Use Add Candidate or resume upload on the candidate draft',
              'client-profile': 'Client profile generation is not wired yet',
              delete: 'Delete is not available from this view yet',
            }[id] ?? 'Action completed',
          );
      }
    } catch (err) {
      showError(getApiErrorMessage(err, 'Action failed'));
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading candidate…
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {error ? getApiErrorMessage(error, 'Candidate not found.') : 'Candidate not found.'}
        </p>
        <button type="button" className="mt-4 text-sm text-brand" onClick={() => navigate(basePath)}>
          Back to candidates
        </button>
      </div>
    );
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const skills = candidate.skills ?? [];
  const primarySkills = skills.filter((s) => s.isPrimary);
  const secondarySkills = skills.filter((s) => !s.isPrimary);
  const billRate = candidate.clientBillRate ?? null;
  const payRate = candidate.candidatePayRate ?? null;
  const margin =
    billRate != null && payRate != null ? Number((billRate - payRate).toFixed(2)) : null;
  const marginPercent =
    billRate != null && payRate != null && billRate > 0
      ? Number((((billRate - payRate) / billRate) * 100).toFixed(1))
      : null;
  const currency = candidate.currency ?? 'USD';

  const evalFields: SchemaFieldDef[] = [
    { key: 'technical', label: 'Technical Score', value: candidate.technicalScore },
    { key: 'communication', label: 'Communication', value: candidate.communicationScore },
    {
      key: 'status',
      label: 'Evaluation Status',
      value: candidate.evaluationStatus,
      format: 'badge',
    },
  ];

  const bgvFields: SchemaFieldDef[] = [
    { key: 'status', label: 'Status', value: candidate.bgvStatus, format: 'badge' },
    {
      key: 'verified',
      label: 'Background Verified',
      value: candidate.bgvVerified ? 'Yes' : 'No',
      format: 'badge',
    },
    {
      key: 'completed',
      label: 'Completion date',
      value: candidate.bgvCompletedAt,
      format: 'date',
    },
  ];

  const availFields: SchemaFieldDef[] = [
    { key: 'avail', label: 'Availability', value: candidate.availabilityStatus },
    { key: 'start', label: 'Start Date', value: candidate.availableFrom, format: 'date' },
    { key: 'tz', label: 'Timezone', value: candidate.timezoneOverlap },
    { key: 'shift', label: 'Shift', value: candidate.preferredShift },
    { key: 'min', label: 'Min Hours / Week', value: candidate.minHoursPerWeek },
    { key: 'max', label: 'Max Hours / Week', value: candidate.maxHoursPerWeek },
  ];

  const commercialFields: SchemaFieldDef[] = [
    { key: 'bill', label: 'Bill Rate', value: billRate, format: 'currency', currency },
    { key: 'pay', label: 'Pay Rate', value: payRate, format: 'currency', currency },
    {
      key: 'margin',
      label: 'Margin',
      value: marginPercent != null ? `${marginPercent}%` : margin != null ? String(margin) : null,
    },
    { key: 'expected', label: 'Expected Rate', value: candidate.expectedRate, format: 'currency', currency },
  ];

  const timeline = [
    { id: 'created', title: 'Candidate created', description: 'Profile entered the pipeline', at: candidate.createdAt },
    candidate.submittedForApprovalAt
      ? {
          id: 'submitted',
          title: 'Submitted for approval',
          description: 'Awaiting admin review',
          at: candidate.submittedForApprovalAt,
        }
      : null,
    candidate.approvedAt
      ? {
          id: 'approved',
          title: 'Admin approved',
          description: 'Candidate approved for client visibility',
          at: candidate.approvedAt,
        }
      : null,
    candidate.publishedAt
      ? {
          id: 'published',
          title: 'Published',
          description: 'Visible to clients',
          at: candidate.publishedAt,
        }
      : null,
    candidate.rejectedAt
      ? {
          id: 'rejected',
          title: 'Rejected',
          description: candidate.rejectionReason || 'Candidate rejected',
          at: candidate.rejectedAt,
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; title: string; description: string; at: string }>;

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
    <DetailPageShell
      title={fullName}
      description={candidate.headline ?? candidate.primaryRole ?? undefined}
      backHref={basePath}
      backLabel="Back to candidates"
      statusBadges={[
        candidate.profileStatus ?? candidate.status,
        candidate.visibility,
        candidate.approvalStatus,
        candidate.deploymentStatus,
      ].filter(Boolean) as string[]}
      actions={workflowActions}
      onAction={(id) => {
        void handleAction(id);
      }}
      toast={message}
      toastVariant={variant}
    >
      <Tabs
        defaultTab="overview"
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: <OverviewTab candidate={candidate} fullName={fullName} />,
          },
          {
            id: 'skills',
            label: 'Skills',
            content: (
              <div className="space-y-6">
                <SectionCard title={`Primary Skills (${primarySkills.length})`}>
                  {primarySkills.length > 0 ? (
                    <TanStackDataTable
                      columns={skillColumns}
                      data={primarySkills}
                      searchPlaceholder="Search primary skills…"
                      pageSize={5}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No primary skills yet.</p>
                  )}
                </SectionCard>
                <SectionCard title={`Secondary Skills (${secondarySkills.length})`}>
                  {secondarySkills.length > 0 ? (
                    <TanStackDataTable
                      columns={skillColumns}
                      data={secondarySkills}
                      searchPlaceholder="Search secondary skills…"
                      pageSize={5}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No secondary skills yet.</p>
                  )}
                </SectionCard>
              </div>
            ),
          },
          {
            id: 'evaluation',
            label: 'Evaluation',
            content: (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ScoreCard label="Technical" value={candidate.technicalScore} />
                  <ScoreCard label="Communication" value={candidate.communicationScore} />
                  <ScoreCard label="BesTal" value={candidate.bestalScore} />
                </div>
                <SectionCard title="Evaluation Details">
                  <SchemaFieldGrid fields={evalFields} columns={2} />
                  <p className="mt-4 text-xs text-muted-foreground">
                    Full scorecards are managed in the Evaluation module once the profile reaches
                    Evaluation Pending.
                  </p>
                </SectionCard>
              </div>
            ),
          },
          {
            id: 'bgv',
            label: 'Background Verification',
            content: (
              <div className="space-y-6">
                <SectionCard title="BGV Status">
                  <SchemaFieldGrid fields={bgvFields} columns={2} />
                  {candidate.bgvSummary ? (
                    <p className="mt-4 text-sm text-muted-foreground">{candidate.bgvSummary}</p>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Background checks are advanced from the BGV module once Evaluation Complete is
                      reached. Admin approval marks the candidate Background Verified; publish still
                      requires all publishing rules.
                    </p>
                  )}
                </SectionCard>
              </div>
            ),
          },
          {
            id: 'availability',
            label: 'Availability',
            content: (
              <SectionCard title="Availability & Schedule">
                <SchemaFieldGrid fields={availFields} columns={2} />
              </SectionCard>
            ),
          },
          {
            id: 'commercials',
            label: 'Commercials',
            content: (
              <div className="grid gap-6 lg:grid-cols-3">
                <ScoreCard label="Bill Rate" value={billRate} />
                <ScoreCard label="Pay Rate" value={payRate} />
                <ScoreCard label="Margin %" value={marginPercent} />
                <div className="lg:col-span-3">
                  <SectionCard title="Commercial Details">
                    <SchemaFieldGrid fields={commercialFields} columns={3} />
                    {billRate != null ? (
                      <p className="mt-4 text-xs text-muted-foreground">
                        Rates shown as {formatCurrency(billRate, currency)}/hr bill
                        {payRate != null ? ` · ${formatCurrency(payRate, currency)}/hr pay` : ''}
                      </p>
                    ) : null}
                  </SectionCard>
                </div>
              </div>
            ),
          },
          {
            id: 'documents',
            label: 'Documents',
            content: (
              <div className="space-y-3">
                <DocumentSlot
                  label="Resume"
                  doc={candidate.resume}
                  onDownload={(doc) => {
                    if (doc.url) window.open(doc.url, '_blank', 'noopener,noreferrer');
                    else showError('Resume URL is not available');
                  }}
                />
                <DocumentSlot
                  label="Profile Photo"
                  doc={candidate.profileImage}
                  onDownload={(doc) => {
                    if (doc.url) window.open(doc.url, '_blank', 'noopener,noreferrer');
                    else showError('Photo URL is not available');
                  }}
                />
                <DocumentSlot
                  label="Intro Video"
                  doc={candidate.introVideo}
                  onDownload={(doc) => {
                    if (doc.url) window.open(doc.url, '_blank', 'noopener,noreferrer');
                    else showError('Video URL is not available');
                  }}
                />
              </div>
            ),
          },
          {
            id: 'timeline',
            label: 'Timeline',
            content: (
              <div className="relative space-y-0">
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No timeline events yet.</p>
                ) : (
                  timeline.map((event, idx) => (
                    <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                      {idx < timeline.length - 1 && (
                        <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
                      )}
                      <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-brand bg-background" />
                      <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                        <p className="font-medium">{event.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDate(event.at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </DetailPageShell>
    </>
  );
}
