import { Button, Select, StatusBadge } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useContactMessage, useContactMessageMutations } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';
import { CONTACT_TOPIC_LABELS } from '../../lib/marketing-copy';
import type { ContactMessageDetail } from '../../lib/api/contact-messages';
import type { ContactTopicValue } from '../../lib/marketing-copy';

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'READ', label: 'Read' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'CLOSED', label: 'Closed' },
];

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

export function SuperAdminContactMessageDetailPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const id = Number(idParam);
  const { has } = usePermissions();
  const canWrite = has('job-requests:write');
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useContactMessage(id);
  const { update } = useContactMessageMutations();

  const record = data as ContactMessageDetail | undefined;
  const [status, setStatus] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentStatus = status ?? record?.status ?? 'SUBMITTED';
  const currentNotes = internalNotes ?? record?.internalNotes ?? '';

  const detailItems = useMemo(
    () =>
      record
        ? [
            { label: 'Reference', value: record.referenceCode },
            { label: 'Full name', value: record.fullName },
            { label: 'Email', value: record.email },
            {
              label: 'Topic',
              value: CONTACT_TOPIC_LABELS[record.topic as ContactTopicValue] ?? record.topic,
            },
            {
              label: 'Submitted',
              value: new Date(record.createdAt).toLocaleString(),
            },
            {
              label: 'Status',
              value: <StatusBadge status={record.status} />,
            },
          ]
        : [],
    [record],
  );

  async function handleSave() {
    if (!record || !canWrite) return;
    setSaving(true);
    try {
      await update.mutateAsync({
        id: record.id,
        body: {
          status: currentStatus,
          internalNotes: currentNotes.trim() || null,
        },
      });
      show('Contact message updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update message');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading contact message…</div>;
  }

  if (isError || !record) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Contact message not found'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/super-admin/client-enquiries?tab=contact-us')}>
          Back to Customer Enquiries
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/client-enquiries?tab=contact-us')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Customer Enquiries
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{record.fullName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{record.referenceCode}</p>
      </div>

      {message}

      <DetailSection title="Submission">
        <DetailGrid items={detailItems} />
      </DetailSection>

      <DetailSection title="Message">
        <p className="whitespace-pre-wrap text-sm">{record.message}</p>
      </DetailSection>

      {canWrite ? (
        <DetailSection title="Internal">
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={currentStatus}
                onChange={(event) => setStatus(event.target.value)}
              >
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
                className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={currentNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
              />
            </div>
            <div>
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </DetailSection>
      ) : null}
    </div>
  );
}
