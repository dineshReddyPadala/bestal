import {
  getCandidateDetailProfile,
  getSchemaCandidate,
  getSchemaDocumentsForCandidate,
  type CandidateDetailProfile,
  type SchemaCandidate,
  type SchemaDocument,
  type SchemaCandidateSkill,
} from '@bestal/mock-data';
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
  Download,
  FileText,
  Sparkles,
  Trash2,
  Upload,
  CheckCircle,
  Globe,
  XCircle,
  UserCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetailPageShell } from './DetailPageShell';
import { SchemaFieldGrid, type SchemaFieldDef } from './SchemaFieldGrid';
import { useDemoToast } from '../../lib/use-demo-toast';

type CandidateDetailViewProps = {
  candidateId: number;
  basePath: '/admin/candidates' | '/recruiter/candidates';
};

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

function BulletList({ items, variant = 'default' }: { items: readonly string[]; variant?: 'default' | 'risk' }) {
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
  doc?: SchemaDocument;
  onDownload: (name: string) => void;
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
          <Button variant="ghost" size="sm" onClick={() => onDownload(doc.fileName)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Badge variant="outline">Missing</Badge>
      )}
    </div>
  );
}

function findDoc(docs: readonly SchemaDocument[], kinds: string[]): SchemaDocument | undefined {
  return docs.find((d) => kinds.includes(d.kind));
}

