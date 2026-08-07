import { formatDate } from '@bestal/shared-utils';
import {
  Avatar,
  Badge,
  Button,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ClipboardList,
  Clock3,
  FileStack,
  Layers,
  Link2,
  Loader2,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidate, useCandidateMutations } from '../../hooks/api/useCandidates';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import { getApiErrorMessage } from '../../lib/api/errors';
import { uploadCandidateFile } from '../../lib/api/candidates';
import type { CandidateSkillDto } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';
import { DetailPageShell } from './DetailPageShell';
import { SchemaFieldGrid, type SchemaFieldDef } from './SchemaFieldGrid';
import {
  DocumentAssetRow,
  ModernScoreTile,
  ModernSection,
  profileTabClass,
} from './candidate-detail-ui';

type CandidateDetailViewProps = {
  candidateId: number;
  basePath: '/admin/candidates' | '/recruiter/candidates';
};

type TabId = 'overview' | 'skills' | 'evaluation' | 'bgv' | 'documents' | 'timeline';

const TABS: { id: TabId; label: string; icon: typeof UserCircle }[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle },
  { id: 'skills', label: 'Skills', icon: Layers },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardList },
  { id: 'bgv', label: 'BGV', icon: ShieldCheck },
  { id: 'documents', label: 'Documents', icon: FileStack },
  { id: 'timeline', label: 'Timeline', icon: Clock3 },
];

