import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Briefcase, Clock, MoreHorizontal, Plus, Rocket } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { RequestDeploymentDialog } from '../../components/client/RequestDeploymentDialog';
import { ExtendDeploymentDialog } from '../../components/deployments/ExtendDeploymentDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useDeploymentMutations, useDeploymentsList } from '../../hooks/api/useDeployments';
import { usePermissions } from '../../hooks/usePermissions';
import type { DeploymentListItem } from '../../lib/api/types';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';

function ClientDeploymentActions({
  record,
  canRequest,
  onRequestExtension,
}: {
  record: DeploymentListItem;
  canRequest: boolean;
  onRequestExtension: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const canExtend =
    canRequest && (record.status === 'ACTIVE' || record.status === 'ON_HOLD');

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!canExtend) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Deployment actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          <button
            type="button"
            className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => {
              onRequestExtension();
              setOpen(false);
            }}
          >
            {record.extensionRequestedEndDate
              ? 'Update extension request'
              : 'Request extension'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DeploymentsPage() {
  const { user } = useAuth();
  const { has } = usePermissions();
  const { message, show, showError } = useDemoToast();
  const clientId = user?.clientId ?? undefined;
  const canRequest = clientId != null && has('deployments:request');

  const { data, isLoading } = useDeploymentsList({
    limit: 100,
    sort: '-createdAt',
    ...(clientId ? { clientId } : {}),
  });
  const mutations = useDeploymentMutations();
  const rows = data?.data ?? [];
  const active = rows.filter((d) => d.status === 'ACTIVE');
  const pending = rows.filter((d) => ['PENDING', 'ON_HOLD'].includes(d.status));

  const [pickOpen, setPickOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [extendTarget, setExtendTarget] = useState<DeploymentListItem | null>(null);

  const columns = useMemo<ColumnDef<DeploymentListItem>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as string}</span>
        ),
      },
      { accessorKey: 'roleTitle', header: 'Role' },
      { accessorKey: 'placementType', header: 'Type' },
      {
        id: 'rate',
        header: 'Rate',
        cell: ({ row }) =>
          row.original.billingRate != null
            ? `${formatCurrency(row.original.billingRate, row.original.currency ?? 'USD')}/hr`
            : '—',
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? formatDate(v) : '—';
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End',
        cell: ({ row }) => {
          const end = row.original.endDate;
          return (
            <div className="flex flex-col gap-0.5">
              <span>{end ? formatDate(end) : 'Ongoing'}</span>
              {row.original.extensionRequestedEndDate ? (
                <span className="text-[10px] font-medium text-amber-700">
                  Ext. requested → {row.original.extensionRequestedEndDate}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ClientDeploymentActions
            record={row.original}
            canRequest={canRequest}
            onRequestExtension={() => setExtendTarget(row.original)}
          />
        ),
      },
    ],
    [canRequest],
  );

  return (
    <div>
      <PageHeader
        title="Deployments"
        actions={
          <Button
            size="sm"
            disabled={!canRequest}
            title={
              canRequest
                ? 'Request a deployment'
                : clientId == null
                  ? 'Your login is not linked to a client account'
                  : 'Missing permission to request deployments'
            }
            onClick={() => setPickOpen(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Request deployment
          </Button>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active" value={active.length} icon={<Rocket className="h-5 w-5" />} />
          <StatCard
            label="Pending / On hold"
            value={pending.length}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            label="Total placements"
            value={rows.length}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading deployments…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Rocket className="h-8 w-8" />}
            title="No deployments yet"
            description={
              canRequest
                ? 'Request a deployment for a candidate from your talent search.'
                : 'Deployments will appear here once created.'
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <TanStackDataTable columns={columns} data={rows} pageSize={12} dense />
            </CardContent>
          </Card>
        )}
      </div>

      <PickCandidateDialog
        open={pickOpen}
        onClose={() => setPickOpen(false)}
        title="Select candidate for deployment"
        onSelect={(candidate) => {
          setSelectedCandidate({ id: candidate.id, name: candidate.fullName });
          setPickOpen(false);
          setDeployOpen(true);
        }}
      />

      {selectedCandidate ? (
        <RequestDeploymentDialog
          open={deployOpen}
          onClose={() => {
            setDeployOpen(false);
            setSelectedCandidate(null);
          }}
          candidateName={selectedCandidate.name}
          onSubmit={async (values) => {
            try {
              await mutations.request.mutateAsync({
                candidateId: selectedCandidate.id,
                roleTitle: values.roleTitle.trim(),
                placementType: values.placementType,
                startDate: values.startDate || undefined,
                endDate: values.endDate || undefined,
                workLocation: values.workLocation || undefined,
                expectedHoursPerWeek: values.expectedHoursPerWeek
                  ? Number(values.expectedHoursPerWeek)
                  : undefined,
                timezone: values.timezone || undefined,
                reportingManagerName: values.reportingManagerName || undefined,
                reportingManagerEmail: values.reportingManagerEmail || undefined,
              });
              show(`Deployment requested — ${selectedCandidate.name}`);
              setDeployOpen(false);
              setSelectedCandidate(null);
            } catch (err) {
              showError(getApiErrorMessage(err, 'Deployment request failed'));
              throw err;
            }
          }}
        />
      ) : null}

      <ExtendDeploymentDialog
        open={extendTarget != null}
        title={
          extendTarget
            ? `Request extension — ${extendTarget.candidateName}`
            : 'Request extension'
        }
        description="Send an extension request to BesTal. An admin will review and update the end date."
        initialEndDate={
          extendTarget?.extensionRequestedEndDate ?? extendTarget?.endDate ?? null
        }
        confirmLabel="Submit request"
        askReason
        onClose={() => setExtendTarget(null)}
        onSubmit={async ({ endDate, reason }) => {
          if (!extendTarget) return;
          try {
            await mutations.requestExtension.mutateAsync({
              id: extendTarget.id,
              endDate,
              reason,
            });
            show(`Extension requested — ${extendTarget.candidateName}`);
            setExtendTarget(null);
          } catch (err) {
            throw new Error(getApiErrorMessage(err, 'Extension request failed'));
          }
        }}
      />
    </div>
  );
}
