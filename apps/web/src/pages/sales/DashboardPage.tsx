import { clients, salesDeals, trials, deployments, computeMarginPercent } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { ChartCard, PageHeader, PipelineBarChart, StatCard, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const activeTrials = trials.filter((t) => ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS'].includes(t.status));
  const activeDeployments = deployments.filter((d) => d.status === 'ACTIVE');
  const pipelineValue = salesDeals
    .filter((d) => !['WON', 'LOST'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);

  const dealColumns = useMemo<ColumnDef<(typeof salesDeals)[number]>[]>(
    () => [
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'title', header: 'Deal' },
      {
        accessorKey: 'stage',
        header: 'Stage',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => formatCurrency(row.original.value, row.original.currency),
      },
      { accessorKey: 'owner', header: 'Owner' },
    ],
    [],
  );

  const pipelineChart = salesDeals.map((d) => ({
    label: d.stage,
    value: d.value / 1000,
  }));

  return (
    <div>
      <PageHeader
        title="Sales Dashboard"
        description="Client accounts, trials, deployments, and revenue pipeline"
      />

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <StatCard label="Active clients" value={clients.filter((c) => c.status === 'ACTIVE').length} />
        <StatCard label="Open trials" value={activeTrials.length} />
        <StatCard label="Active deployments" value={activeDeployments.length} />
        <StatCard label="Pipeline value" value={formatCurrency(pipelineValue, 'USD')} />
      </div>

      <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
        <ChartCard title="Sales pipeline by stage">
          <PipelineBarChart data={pipelineChart} />
        </ChartCard>

        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-4 font-semibold">Margin snapshot</h3>
          <ul className="space-y-2 text-sm">
            {activeDeployments.slice(0, 4).map((d) => (
              <li key={d.id} className="flex justify-between">
                <span>{d.clientName}</span>
                <span className="font-medium text-emerald-600">
                  {computeMarginPercent(d.payRate, d.billRate)}%
                </span>
              </li>
            ))}
          </ul>
          <Link to="/sales/margin" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            View full margin report →
          </Link>
        </div>
      </div>

      <div className="px-6 pb-6">
        <h3 className="mb-4 text-lg font-semibold">Active deals</h3>
        <TanStackDataTable columns={dealColumns} data={[...salesDeals]} searchPlaceholder="Search deals…" />
      </div>
    </div>
  );
}
