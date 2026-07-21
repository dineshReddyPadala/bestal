import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartCard,
  PageHeader,
  RevenueAreaChart,
  StatCard,
  StatusBadge,
  Tabs,
  TanStackDataTable,
} from '@bestal/ui';
import { deployments, trials, computeMarginPercent } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { type ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminReport } from '../../hooks/api/useAdmin';

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${(Number(n) * 100).toFixed(1)}%`;
}

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '—';
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function num(n: number | null | undefined, digits = 1) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toFixed(digits);
}

function Loading() {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading report…
    </div>
  );
}

function ErrorBox({ error }: { error: unknown }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error instanceof Error ? error.message : 'Failed to load report'}
    </div>
  );
}

function RevenueReport() {
  const { data, isLoading, isError, error } = useAdminReport('revenue');
  const byClient = useMemo(
    () => ((data?.revenueByClient as Array<Record<string, unknown>>) ?? []),
    [data],
  );
  const byCommunity = useMemo(
    () => ((data?.revenueByCommunity as Array<Record<string, unknown>>) ?? []),
    [data],
  );

  const clientColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Client',
        cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
      },
      {
        accessorKey: 'revenue',
        header: 'Projected revenue',
        cell: ({ getValue }) => money(getValue() as number),
      },
      {
        accessorKey: 'margin',
        header: 'Projected margin',
        cell: ({ getValue }) => money(getValue() as number),
      },
    ],
    [],
  );

  const communityColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => [
      {
        accessorKey: 'community',
        header: 'Community',
        cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
      },
      {
        accessorKey: 'revenue',
        header: 'Projected revenue',
        cell: ({ getValue }) => money(getValue() as number),
      },
      {
        accessorKey: 'margin',
        header: 'Projected margin',
        cell: ({ getValue }) => money(getValue() as number),
      },
    ],
    [],
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorBox error={error} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active revenue" value={money(data?.activeRevenue as number)} />
        <StatCard
          label="Projected monthly revenue"
          value={money(data?.projectedMonthlyRevenue as number)}
        />
        <StatCard
          label="Projected monthly margin"
          value={money(data?.projectedMonthlyMargin as number)}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By client</CardTitle>
          </CardHeader>
          <CardContent>
            <TanStackDataTable columns={clientColumns} data={byClient} pageSize={8} dense />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By community</CardTitle>
          </CardHeader>
          <CardContent>
            <TanStackDataTable columns={communityColumns} data={byCommunity} pageSize={8} dense />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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

function MarginReport() {
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
      {
        accessorKey: 'name',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Avg margin" value={`${totals.avgMargin}%`} />
        <StatCard label="Weekly margin (all)" value={formatCurrency(totals.weekly, 'USD')} />
        <StatCard label="Active placements" value={String(rows.length)} />
      </div>
      <ChartCard title="Weekly margin by placement">
        <RevenueAreaChart data={chartData} />
      </ChartCard>
      <TanStackDataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search placements…"
        pageSize={10}
        dense
      />
    </div>
  );
}

function CandidatePipelineReport() {
  const { data, isLoading, isError, error } = useAdminReport('candidates');
  const byCommunity = useMemo(
    () => ((data?.byCommunity as Array<Record<string, unknown>>) ?? []),
    [data],
  );

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => [
      {
        accessorKey: 'communityName',
        header: 'Community',
        cell: ({ getValue }) => (
          <span className="font-medium">{String(getValue() ?? 'Unassigned')}</span>
        ),
      },
      { accessorKey: 'total', header: 'Candidates' },
      {
        accessorKey: 'averageBestalScore',
        header: 'Avg score',
        cell: ({ getValue }) => num(getValue() as number | null),
      },
      {
        accessorKey: 'averageBillRate',
        header: 'Avg bill rate',
        cell: ({ getValue }) => money(getValue() as number | null),
      },
    ],
    [],
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorBox error={error} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total candidates" value={String(data?.total ?? 0)} />
        <StatCard label="Approval rate" value={pct(data?.approvalRate as number)} />
        <StatCard label="Avg BesTal score" value={num(data?.averageBestalScore as number)} />
        <StatCard label="Avg bill rate" value={money(data?.averageBillRate as number)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline by community</CardTitle>
        </CardHeader>
        <CardContent>
          <TanStackDataTable
            columns={columns}
            data={byCommunity}
            searchPlaceholder="Search communities…"
            pageSize={8}
            dense
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ClientActivityReport() {
  const { data, isLoading, isError, error } = useAdminReport('clients');
  const rows = useMemo(
    () => ((data?.clients as Array<Record<string, unknown>>) ?? []),
    [data],
  );

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Client',
        cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
      {
        accessorKey: 'industry',
        header: 'Industry',
        cell: ({ getValue }) => String(getValue() ?? '—'),
      },
      { accessorKey: 'deploymentCount', header: 'Deployments' },
      { accessorKey: 'trialCount', header: 'Trials' },
    ],
    [],
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorBox error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Client activity</CardTitle>
      </CardHeader>
      <CardContent>
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search clients…"
          pageSize={10}
          dense
        />
      </CardContent>
    </Card>
  );
}

function RecruiterPerformanceReport() {
  const { data, isLoading, isError, error } = useAdminReport('recruiters');
  const rows = useMemo(
    () => ((data?.recruiters as Array<Record<string, unknown>>) ?? []),
    [data],
  );

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Recruiter',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{String(row.original.name)}</div>
            <div className="text-xs text-muted-foreground">{String(row.original.email)}</div>
          </div>
        ),
      },
      { accessorKey: 'candidatesAdded', header: 'Added' },
      { accessorKey: 'approved', header: 'Approved' },
      { accessorKey: 'rejected', header: 'Rejected' },
      { accessorKey: 'deployed', header: 'Deployed' },
      {
        accessorKey: 'trialConversionRate',
        header: 'Trial conversion',
        cell: ({ getValue }) => pct(getValue() as number),
      },
    ],
    [],
  );

  if (isLoading) return <Loading />;
  if (isError) return <ErrorBox error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recruiter performance</CardTitle>
      </CardHeader>
      <CardContent>
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search recruiters…"
          pageSize={10}
          dense
        />
      </CardContent>
    </Card>
  );
}

function AiPerformanceReport() {
  const { data, isLoading, isError, error } = useAdminReport('candidates');

  if (isLoading) return <Loading />;
  if (isError) return <ErrorBox error={error} />;

  const total = Number(data?.total ?? 0);
  const approvalRate = Number(data?.approvalRate ?? 0);
  const avgScore = Number(data?.averageBestalScore ?? 0);
  const screenedEstimate = Math.round(total * Math.min(1, approvalRate + 0.35));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Candidates in pipeline" value={String(total)} />
        <StatCard label="Est. AI-screened" value={String(screenedEstimate)} />
        <StatCard label="Approval rate" value={pct(approvalRate)} />
        <StatCard label="Avg BesTal score" value={num(avgScore)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Screening throughput and score quality are derived from the candidate pipeline until a
            dedicated AI telemetry endpoint is available.
          </p>
          <p>
            Track extraction success, screening completion, and score distribution here as AI usage
            grows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function SuperAdminReportsPage() {
  const [params] = useSearchParams();
  const defaultTab = params.get('tab') ?? 'revenue';

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Revenue, margin, pipeline, client activity, recruiter performance, and AI"
      />
      <div className="p-6">
        <Tabs
          defaultTab={defaultTab}
          tabs={[
            { id: 'revenue', label: 'Revenue', content: <RevenueReport /> },
            { id: 'margin', label: 'Margin', content: <MarginReport /> },
            {
              id: 'candidate-pipeline',
              label: 'Candidate pipeline',
              content: <CandidatePipelineReport />,
            },
            { id: 'client-activity', label: 'Client activity', content: <ClientActivityReport /> },
            {
              id: 'recruiter-performance',
              label: 'Recruiter performance',
              content: <RecruiterPerformanceReport />,
            },
            { id: 'ai-performance', label: 'AI performance', content: <AiPerformanceReport /> },
          ]}
        />
      </div>
    </div>
  );
}
