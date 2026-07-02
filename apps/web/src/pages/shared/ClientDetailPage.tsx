import { clients, deployments, trials, interviews, shortlists } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  StatCard,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marginColumns } from '../../lib/margin-columns';
import { useDemoToast } from '../../lib/use-demo-toast';

type ClientDetailPageProps = {
  basePath: '/admin/clients' | '/sales/clients';
};

export function ClientDetailPage({ basePath }: ClientDetailPageProps) {
  const { id } = useParams();
  const { message, show } = useDemoToast();
  const client = clients.find((c) => c.id === Number(id));

  const clientDeployments = useMemo(
    () => deployments.filter((d) => d.clientId === Number(id)),
    [id],
  );
  const clientTrials = useMemo(() => trials.filter((t) => t.clientId === Number(id)), [id]);
  const clientInterviews = useMemo(
    () => interviews.filter((i) => i.clientId === Number(id)),
    [id],
  );
  const clientShortlists = useMemo(
    () => shortlists.filter((s) => s.clientId === Number(id)),
    [id],
  );

  const deploymentCols = useMemo<ColumnDef<(typeof deployments)[number]>[]>(
    () => [
      { accessorKey: 'candidateName', header: 'Candidate' },
      { accessorKey: 'title', header: 'Role' },
      ...marginColumns<(typeof deployments)[number]>(),
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
    ],
    [],
  );

  if (!client) {
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
    <div>
      <PageHeader
        title={client.name}
        description={`${client.industry} · ${client.location}`}
        breadcrumbs={
          <Link to={basePath} className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to clients
          </Link>
        }
        actions={
          <Button variant="outline" onClick={() => show('Edit client form opened (demo)')}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit account
          </Button>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <StatCard label="Active deployments" value={String(client.activeDeployments)} />
        <StatCard label="Total spend" value={formatCurrency(client.totalSpend, client.currency)} />
        <StatCard label="Open trials" value={String(clientTrials.filter((t) => t.status !== 'COMPLETED').length)} />
        <StatCard label="Shortlists" value={String(clientShortlists.length)} />
      </div>

      <div className="grid gap-6 px-6 pb-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar name={client.name} src={client.logoUrl} size="lg" />
              <div>
                <p className="font-semibold">{client.name}</p>
                <StatusBadge status={client.status} />
              </div>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account manager</dt>
                <dd className="font-medium">{client.accountManager}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Employees</dt>
                <dd>{client.employeeCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Website</dt>
                <dd>
                  <a href={client.website} className="text-brand hover:underline" target="_blank" rel="noreferrer">
                    {client.website.replace('https://', '')}
                  </a>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {clientInterviews.slice(0, 3).map((i) => (
                <li key={i.id} className="flex justify-between border-b border-border pb-2">
                  <span>Interview: {i.candidateName}</span>
                  <StatusBadge status={i.status} />
                </li>
              ))}
              {clientTrials.slice(0, 2).map((t) => (
                <li key={t.id} className="flex justify-between border-b border-border pb-2">
                  <span>Trial: {t.candidateName}</span>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 px-6 pb-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Deployments</h3>
          <TanStackDataTable
            columns={deploymentCols}
            data={clientDeployments}
            searchPlaceholder="Search deployments…"
          />
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Trial requests</h3>
          <TanStackDataTable
            columns={[
              { accessorKey: 'candidateName', header: 'Candidate' },
              { accessorKey: 'title', header: 'Role' },
              { accessorKey: 'pilotType', header: 'Pilot', cell: ({ getValue }) => (getValue() as string).replace(/_/g, ' ') },
              ...marginColumns<(typeof trials)[number]>(),
              { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
            ]}
            data={clientTrials}
            searchPlaceholder="Search trials…"
          />
        </div>
      </div>
    </div>
  );
}
