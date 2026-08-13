import { formatCurrency } from '@bestal/shared-utils';
import {
  Avatar,
  Button,
  EmptyState,
  Select,
  StatusBadge,
  TanStackDataTable,
  useDashboardHeaderLeading,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Briefcase, Clock, Plus, Rocket } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { ClientPortalStatCard } from '../../components/client/ClientPortalStatCard';
import { ClientSegmentTabs } from '../../components/client/ClientSegmentTabs';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { RequestDeploymentDialog } from '../../components/client/RequestDeploymentDialog';
import { ExtendDeploymentDialog } from '../../components/deployments/ExtendDeploymentDialog';
import { ClientDeploymentDetailDialog } from '../../components/deployments/ClientDeploymentDetailDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useDeploymentMutations, useDeploymentsList } from '../../hooks/api/useDeployments';
import { usePermissions } from '../../hooks/usePermissions';
import type { DeploymentListItem } from '../../lib/api/types';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useOrgFormatDate } from '../../contexts/OrgSettingsContext';
import { ToastHost } from '../../components/ui/ToastHost';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

const ACTIVE_STATUSES = new Set(['ACTIVE', 'PENDING', 'ON_HOLD']);
const HISTORY_STATUSES = new Set(['COMPLETED', 'CANCELLED', 'TERMINATED']);

export function DeploymentsPage() {
  const { user } = useAuth();
  const { has } = usePermissions();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const clientId = user?.clientId ?? undefined;
  const canRequest = clientId != null && has('deployments:request');

  useDashboardHeaderLeading(
    useMemo(
      () => (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Deployments
        </span>
      ),
      [],
    ),
  );

  const { data, isLoading } = useDeploymentsList({
    limit: 100,
    sort: '-createdAt',
    ...(clientId ? { clientId } : {}),
  });
  const mutations = useDeploymentMutations();
  const formatDate = useOrgFormatDate();
  const rows = data?.data ?? [];

  const [segment, setSegment] = useState<'active' | 'history'>('active');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pickOpen, setPickOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [extendTarget, setExtendTarget] = useState<DeploymentListItem | null>(null);
  const [viewDeploymentId, setViewDeploymentId] = useState<number | null>(null);

  const active = useMemo(
    () => rows.filter((d) => ACTIVE_STATUSES.has(d.status)),
    [rows],
  );
  const history = useMemo(
    () => rows.filter((d) => HISTORY_STATUSES.has(d.status)),
    [rows],
  );
  const segmentRows = segment === 'active' ? active : history;
  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return segmentRows;
    return segmentRows.filter((row) => row.status === statusFilter);
  }, [segmentRows, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((d) => d.status === 'ACTIVE').length,
      pending: rows.filter((d) => ['PENDING', 'ON_HOLD'].includes(d.status)).length,
      completed: rows.filter((d) => d.status === 'COMPLETED').length,
    }),
    [rows],
  );

  const columns = useMemo<ColumnDef<DeploymentListItem>[]>(
    () => [
      {
        id: 'deploymentId',
        header: 'Deployment ID',
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{pad2(row.original.id)}</span>
        ),
      },
      {
        accessorKey: 'candidateName',
        header: 'Candidate Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.original.candidateName} size="sm" />
            <span className="font-medium">{row.original.candidateName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'roleTitle',
        header: 'Designation',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{(getValue() as string) || '—'}</span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? formatDate(value) : '—';
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? formatDate(value) : 'Ongoing';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'rate',
        header: 'Rate',
        cell: ({ row }) =>
          row.original.billingRate != null ? (
            <span className="tabular-nums">
              {formatCurrency(row.original.billingRate, row.original.currency ?? 'USD')}/hr
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const canExtend =
            canRequest &&
            (row.original.status === 'ACTIVE' || row.original.status === 'ON_HOLD');
          return (
            <ActionMenu
              label="Deployment actions"
              items={[
                {
                  id: 'view-deployment',
                  label: 'View details',
                  onSelect: () => setViewDeploymentId(row.original.id),
                },
                {
                  id: 'view-candidate',
                  label: 'View candidate profile',
                  href: `/client/candidates/${row.original.candidateId}`,
                  separatorBefore: true,
                },
                {
                  id: 'extend',
                  label: 'Extend',
                  hidden: !canExtend,
                  separatorBefore: true,
                  onSelect: () => setExtendTarget(row.original),
                },
              ]}
            />
          );
        },
      },
    ],
    [canRequest, formatDate],
  );

  return (
    <div className="flex h-[calc(100svh-var(--shell-header-h))] min-h-0 flex-col overflow-hidden">
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

      <div className="shrink-0 grid grid-cols-2 gap-3 px-4 pt-4 sm:px-6 xl:grid-cols-4">
        <ClientPortalStatCard
          label="Total Deployments"
          value={pad2(stats.total)}
          icon={<Rocket className="h-4 w-4" />}
          accent="brand"
        />
        <ClientPortalStatCard
          label="Active"
          value={pad2(stats.active)}
          icon={<Rocket className="h-4 w-4" />}
          accent="green"
        />
        <ClientPortalStatCard
          label="Pending / On hold"
          value={pad2(stats.pending)}
          icon={<Clock className="h-4 w-4" />}
          accent="amber"
        />
        <ClientPortalStatCard
          label="Completed"
          value={pad2(stats.completed)}
          icon={<Briefcase className="h-4 w-4" />}
          accent="blue"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
            <ClientSegmentTabs
              tabs={[
                { id: 'active', label: 'Active' },
                { id: 'history', label: 'History' },
              ]}
              activeId={segment}
              onChange={(id) => {
                setSegment(id as 'active' | 'history');
                setStatusFilter('all');
              }}
            />
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 w-[8.5rem] text-xs"
              >
                <option value="all">Filter By</option>
                {segment === 'active' ? (
                  <>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="ON_HOLD">On hold</option>
                  </>
                ) : (
                  <>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="TERMINATED">Terminated</option>
                  </>
                )}
              </Select>
              <Button
                size="sm"
                className="h-8"
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
                <Plus className="mr-1 h-3.5 w-3.5" />
                Request deployment
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 p-3 sm:p-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading deployments…</p>
            ) : filteredRows.length === 0 ? (
              <EmptyState
                icon={<Rocket className="h-8 w-8" />}
                title={segment === 'active' ? 'No active deployments' : 'No deployment history'}
                description={
                  canRequest
                    ? 'Request a deployment for a candidate from your talent search.'
                    : undefined
                }
              />
            ) : (
              <TanStackDataTable
                columns={columns}
                data={filteredRows}
                pageSize={6}
                dense
                fillHeight
                hideSearch
                emptyTitle="No deployments"
              />
            )}
          </div>
        </div>
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

      <ClientDeploymentDetailDialog
        deploymentId={viewDeploymentId}
        onClose={() => setViewDeploymentId(null)}
      />
    </div>
  );
}
