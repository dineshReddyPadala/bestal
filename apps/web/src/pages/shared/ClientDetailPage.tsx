import {
  getSchemaClient,
  schemaDeployments,
  schemaInterviewRequests,
  schemaShortlists,
  schemaTrialRequests,
} from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Avatar,
  Card,
  CardContent,
  StatCard,
  StatusBadge,
  Tabs,
  TanStackDataTable,
} from '@bestal/ui';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DetailPageShell } from '../../components/enterprise/DetailPageShell';
import { SchemaFieldGrid, clientToFields } from '../../components/enterprise/SchemaFieldGrid';
import { useDemoToast } from '../../lib/use-demo-toast';

type ClientDetailPageProps = {
  basePath: '/admin/clients' | '/sales/clients';
};

export function ClientDetailPage({ basePath }: ClientDetailPageProps) {
  const { id } = useParams();
  const { message, show } = useDemoToast();
  const client = getSchemaClient(Number(id));

  const clientDeployments = useMemo(
    () => schemaDeployments.filter((d) => d.clientId === Number(id)),
    [id],
  );
  const clientTrials = useMemo(
    () => schemaTrialRequests.filter((t) => t.clientId === Number(id)),
    [id],
  );
  const clientInterviews = useMemo(
    () => schemaInterviewRequests.filter((i) => i.clientId === Number(id)),
    [id],
  );
  const clientShortlists = useMemo(
    () => schemaShortlists.filter((s) => s.clientId === Number(id)),
    [id],
  );

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  const actions = [
    { id: 'edit', label: 'Edit Account', variant: 'outline' as const },
    { id: 'suspend', label: 'Suspend', variant: 'outline' as const },
    { id: 'activate', label: 'Activate', variant: 'primary' as const },
    { id: 'note', label: 'Add Note', variant: 'outline' as const },
    { id: 'shortlist', label: 'Create Shortlist', variant: 'outline' as const },
  ];

  return (
    <DetailPageShell
      title={client.name}
      description={`${client.industry ?? 'Enterprise'} · ${client.city ?? ''}, ${client.state ?? ''}`}
      backHref={basePath}
      backLabel="Back to clients"
      statusBadges={[client.status]}
      actions={actions}
      onAction={(actionId) =>
        show(
          {
            edit: 'Edit client form opened (demo)',
            suspend: 'Client suspended (demo)',
            activate: 'Client activated (demo)',
            note: 'Note added (demo)',
            shortlist: 'Shortlist created (demo)',
          }[actionId] ?? 'Action completed (demo)',
        )
      }
      toast={message}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Active deployments" value={String(client.activeDeployments)} />
        <StatCard label="Total spend" value={formatCurrency(client.totalSpend, 'USD')} />
        <StatCard label="Open trials" value={String(clientTrials.filter((t) => t.status !== 'COMPLETED').length)} />
        <StatCard label="Shortlists" value={String(clientShortlists.length)} />
      </div>

      <Tabs
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    <SchemaFieldGrid fields={clientToFields(client)} columns={2} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <Avatar name={client.name} src={client.logoUrl} size="lg" />
                    <h2 className="mt-4 text-lg font-semibold">{client.name}</h2>
                    <StatusBadge status={client.status} />
                    <p className="mt-2 text-sm text-muted-foreground">{client.accountManagerName}</p>
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            id: 'deployments',
            label: `Deployments (${clientDeployments.length})`,
            content: (
              <TanStackDataTable
                columns={[
                  { accessorKey: 'candidateName', header: 'Candidate' },
                  { accessorKey: 'roleTitle', header: 'Role' },
                  { accessorKey: 'billingRate', header: 'Bill Rate' },
                  { accessorKey: 'payRate', header: 'Pay Rate' },
                  { accessorKey: 'workLocation', header: 'Location' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
                  },
                ]}
                data={[...clientDeployments]}
                searchPlaceholder="Search deployments…"
              />
            ),
          },
          {
            id: 'trials',
            label: `Trials (${clientTrials.length})`,
            content: (
              <TanStackDataTable
                columns={[
                  { accessorKey: 'candidateName', header: 'Candidate' },
                  { accessorKey: 'roleTitle', header: 'Role' },
                  { accessorKey: 'durationDays', header: 'Days' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
                  },
                ]}
                data={[...clientTrials]}
                searchPlaceholder="Search trials…"
              />
            ),
          },
          {
            id: 'interviews',
            label: `Interviews (${clientInterviews.length})`,
            content: (
              <TanStackDataTable
                columns={[
                  { accessorKey: 'candidateName', header: 'Candidate' },
                  { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
                  },
                  { accessorKey: 'scheduledAt', header: 'Scheduled' },
                ]}
                data={[...clientInterviews]}
                searchPlaceholder="Search interviews…"
              />
            ),
          },
          {
            id: 'shortlists',
            label: `Shortlists (${clientShortlists.length})`,
            content: (
              <TanStackDataTable
                columns={[
                  { accessorKey: 'title', header: 'Title' },
                  { accessorKey: 'roleTitle', header: 'Role' },
                  { accessorKey: 'createdByName', header: 'Created By' },
                  { accessorKey: 'dueDate', header: 'Due Date' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
                  },
                ]}
                data={[...clientShortlists]}
                searchPlaceholder="Search shortlists…"
              />
            ),
          },
        ]}
      />
    </DetailPageShell>
  );
}
