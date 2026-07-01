import { deployments, trials, computeMarginPercent } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { ChartCard, PageHeader, RevenueAreaChart, StatCard, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

type MarginRow = {
  id: number;
  type: string;
  name: string;
  clientName: string;
  payRate: number;
  billRate: number;
  currency: string;
  hoursPerWeek: number;
  marginPercent: number;
  weeklyMargin: number;
};

export function MarginReportPage() {
  const rows = useMemo<MarginRow[]>(() => {
    const deploymentRows = deployments.map((d) => {
      const margin = computeMarginPercent(d.payRate, d.billRate);
      return {
        id: d.id,
        type: 'Deployment',
        name: d.candidateName,
        clientName: d.clientName,
        payRate: d.payRate,
        billRate: d.billRate,
        currency: d.currency,
        hoursPerWeek: d.hoursPerWeek,
        marginPercent: margin,
        weeklyMargin: (d.billRate - d.payRate) * d.hoursPerWeek,
      };
    });
    const trialRows = trials.map((t) => {
      const margin = computeMarginPercent(t.payRate, t.billRate);
      return {
        id: t.id + 1000,
        type: 'Trial',
        name: t.candidateName,
        clientName: t.clientName,
        payRate: t.payRate,
        billRate: t.billRate,
        currency: t.currency,
        hoursPerWeek: t.hoursPerWeek,
        marginPercent: margin,
        weeklyMargin: (t.billRate - t.payRate) * t.hoursPerWeek,
      };
    });
    return [...deploymentRows, ...trialRows];
  }, []);

  const totals = useMemo(() => {
    const weekly = rows.reduce((sum, r) => sum + r.weeklyMargin, 0);
    const avgMargin =
      rows.length > 0 ? rows.reduce((sum, r) => sum + r.marginPercent, 0) / rows.length : 0;
    return { weekly, avgMargin: Math.round(avgMargin * 10) / 10 };
  }, [rows]);

  const chartData = useMemo(
    () =>
      rows.slice(0, 8).map((r) => ({
        label: r.name.split(' ')[0] ?? r.name,
        value: r.weeklyMargin,
        value2: r.marginPercent,
      })),
    [rows],
  );

  const columns = useMemo<ColumnDef<MarginRow>[]>(
    () => [
      { accessorKey: 'type', header: 'Type' },
      { accessorKey: 'name', header: 'Candidate', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: 'clientName', header: 'Client' },
      {
        id: 'pay',
        header: 'Pay Rate',
        cell: ({ row }) => formatCurrency(row.original.payRate, row.original.currency) + '/hr',
      },
      {
        id: 'bill',
        header: 'Bill Rate',
        cell: ({ row }) => formatCurrency(row.original.billRate, row.original.currency) + '/hr',
      },
      {
        accessorKey: 'marginPercent',
        header: 'Margin %',
        cell: ({ getValue }) => (
          <span className="font-medium text-emerald-600">{getValue() as number}%</span>
        ),
      },
      {
        accessorKey: 'weeklyMargin',
        header: 'Weekly Margin',
        cell: ({ row }) => formatCurrency(row.original.weeklyMargin, row.original.currency),
      },
      { accessorKey: 'hoursPerWeek', header: 'Hrs/Wk' },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Margin Report"
        description="Bill rate, pay rate, and margin across trials and deployments"
      />

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <StatCard label="Avg margin" value={`${totals.avgMargin}%`} />
        <StatCard label="Weekly margin (all)" value={formatCurrency(totals.weekly, 'USD')} />
        <StatCard label="Active placements" value={String(rows.length)} />
      </div>

      <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
        <ChartCard title="Weekly margin by placement">
          <RevenueAreaChart data={chartData} />
        </ChartCard>
      </div>

      <div className="px-6 pb-6">
        <TanStackDataTable columns={columns} data={rows} searchPlaceholder="Search placements…" />
      </div>
    </div>
  );
}
