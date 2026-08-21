import { Button, Select, StatusBadge } from '@bestal/ui';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useClientEnquiryBasePath } from '../../hooks/useClientEnquiryBasePath';
import { usePermissions } from '../../hooks/usePermissions';
import {
  useClientEnquiry,
  useClientEnquiryMutations,
} from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';
import type { ClientEnquiryDetail, ClientEnquiryJob } from '../../lib/api/job-requests';

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CLOSED', label: 'Closed' },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailGrid({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm">{item.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function JobCard({ job, index }: { job: ClientEnquiryJob; index: number }) {
  return (
    <article className="rounded-md border bg-background p-4">
      <h3 className="mb-3 text-sm font-semibold">Role {index + 1}: {job.jobTitle}</h3>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap">{job.jobDescription}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Required skills</dt>
          <dd className="mt-1">{job.requiredSkills.join(', ') || '—'}</dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Experience</dt>
            <dd className="mt-1">{job.experienceRequired}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Resources</dt>
            <dd className="mt-1">{job.numberOfResources}</dd>
          </div>
        </div>
      </dl>
    </article>
  );
}

export function SuperAdminClientEnquiryDetailPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const id = Number(idParam);
  const basePath = useClientEnquiryBasePath();
  const { has } = usePermissions();
  const canWrite = has('job-requests:write');
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useClientEnquiry(id);
  const { update } = useClientEnquiryMutations();

  const enquiry = data as ClientEnquiryDetail | undefined;
  const [status, setStatus] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentStatus = status ?? enquiry?.status ?? 'SUBMITTED';
  const currentNotes = internalNotes ?? enquiry?.internalNotes ?? '';

  const jobs = useMemo(() => {
    if (enquiry?.jobs?.length) return enquiry.jobs;
    if (!enquiry) return [];
    return [
      {
        jobTitle: enquiry.jobTitle,
        jobDescription: enquiry.jobDescription,
        requiredSkills: enquiry.requiredSkills,
        experienceRequired: enquiry.experienceRequired,
        numberOfResources: enquiry.numberOfResources,
      },
    ];
  }, [enquiry]);

  async function handleSave() {
    if (!enquiry) return;
    setSaving(true);
    try {
      await update.mutateAsync({
        id: enquiry.id,
        body: {
          status: currentStatus,
          internalNotes: currentNotes.trim() ? currentNotes.trim() : null,
        },
      });
      show('Client enquiry updated');
      navigate(basePath);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update enquiry');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading client enquiry…</div>;
  }

  if (isError || !enquiry) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Client enquiry not found'}
        </p>
        <Link to={basePath} className="mt-4 inline-flex text-sm underline">
          Back to Client Enquiry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={basePath}
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Client Enquiry
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{enquiry.companyName}</h1>
            <StatusBadge status={enquiry.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{enquiry.referenceCode}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Submitted {new Date(enquiry.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <DetailSection title="Company">
            <DetailGrid
              items={[
                { label: 'Company name', value: enquiry.companyName },
                { label: 'Domain', value: enquiry.companyDomain },
                { label: 'Location', value: enquiry.location },
                { label: 'Time zone', value: enquiry.timezone },
                {
                  label: 'Website',
                  value: enquiry.website ? (
                    <a
                      href={enquiry.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline"
                    >
                      {enquiry.website}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    '—'
                  ),
                },
              ]}
            />
          </DetailSection>

          <DetailSection title="Contact">
            <DetailGrid
              items={[
                { label: 'Name', value: enquiry.contactName },
                { label: 'Email', value: enquiry.contactEmail },
                { label: 'Phone', value: enquiry.contactPhone },
              ]}
            />
          </DetailSection>

          <DetailSection title={`Roles (${jobs.length})`}>
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <JobCard key={`${job.jobTitle}-${index}`} job={job} index={index} />
              ))}
            </div>
          </DetailSection>

          {enquiry.additionalRequirements ? (
            <DetailSection title="Additional requirements">
              <p className="whitespace-pre-wrap text-sm">{enquiry.additionalRequirements}</p>
            </DetailSection>
          ) : null}

          {enquiry.attachments?.length ? (
            <DetailSection title="Attachments">
              <ul className="space-y-3">
                {enquiry.attachments.map((attachment) => (
                  <li
                    key={attachment.storageKey}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)} · {attachment.mimeType}
                      </p>
                    </div>
                    {attachment.downloadUrl ? (
                      <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm underline"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
        </div>

        <aside className="space-y-4">
          {canWrite ? (
            <DetailSection title="Manage">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select value={currentStatus} onChange={(e) => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Internal notes
                  </label>
                  <textarea
                    rows={6}
                    value={currentNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add notes for the team"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button onClick={() => void handleSave()} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </DetailSection>
          ) : (
            <DetailSection title="Status">
              <StatusBadge status={enquiry.status} />
              {enquiry.internalNotes ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {enquiry.internalNotes}
                </p>
              ) : null}
            </DetailSection>
          )}
        </aside>
      </div>
    </div>
  );
}