function OverviewTab({
  record,
  profile,
  fullName,
}: {
  record: SchemaCandidate;
  profile: CandidateDetailProfile;
  fullName: string;
}) {
  const { overview } = profile;

  const contactFields: SchemaFieldDef[] = [
    { key: 'fullName', label: 'Full Name', value: fullName },
    { key: 'displayName', label: 'Display Name', value: overview.displayName },
    { key: 'email', label: 'Email', value: record.email },
    { key: 'phone', label: 'Phone', value: record.phone },
    { key: 'location', label: 'Location', value: record.location },
    { key: 'linkedin', label: 'LinkedIn', value: record.linkedinUrl, format: 'link' },
    { key: 'github', label: 'GitHub', value: overview.githubUrl, format: 'link' },
    { key: 'naukri', label: 'Naukri', value: overview.naukriUrl, format: 'link' },
  ];

  const professionalFields: SchemaFieldDef[] = [
    { key: 'company', label: 'Current Company', value: overview.currentCompany },
    { key: 'role', label: 'Role', value: overview.role },
    { key: 'community', label: 'Community', value: overview.community, format: 'badge' },
    { key: 'experience', label: 'Experience', value: `${record.yearsExperience ?? 0} years` },
    { key: 'education', label: 'Education', value: overview.education },
  ];

  const statusFields: SchemaFieldDef[] = [
    { key: 'eval', label: 'Evaluation Status', value: overview.evaluationStatus, format: 'badge' },
    { key: 'bgv', label: 'BGV Status', value: overview.bgvStatus, format: 'badge' },
    { key: 'visibility', label: 'Visibility', value: record.visibility, format: 'badge' },
    { key: 'deployment', label: 'Deployment Status', value: overview.deploymentStatus, format: 'badge' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar name={fullName} src={record.photoUrl} size="lg" className="h-28 w-28" />
            <h2 className="mt-4 text-xl font-semibold">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{overview.displayName}</p>
            <p className="mt-2 text-sm">{overview.role}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusBadge status={record.status} />
              <StatusBadge status={record.visibility} />
              <StatusBadge status={record.approvalStatus} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Contact & Links">
            <SchemaFieldGrid fields={contactFields} columns={2} />
          </SectionCard>
          <SectionCard title="Professional">
            <SchemaFieldGrid fields={professionalFields} columns={2} />
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ScoreCard label="BesTal Score" value={overview.bestalScore} />
        <ScoreCard label="Technical Score" value={overview.technicalScore} />
        <ScoreCard label="Communication Score" value={overview.communicationScore} />
        <ScoreCard label="Reliability Score" value={overview.reliabilityScore} />
        <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SchemaFieldGrid fields={statusFields} columns={1} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="AI Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">{overview.aiSummary}</p>
        </SectionCard>
        <SectionCard title="Client Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">{overview.clientSummary}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Strengths">
          <BulletList items={overview.strengths} />
        </SectionCard>
        <SectionCard title="Weaknesses">
          <BulletList items={overview.weaknesses} />
        </SectionCard>
        <SectionCard title="Risk Flags">
          <BulletList items={overview.riskFlags} variant="risk" />
        </SectionCard>
      </div>
    </div>
  );
}

export function CandidateDetailView({ candidateId, basePath }: CandidateDetailViewProps) {
  const navigate = useNavigate();
  const { message, show } = useDemoToast();
  const record = getSchemaCandidate(candidateId);
  const profile = getCandidateDetailProfile(candidateId);
  const docs = useMemo(() => getSchemaDocumentsForCandidate(candidateId), [candidateId]);

  const skillColumns = useMemo<ColumnDef<SchemaCandidateSkill>[]>(
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
      { accessorKey: 'skillCommunityName', header: 'Skill / Community' },
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

  if (!record || !profile) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Candidate not found.</p>
        <button type="button" className="mt-4 text-sm text-brand" onClick={() => navigate(basePath)}>
          Back to candidates
        </button>
      </div>
    );
  }

  const fullName = `${record.firstName} ${record.lastName}`;
  const primarySkills = record.skills.filter((s) => s.isPrimary);
  const secondarySkills = record.skills.filter((s) => !s.isPrimary);

  const workflowActions = [
    { id: 'run-ai', label: 'Run AI', variant: 'outline' as const, icon: <Sparkles className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'upload-resume', label: 'Upload Resume', variant: 'outline' as const, icon: <Upload className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'upload-eval', label: 'Upload Evaluation', variant: 'outline' as const, icon: <Upload className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'upload-bgv', label: 'Upload BGV', variant: 'outline' as const, icon: <Upload className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'approve', label: 'Approve', variant: 'primary' as const, icon: <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'publish', label: 'Publish', variant: 'outline' as const, icon: <Globe className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'reject', label: 'Reject', variant: 'outline' as const, icon: <XCircle className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'delete', label: 'Delete', variant: 'outline' as const, icon: <Trash2 className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'download-resume', label: 'Download Resume', variant: 'outline' as const, icon: <Download className="mr-1.5 h-3.5 w-3.5" /> },
    { id: 'client-profile', label: 'Generate Client Profile', variant: 'outline' as const, icon: <UserCircle className="mr-1.5 h-3.5 w-3.5" /> },
  ];

  function handleAction(id: string) {
    const labels: Record<string, string> = {
      'run-ai': 'AI screening started (demo)',
      'upload-resume': 'Resume upload opened (demo)',
      'upload-eval': 'Evaluation upload opened (demo)',
      'upload-bgv': 'BGV upload opened (demo)',
      approve: 'Candidate approved (demo)',
      publish: 'Candidate published to clients (demo)',
      reject: 'Candidate rejected (demo)',
      delete: 'Delete confirmation opened (demo)',
      'download-resume': 'Resume download started (demo)',
      'client-profile': 'Client profile PDF generated (demo)',
    };
    show(labels[id] ?? 'Action completed (demo)');
  }

  const { experience, evaluationDetail, bgvDetail, availabilityDetail, commercial } = profile;

  const evalFields: SchemaFieldDef[] = [
    { key: 'technical', label: 'Technical Score', value: evaluationDetail.technicalScore },
    { key: 'communication', label: 'Communication', value: evaluationDetail.communicationScore },
    { key: 'problem', label: 'Problem Solving', value: evaluationDetail.problemSolvingScore },
    { key: 'architecture', label: 'Architecture', value: evaluationDetail.architectureScore },
    { key: 'client', label: 'Client Readiness', value: evaluationDetail.clientReadinessScore },
    { key: 'rec', label: 'Recommendation', value: evaluationDetail.recommendation, format: 'badge' },
  ];

  const bgvFields: SchemaFieldDef[] = [
    { key: 'vendor', label: 'Vendor', value: bgvDetail.vendor },
    { key: 'status', label: 'Status', value: bgvDetail.status, format: 'badge' },
    { key: 'id', label: 'ID Check', value: bgvDetail.idCheck, format: 'badge' },
    { key: 'emp', label: 'Employment', value: bgvDetail.employment, format: 'badge' },
    { key: 'edu', label: 'Education', value: bgvDetail.education, format: 'badge' },
    { key: 'ref', label: 'Reference', value: bgvDetail.reference, format: 'badge' },
    { key: 'addr', label: 'Address', value: bgvDetail.address, format: 'badge' },
    { key: 'crim', label: 'Criminal', value: bgvDetail.criminal, format: 'badge' },
  ];

  const availFields: SchemaFieldDef[] = [
    { key: 'avail', label: 'Availability', value: availabilityDetail.availability },
    { key: 'start', label: 'Start Date', value: availabilityDetail.startDate, format: 'date' },
    { key: 'tz', label: 'Timezone', value: availabilityDetail.timezone },
    { key: 'shift', label: 'Shift', value: availabilityDetail.shift },
    { key: 'min', label: 'Min Hours / Week', value: availabilityDetail.minHours },
    { key: 'max', label: 'Max Hours / Week', value: availabilityDetail.maxHours },
  ];

  const commercialFields: SchemaFieldDef[] = [
    { key: 'bill', label: 'Bill Rate', value: commercial.billRate, format: 'currency', currency: commercial.currency },
    { key: 'pay', label: 'Pay Rate', value: commercial.payRate, format: 'currency', currency: commercial.currency },
    { key: 'margin', label: 'Margin', value: `${commercial.marginPercent}%` },
  ];

  return (
    <DetailPageShell
      title={fullName}
      description={record.headline ?? undefined}
      backHref={basePath}
      backLabel="Back to candidates"
      statusBadges={[record.status, record.visibility, record.approvalStatus, profile.overview.deploymentStatus]}
      actions={workflowActions}
      onAction={handleAction}
      toast={message}
    >
      <Tabs
        defaultTab="overview"
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: <OverviewTab record={record} profile={profile} fullName={fullName} />,
          },
          {
            id: 'skills',
            label: 'Skills',
            content: (
              <div className="space-y-6">
                <SectionCard title={`Primary Skills (${primarySkills.length})`}>
                  <TanStackDataTable
                    columns={skillColumns}
                    data={[...primarySkills]}
                    searchPlaceholder="Search primary skills…"
                    pageSize={5}
                  />
                </SectionCard>
                <SectionCard title={`Secondary Skills (${secondarySkills.length})`}>
                  <TanStackDataTable
                    columns={skillColumns}
                    data={[...secondarySkills]}
                    searchPlaceholder="Search secondary skills…"
                    pageSize={5}
                  />
                </SectionCard>
              </div>
            ),
          },
          {
            id: 'experience',
            label: 'Experience',
            content: (
              <div className="space-y-6">
                <SectionCard title="Project Highlights">
                  <div className="space-y-4">
                    {experience.projectHighlights.map((p) => (
                      <div key={p.title} className="rounded-lg border border-border/60 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="font-medium">{p.title}</h4>
                          <Badge variant="outline">{p.period}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-brand">{p.client}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
                <div className="grid gap-6 lg:grid-cols-2">
                  <SectionCard title="Domain Experience">
                    <div className="flex flex-wrap gap-2">
                      {experience.domainExperience.map((d) => (
                        <Badge key={d} variant="secondary">{d}</Badge>
                      ))}
                    </div>
                  </SectionCard>
                  <SectionCard title="Platforms">
                    <div className="flex flex-wrap gap-2">
                      {experience.platforms.map((p) => (
                        <Badge key={p} variant="outline">{p}</Badge>
                      ))}
                    </div>
                  </SectionCard>
                </div>
                <SectionCard title="Certifications">
                  <TanStackDataTable
                    columns={[
                      { accessorKey: 'name', header: 'Certification' },
                      { accessorKey: 'issuer', header: 'Issuer' },
                      { accessorKey: 'year', header: 'Year' },
                    ]}
                    data={[...experience.certifications]}
                    pageSize={5}
                  />
                </SectionCard>
              </div>
            ),
          },
          {
            id: 'evaluation',
            label: 'Evaluation',
            content: (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <ScoreCard label="Technical" value={evaluationDetail.technicalScore} />
                  <ScoreCard label="Communication" value={evaluationDetail.communicationScore} />
                  <ScoreCard label="Problem Solving" value={evaluationDetail.problemSolvingScore} />
                  <ScoreCard label="Architecture" value={evaluationDetail.architectureScore} />
                  <ScoreCard label="Client Readiness" value={evaluationDetail.clientReadinessScore} />
                </div>
                <SectionCard title="Evaluation Details">
                  <SchemaFieldGrid fields={evalFields} columns={2} />
                </SectionCard>
                <SectionCard title="Evaluator Comments">
                  <p className="text-sm leading-relaxed">{evaluationDetail.evaluatorComments}</p>
                </SectionCard>
                <SectionCard title="AI Evaluation Summary">
                  <p className="text-sm leading-relaxed text-muted-foreground">{evaluationDetail.aiEvaluationSummary}</p>
                </SectionCard>
                <div className="grid gap-4 md:grid-cols-2">
                  <SectionCard title="Recording">
                    {evaluationDetail.recordingUrl ? (
                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                        <span className="text-sm">Evaluation session recording</span>
                        <Button variant="outline" size="sm" onClick={() => show('Recording playback (demo)')}>
                          Play
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recording available</p>
                    )}
                  </SectionCard>
                  <SectionCard title="Evaluation PDF">
                    {evaluationDetail.evaluationPdfFileName ? (
                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                        <span className="text-sm">{evaluationDetail.evaluationPdfFileName}</span>
                        <Button variant="outline" size="sm" onClick={() => show('PDF download (demo)')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No evaluation PDF uploaded</p>
                    )}
                  </SectionCard>
                </div>
              </div>
            ),
          },
          {
            id: 'bgv',
            label: 'Background Verification',
            content: (
              <div className="space-y-6">
                <SectionCard title="BGV Checks">
                  <SchemaFieldGrid fields={bgvFields} columns={2} />
                </SectionCard>
                {bgvDetail.concernNotes && (
                  <SectionCard title="Concern Notes">
                    <p className="text-sm text-amber-700">{bgvDetail.concernNotes}</p>
                  </SectionCard>
                )}
                <SectionCard title="Summary">
                  <p className="text-sm leading-relaxed">{bgvDetail.summary}</p>
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
                <ScoreCard label="Bill Rate" value={commercial.billRate} />
                <ScoreCard label="Pay Rate" value={commercial.payRate} />
                <ScoreCard label="Margin %" value={commercial.marginPercent} />
                <div className="lg:col-span-3">
                  <SectionCard title="Commercial Details">
                    <SchemaFieldGrid fields={commercialFields} columns={3} />
                    <p className="mt-4 text-xs text-muted-foreground">
                      Rates shown as {formatCurrency(commercial.billRate, commercial.currency)}/hr bill ·{' '}
                      {formatCurrency(commercial.payRate, commercial.currency)}/hr pay
                    </p>
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
                <DocumentSlot label="Resume" doc={findDoc(docs, ['RESUME'])} onDownload={(n) => show(`Download ${n} (demo)`)} />
                <DocumentSlot label="Evaluation" doc={findDoc(docs, ['EVALUATION_FORM', 'EVALUATION'])} onDownload={(n) => show(`Download ${n} (demo)`)} />
                <DocumentSlot label="BGV" doc={findDoc(docs, ['BGV_FORM', 'BACKGROUND_CHECK'])} onDownload={(n) => show(`Download ${n} (demo)`)} />
                <DocumentSlot label="NDA" doc={findDoc(docs, ['NDA'])} onDownload={(n) => show(`Download ${n} (demo)`)} />
                <DocumentSlot label="Contract" doc={findDoc(docs, ['CONTRACT'])} onDownload={(n) => show(`Download ${n} (demo)`)} />
                <DocumentSlot label="Certifications" doc={findDoc(docs, ['CERTIFICATION', 'CERTIFICATE'])} onDownload={(n) => show(`Download ${n} (demo)`)} />
              </div>
            ),
          },
          {
            id: 'timeline',
            label: 'Timeline',
            content: (
              <div className="relative space-y-0">
                {profile.timeline.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {idx < profile.timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
                    )}
                    <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-brand bg-background" />
                    <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant="outline" className="text-[10px]">{event.type}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'activity',
            label: 'Activity',
            content: (
              <ul className="divide-y divide-border rounded-xl border border-border/80">
                {profile.activity.map((item) => (
                  <li key={item.id} className="flex gap-4 px-4 py-4 hover:bg-muted/20">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <StatusBadge status={item.status} className="text-[10px]" />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.subtitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.actor} · {formatDate(item.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </DetailPageShell>
  );
}