function splitLines(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/\n|;|•/)
    .map((part) => part.trim())
    .filter(Boolean);
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
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-2 text-sm ${variant === 'risk' ? 'text-amber-700' : 'text-foreground/90'}`}
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CandidateDetailView({ candidateId, basePath }: CandidateDetailViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const {
    canWriteCandidates,
    canUploadEvaluation,
    canUploadBgv,
    canDeleteCandidates,
  } = usePermissions();
  const { data: candidate, isLoading, isError, error, refetch } = useCandidate(candidateId);
  const mutations = useCandidateMutations();

  const evaluationsPath = basePath.startsWith('/admin')
    ? '/admin/evaluations'
    : '/recruiter/evaluations';
  const bgvPath = basePath.includes('admin') ? '/admin/background-checks' : '/recruiter/background-checks';
  const isAdminPortal =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || basePath.startsWith('/admin');

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

  async function handleAction(id: string) {
    if (!candidate) return;
    try {
      switch (id) {
        case 'run-ai':
          await mutations.runAiScreening.mutateAsync({ id: candidateId });
          show('AI screening completed');
          await refetch();
          return;
        case 'share-link': {
          const url = `${window.location.origin}/client/candidates/${candidateId}`;
          await navigator.clipboard.writeText(url);
          show('Shareable client link copied to clipboard');
          return;
        }
        case 'approve':
          await mutations.approve.mutateAsync(candidateId);
          show('Candidate approved');
          await refetch();
          return;
        case 'publish':
          await mutations.publish.mutateAsync(candidateId);
          show('Candidate published to clients');
          await refetch();
          return;
        case 'reject':
          await mutations.reject.mutateAsync({ id: candidateId });
          show('Candidate rejected');
          await refetch();
          return;
        case 'view-eval':
        case 'upload-eval':
          navigate(`${evaluationsPath}?candidateId=${candidateId}`);
          return;
        case 'upload-bgv':
          navigate(`${bgvPath}?candidateId=${candidateId}`);
          return;
        case 'delete':
          showError('Delete is not available from this view yet');
          return;
        default:
          break;
      }
    } catch (err) {
      showError(getApiErrorMessage(err, 'Action failed'));
    }
  }

  async function uploadAsset(
    kind: 'resume' | 'profile-image' | 'intro-video',
    file: File,
    label: string,
  ) {
    setUploadingKind(kind);
    try {
      await uploadCandidateFile(candidateId, kind, file);
      show(`${label} uploaded`);
      await refetch();
    } catch (err) {
      showError(getApiErrorMessage(err, `Failed to upload ${label.toLowerCase()}`));
    } finally {
      setUploadingKind(null);
    }
  }

  function openDoc(doc: { url?: string | null }, label: string) {
    if (doc.url) window.open(doc.url, '_blank', 'noopener,noreferrer');
    else showError(`${label} URL is not available`);
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
  const sortedSkills = [...skills].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });
  const profile = (candidate.profileStatus ?? '').toUpperCase();
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
    canWriteCandidates && (editableStatuses.has(profile) || !profile);

  const billRate = candidate.clientBillRate ?? null;
  const payRate = candidate.candidatePayRate ?? null;
  const marginPercent =
    billRate != null && payRate != null && billRate > 0
      ? Number((((billRate - payRate) / billRate) * 100).toFixed(1))
      : null;
  const currency = candidate.currency ?? 'USD';

  const contactFields: SchemaFieldDef[] = [
    { key: 'fullName', label: 'Full Name', value: fullName },
    { key: 'displayName', label: 'Display Name', value: candidate.displayName },
    { key: 'email', label: 'Email', value: candidate.email },
    { key: 'phone', label: 'Phone', value: candidate.phone },
    { key: 'location', label: 'Location', value: candidate.location },
    { key: 'linkedin', label: 'LinkedIn', value: candidate.linkedinUrl, format: 'link' },
    { key: 'github', label: 'GitHub', value: candidate.githubUrl, format: 'link' },
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
  ];

  const statusFields: SchemaFieldDef[] = [
    { key: 'eval', label: 'Evaluation', value: candidate.evaluationStatus, format: 'badge' },
    { key: 'bgv', label: 'BGV', value: candidate.bgvStatus, format: 'badge' },
    {
      key: 'deployment',
      label: 'Deployment',
      value: candidate.deploymentStatus,
      format: 'badge',
    },
  ];

  const availFields: SchemaFieldDef[] = [
    { key: 'avail', label: 'Availability', value: candidate.availabilityStatus },
    { key: 'start', label: 'Start Date', value: candidate.availableFrom, format: 'date' },
    { key: 'tz', label: 'Timezone', value: candidate.timezoneOverlap },
    { key: 'shift', label: 'Shift', value: candidate.preferredShift },
  ];

  const commercialFields: SchemaFieldDef[] = [
    { key: 'bill', label: 'Bill Rate', value: billRate, format: 'currency', currency },
    { key: 'pay', label: 'Pay Rate', value: payRate, format: 'currency', currency },
    {
      key: 'margin',
      label: 'Margin',
      value: marginPercent != null ? `${marginPercent}%` : null,
    },
  ];

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

  const tabContent: Record<TabId, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModernScoreTile label="BesTal Score" value={candidate.bestalScore} />
          <ModernScoreTile label="Technical" value={candidate.technicalScore} accent="emerald" />
          <ModernScoreTile label="Communication" value={candidate.communicationScore} accent="amber" />
          <ModernScoreTile label="Reliability" value={candidate.reliabilityScore} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ModernSection title="Contact & Links">
            <SchemaFieldGrid fields={contactFields} columns={2} />
          </ModernSection>
          <ModernSection title="Professional">
            <SchemaFieldGrid fields={professionalFields} columns={2} />
          </ModernSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ModernSection title="Pipeline Status">
            <SchemaFieldGrid fields={statusFields} columns={1} />
          </ModernSection>
          <ModernSection title="Availability">
            <SchemaFieldGrid fields={availFields} columns={1} />
          </ModernSection>
          <ModernSection title="Commercials">
            <SchemaFieldGrid fields={commercialFields} columns={1} />
          </ModernSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ModernSection
            title="AI Summary"
            action={
              canWriteCandidates ? (
                <Button variant="ghost" size="sm" onClick={() => void handleAction('run-ai')}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Run AI
                </Button>
              ) : null
            }
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {candidate.aiSummary || candidate.summary || 'No AI summary yet.'}
            </p>
          </ModernSection>
          <ModernSection title="Client Summary">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {candidate.clientProfileSummary || candidate.summary || 'No client summary yet.'}
            </p>
          </ModernSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ModernSection title="Strengths">
            <BulletList items={splitLines(candidate.strengths)} />
          </ModernSection>
          <ModernSection title="Weaknesses">
            <BulletList items={splitLines(candidate.weaknesses)} />
          </ModernSection>
          <ModernSection title="Risk Flags">
            <BulletList items={splitLines(candidate.riskFlags)} variant="risk" />
          </ModernSection>
        </div>
      </div>
    ),
    skills: (
      <ModernSection title={`Skills (${skills.length})`} description="Primary and secondary skills">
        {sortedSkills.length > 0 ? (
          <TanStackDataTable
            columns={skillColumns}
            data={sortedSkills}
            hideSearch
            dense
            pageSize={10}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No skills yet.</p>
        )}
      </ModernSection>
    ),
    evaluation: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <ModernScoreTile label="Technical" value={candidate.technicalScore} />
          <ModernScoreTile label="Communication" value={candidate.communicationScore} accent="emerald" />
          <ModernScoreTile label="BesTal Score" value={candidate.bestalScore} accent="amber" />
        </div>
        <ModernSection
          title="Evaluation Details"
          description="Scorecards and reports from the evaluation module"
          action={
            isAdminPortal || canUploadEvaluation ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => void handleAction('view-eval')}>
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                  View Evaluation
                </Button>
                {canUploadEvaluation ? (
                  <Button variant="ghost" size="sm" onClick={() => void handleAction('upload-eval')}>
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload Evaluation
                  </Button>
                ) : null}
              </div>
            ) : null
          }
        >
          <SchemaFieldGrid fields={evalFields} columns={2} />
        </ModernSection>
      </div>
    ),
    bgv: (
      <ModernSection
        title="Background Verification"
        description="Verification status and report"
        action={
          canUploadBgv ? (
            <Button variant="ghost" size="sm" onClick={() => void handleAction('upload-bgv')}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload BGV
            </Button>
          ) : null
        }
      >
        <SchemaFieldGrid fields={bgvFields} columns={2} />
        {candidate.bgvSummary ? (
          <p className="mt-4 rounded-lg bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
            {candidate.bgvSummary}
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Upload the BGV report from the Documents tab or the BGV module.
          </p>
        )}
      </ModernSection>
    ),
    documents: (
      <ModernSection
        title="Documents & Assets"
        description="Upload or download candidate files"
      >
        <div className="space-y-3">
          <DocumentAssetRow
            label="Resume"
            description="PDF or Word resume"
            doc={candidate.resume}
            accept=".pdf,.doc,.docx,application/pdf"
            canUpload={canWriteCandidates}
            onUpload={(file) => void uploadAsset('resume', file, 'Resume')}
            onDownload={(doc) => openDoc(doc, 'Resume')}
          />
          <DocumentAssetRow
            label="Profile Photo"
            doc={candidate.profileImage}
            accept="image/*"
            canUpload={canWriteCandidates}
            onUpload={(file) => void uploadAsset('profile-image', file, 'Profile photo')}
            onDownload={(doc) => openDoc(doc, 'Profile photo')}
          />
          <DocumentAssetRow
            label="Intro Video"
            doc={candidate.introVideo}
            accept="video/*"
            canUpload={canWriteCandidates}
            onUpload={(file) => void uploadAsset('intro-video', file, 'Intro video')}
            onDownload={(doc) => openDoc(doc, 'Intro video')}
          />
          <DocumentAssetRow
            label="Evaluation Report"
            description="Managed in Evaluations module"
            canUpload={canUploadEvaluation}
            accept=".pdf,.doc,.docx"
            onUpload={() => void handleAction('upload-eval')}
          />
          <DocumentAssetRow
            label="BGV Report"
            description="Managed in Background Checks module"
            canUpload={canUploadBgv}
            accept=".pdf,.doc,.docx"
            onUpload={() => void handleAction('upload-bgv')}
          />
        </div>
        {uploadingKind ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading {uploadingKind.replace('-', ' ')}…
          </p>
        ) : null}
      </ModernSection>
    ),
    timeline: (
      <ModernSection title="Activity Timeline" description="Key milestones for this candidate">
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No timeline events yet.</p>
        ) : (
          <div className="relative space-y-0">
            {timeline.map((event, idx) => (
              <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                {idx < timeline.length - 1 ? (
                  <div className="absolute left-[13px] top-7 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-brand/40 to-border" />
                ) : null}
                <div className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand/30 bg-brand/10 shadow-[0_0_12px_rgba(var(--brand-rgb,59,130,246),0.15)]">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-border/50 bg-gradient-to-br from-muted/20 to-transparent p-4">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  <p className="mt-2 text-xs tabular-nums text-muted-foreground/80">
                    {formatDate(event.at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModernSection>
    ),
  };

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <DetailPageShell
        title={fullName}
        description={candidate.headline ?? candidate.primaryRole ?? undefined}
        backHref={basePath}
        backLabel="Back to candidates"
      >
        <div className="mb-6 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-brand/[0.04] p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar
              name={fullName}
              src={candidate.profileImage?.url ?? undefined}
              size="lg"
              className="h-24 w-24 ring-2 ring-brand/20"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{fullName}</h2>
              <p className="text-sm text-muted-foreground">
                {candidate.primaryRole || candidate.headline || candidate.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={candidate.profileStatus ?? candidate.status} />
                <StatusBadge status={candidate.visibility} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canEditProfile ? (
                <Button variant="primary" size="sm" to={`${basePath}/${candidateId}/edit`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              ) : null}
              {canWriteCandidates ? (
                <Button variant="outline" size="sm" onClick={() => void handleAction('share-link')}>
                  <Link2 className="mr-1.5 h-3.5 w-3.5" />
                  Shareable Link
                </Button>
              ) : null}
              {canDeleteCandidates ? (
                <Button variant="ghost" size="sm" onClick={() => void handleAction('delete')}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border/50 bg-muted/25 p-1.5 backdrop-blur-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={profileTabClass(activeTab === tab.id)}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div>{tabContent[activeTab]}</div>
      </DetailPageShell>
    </>
  );
}
