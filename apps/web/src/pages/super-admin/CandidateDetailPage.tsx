import { Button, PageHeader, StatusBadge } from '@bestal/ui';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useReasonPrompt } from '../../components/super-admin/useReasonPrompt';
import { useAdminCandidate, useAdminMutations } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../../components/ui/ToastHost';

export function SuperAdminCandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  const { data, isLoading, isError, error, refetch } = useAdminCandidate(candidateId);
  const mutations = useAdminMutations();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { requestReason, reasonDialog } = useReasonPrompt();

  const c = (data?.candidate ?? {}) as Record<string, unknown>;
  const skills = (data?.skills as Array<Record<string, unknown>>) ?? [];
  const evaluations = (data?.evaluations as Array<Record<string, unknown>>) ?? [];
  const bgvs = (data?.backgroundChecks as Array<Record<string, unknown>>) ?? [];
  const documents = (data?.documents as Array<Record<string, unknown>>) ?? [];
  const activity = (data?.activityTimeline as Array<Record<string, unknown>>) ?? [];

  const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || 'Candidate';
  const approval = String(c.approvalStatus ?? '').toUpperCase();
  const visibility = String(c.visibilityStatus ?? '').toUpperCase();
  const profile = String(c.profileStatus ?? '').toUpperCase();
  const isPending =
    profile === 'PENDING_APPROVAL' ||
    (approval === 'PENDING' && Boolean(c.submittedForApprovalAt)) ||
    (profile === 'PROFILE_DRAFT' && Boolean(c.submittedForApprovalAt));
  const isPublished = visibility === 'CLIENT_VISIBLE';

  async function run(action: () => Promise<unknown>, ok: string) {
    try {
      await action();
      show(ok);
      await refetch();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Action failed');
    }
  }

  const menuItems = useMemo<ActionMenuItem[]>(() => {
    if (!data) return [];
    return [
      {
        id: 'approve-internal',
        label: 'Approve Internal Only',
        hidden: !isPending,
        onSelect: () =>
          void run(
            () => mutations.approveCandidateInternal.mutateAsync(candidateId),
            'Approved (internal)',
          ),
      },
      {
        id: 'return',
        label: 'Return to Recruiter',
        hidden: !isPending,
        onSelect: () =>
          requestReason({
            title: 'Return to Recruiter?',
            description: `${name} will be sent back to the recruiter for revision.`,
            confirmLabel: 'Return to Recruiter',
            reasonLabel: 'Reason (optional)',
            reasonPlaceholder: 'What should the recruiter address?',
            onConfirm: async (reason) => {
              await mutations.sendBackCandidate.mutateAsync({
                id: candidateId,
                reason: reason || undefined,
              });
              show('Sent back');
              await refetch();
            },
            onError: showError,
          }),
      },
      {
        id: 'publish',
        label: 'Publish',
        hidden: isPublished || isPending,
        onSelect: () =>
          void run(() => mutations.publishCandidate.mutateAsync(candidateId), 'Published'),
      },
      {
        id: 'hide',
        label: 'Hide from Clients',
        hidden: !isPublished,
        onSelect: () =>
          requestConfirm({
            title: 'Hide from Clients?',
            description: `${name} will no longer appear in the client portal.`,
            confirmLabel: 'Hide from Clients',
            destructive: true,
            onConfirm: async () => {
              await mutations.hideCandidate.mutateAsync(candidateId);
              show('Hidden');
              await refetch();
            },
          }),
      },
      {
        id: 'reject',
        label: 'Reject',
        destructive: true,
        separatorBefore: true,
        hidden: !isPending,
        onSelect: () =>
          requestReason({
            title: 'Reject Candidate?',
            description: `${name} will be rejected.`,
            confirmLabel: 'Reject',
            reasonLabel: 'Rejection reason',
            reasonRequired: true,
            reasonPlaceholder: 'Why is this candidate being rejected?',
            destructive: true,
            onConfirm: async (reason) => {
              await mutations.rejectCandidate.mutateAsync({ id: candidateId, reason });
              show('Rejected');
              await refetch();
            },
            onError: showError,
          }),
      },
      {
        id: 'archive',
        label: 'Archive Candidate',
        destructive: true,
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Archive Candidate?',
            description: `${name} will be archived.`,
            confirmLabel: 'Archive Candidate',
            destructive: true,
            onConfirm: async () => {
              await mutations.archiveCandidate.mutateAsync(candidateId);
              show('Archived');
              await refetch();
            },
          }),
      },
      {
        id: 'audit',
        label: 'View Audit History',
        href: '/super-admin/audit-logs',
        separatorBefore: true,
      },
    ];
  }, [
    candidateId,
    data,
    isPending,
    isPublished,
    mutations,
    name,
    refetch,
    requestConfirm,
    requestReason,
    show,
    showError,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Candidate not found'}
      </div>
    );
  }

  return (
    <div>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <PageHeader
        title={name}
        description={String(c.primaryRole ?? c.email ?? '')}
        actions={
          <>
            {isPending ? (
              <Button
                size="sm"
                onClick={() =>
                  void run(
                    () => mutations.approveCandidate.mutateAsync(candidateId),
                    'Approved & published',
                  )
                }
              >
                Approve & Publish
              </Button>
            ) : null}
            <ActionMenu items={menuItems} label={`Actions for ${name}`} />
          </>
        }
      />

      <div className="grid gap-4 px-6 pb-8 lg:grid-cols-2">
        <Section title="Basic details">
          <KV label="Email" value={String(c.email ?? '')} />
          <KV label="Phone" value={String(c.phone ?? '—')} />
          <KV label="Location" value={String(c.location ?? '—')} />
          <KV label="Experience" value={String(c.yearsExperience ?? '—')} />
          <KV label="Community" value={String(c.community ?? '—')} />
          <div className="flex flex-wrap gap-2 pt-1">
            {c.profileStatus ? <StatusBadge status={String(c.profileStatus)} /> : null}
            {c.visibilityStatus ? <StatusBadge status={String(c.visibilityStatus)} /> : null}
            {c.approvalStatus ? <StatusBadge status={String(c.approvalStatus)} /> : null}
          </div>
        </Section>

        <Section title="AI summary">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {String(c.aiSummary || c.summary || 'No summary')}
          </p>
        </Section>

        <Section title="Skills">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {skills.map((s) => (
                <li key={String(s.id)}>
                  {String(s.name)} {s.proficiencyLevel ? `(${String(s.proficiencyLevel)})` : ''}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Pricing (internal)">
          <KV label="Bill rate" value={c.clientBillRate != null ? `$${c.clientBillRate}` : '—'} />
          <KV label="Pay rate" value={c.candidatePayRate != null ? `$${c.candidatePayRate}` : '—'} />
          <KV label="Gross margin" value={c.grossMargin != null ? `$${c.grossMargin}` : '—'} />
        </Section>

        <Section title="Availability">
          <KV label="Status" value={String(c.availabilityStatus ?? '—')} />
        </Section>

        <Section title="Evaluation">
          {evaluations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evaluations</p>
          ) : (
            evaluations.map((e) => (
              <div key={String(e.id)} className="border-b border-border/60 py-2 text-sm last:border-0">
                {String(e.evaluatorName)} · tech {String(e.technicalScore ?? '—')}
              </div>
            ))
          )}
        </Section>

        <Section title="Background verification">
          {bgvs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No BGV records</p>
          ) : (
            bgvs.map((b) => (
              <div key={String(b.id)} className="flex items-center gap-2 py-1 text-sm">
                <StatusBadge status={String(b.status)} />
                <span>{String(b.type)}</span>
              </div>
            ))
          )}
        </Section>

        <Section title="Documents">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents</p>
          ) : (
            documents.map((d) => (
              <div key={String(d.id)} className="text-sm">
                {String(d.originalName)} ({String(d.kind)})
              </div>
            ))
          )}
        </Section>

        <Section title="Activity timeline">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity</p>
          ) : (
            activity.map((a) => (
              <div key={String(a.id)} className="border-b border-border/60 py-2 text-sm last:border-0">
                <div className="font-medium">
                  {String(a.action)} · {String(a.actorName ?? 'System')}
                </div>
                <div className="text-muted-foreground">{String(a.description ?? '')}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(String(a.createdAt)).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </Section>
      </div>
      {confirmDialog}
      {reasonDialog}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border/80 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
