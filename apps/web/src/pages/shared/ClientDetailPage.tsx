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
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DetailPageShell } from '../../components/enterprise/DetailPageShell';
import { SchemaFieldGrid, type SchemaFieldDef } from '../../components/enterprise/SchemaFieldGrid';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import { useShortlistsList } from '../../hooks/api/useShortlists';
import { useTrialsList } from '../../hooks/api/useTrials';
import { clientsApi } from '../../lib/api';
import { useDemoToast } from '../../lib/use-demo-toast';

type ClientDetailPageProps = {
  basePath: '/admin/clients' | '/sales/clients';
};

function clientOverviewFields(client: {
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactDesignation: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  companySize: string | null;
  headquarters: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  notes: string | null;
}): SchemaFieldDef[] {
  return [
    { key: 'industry', label: 'Industry', value: client.industry },
    { key: 'website', label: 'Website', value: client.website },
    { key: 'contactName', label: 'Primary contact', value: client.contactName },
    { key: 'contactDesignation', label: 'Designation', value: client.contactDesignation },
    { key: 'contactEmail', label: 'Contact email', value: client.contactEmail },
    { key: 'contactPhone', label: 'Contact phone', value: client.contactPhone },
    { key: 'companySize', label: 'Company size', value: client.companySize },
    { key: 'headquarters', label: 'Headquarters', value: client.headquarters },
    {
      key: 'location',
      label: 'Location',
      value: [client.city, client.state, client.country].filter(Boolean).join(', ') || null,
    },
    { key: 'notes', label: 'Notes', value: client.notes },
  ];
}

function clientAuditFields(client: {
  slug: string;
  accountManagerName: string | null;
  createdAt: string;
  updatedAt: string;
}): SchemaFieldDef[] {
  return [
    { key: 'slug', label: 'Slug', value: client.slug },
    { key: 'accountManager', label: 'Account manager', value: client.accountManagerName },
    { key: 'createdAt', label: 'Created', value: client.createdAt, format: 'datetime' as const },
    { key: 'updatedAt', label: 'Updated', value: client.updatedAt, format: 'datetime' as const },
  ];
}

export function ClientDetailPage({ basePath }: ClientDetailPageProps) {
  const { id } = useParams();
  const clientId = Number(id);
  const { message, dismiss } = useDemoToast();

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['clients', 'detail', clientId],
    queryFn: () => clientsApi.get(clientId),
    enabled: clientId > 0,
  });

  const { data: deploymentsData } = useDeploymentsList({
    clientId,
    limit: 100,
  });
  const { data: trialsData } = useTrialsList({ clientId, limit: 100 });
  const { data: shortlistsData } = useShortlistsList({ clientId, limit: 100 });

  const clientDeployments = deploymentsData?.data ?? [];
  const clientTrials = trialsData?.data ?? [];
  const clientShortlists = shortlistsData?.data ?? [];

  const activeDeployments = useMemo(
    () => clientDeployments.filter((d) => d.status === 'ACTIVE').length,
    [clientDeployments],
  );
  const openTrials = useMemo(
    () => clientTrials.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length,
    [clientTrials],
  );
  const totalSpend = useMemo(
    () =>
      clientDeployments.reduce((sum, d) => {
        const rate = d.billingRate ?? 0;
        const hours = d.expectedHoursPerWeek ?? 40;
        return sum + rate * hours;
      }, 0),
    [clientDeployments],
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading client…</p>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Client not found.</p>
        <Link to={basePath} className="mt-4 inline-flex text-sm font-medium text-brand hover:underline">
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <DetailPageShell
      title={client.name}
      description={`${client.industry ?? 'Enterprise'} · ${[client.city, client.state].filter(Boolean).join(', ')}`}
      backHref={basePath}
      backLabel="Back to clients"
      statusBadges={[client.status]}
      toast={message}
      onToastDismiss={dismiss}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Active deployments" value={String(activeDeployments)} />
        <StatCard label="Est. weekly bill" value={formatCurrency(totalSpend, 'USD')} />
        <StatCard label="Open trials" value={String(openTrials)} />
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
                    <SchemaFieldGrid
                      fields={clientOverviewFields(client)}
                      columns={2}
                      title="Account details"
                    />
                    <SchemaFieldGrid
                      fields={clientAuditFields(client)}
                      columns={2}
                      title="System & audit"
                      className="mt-6 border-t border-border pt-6"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <Avatar name={client.name} size="lg" />
                    <h2 className="mt-4 text-lg font-semibold">{client.name}</h2>
                    <StatusBadge status={client.status} />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {client.accountManagerName ?? 'Unassigned'}
                    </p>
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
                  {
                    id: 'billingRate',
                    header: 'Bill Rate',
                    cell: ({ row }) =>
                      row.original.billingRate != null
                        ? formatCurrency(row.original.billingRate, row.original.currency ?? 'USD')
                        : '—',
                  },
                  {
                    id: 'payRate',
                    header: 'Pay Rate',
                    cell: ({ row }) =>
                      row.original.candidatePayRate != null
                        ? formatCurrency(
                            row.original.candidatePayRate,
                            row.original.currency ?? 'USD',
                          )
                        : '—',
                  },
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
                  { accessorKey: 'startDate', header: 'Start' },
                  { accessorKey: 'endDate', header: 'End' },
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
            id: 'shortlists',
            label: `Shortlists (${clientShortlists.length})`,
            content: (
              <TanStackDataTable
                columns={[
                  { accessorKey: 'title', header: 'Title' },
                  { accessorKey: 'roleTitle', header: 'Role' },
                  { accessorKey: 'candidateCount', header: 'Candidates' },
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
