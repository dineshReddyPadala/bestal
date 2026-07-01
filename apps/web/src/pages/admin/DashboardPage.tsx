import {
  adminKpis,
  deploymentTrend,
  evaluations,
  evaluationsByStatus,
  pipelineByStage,
  revenueByMonth,
  trials,
} from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartCard,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DeploymentBarChart,
  PageHeader,
  PipelineBarChart,
  RevenueAreaChart,
  StatCard,
  StatusBadge,
  StatusPieChart,
} from '@bestal/ui';
import {
  DollarSign,
  Eye,
  FlaskConical,
  Percent,
  Rocket,
  ShieldCheck,
  ClipboardCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdminKpi } from '@bestal/mock-data';

function formatKpiValue(kpi: AdminKpi) {
  if (kpi.format === 'currency' && typeof kpi.value === 'number') {
    return formatCurrency(kpi.value);
  }
  if (kpi.format === 'percent') return `${kpi.value}%`;
  if (typeof kpi.value === 'number') return kpi.value.toLocaleString();
  return String(kpi.value);
}

const kpiIcons: Record<string, React.ReactNode> = {
  'total-candidates': <Users className="h-5 w-5" />,
  'client-visible': <Eye className="h-5 w-5" />,
  'pending-evaluation': <ClipboardCheck className="h-5 w-5" />,
  'pending-bgv': <ShieldCheck className="h-5 w-5" />,
  trials: <FlaskConical className="h-5 w-5" />,
  deployments: <Rocket className="h-5 w-5" />,
  revenue: <DollarSign className="h-5 w-5" />,
  margin: <Percent className="h-5 w-5" />,
};

export function DashboardPage() {
  const activeTrials = trials.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED');
  const pendingEvals = evaluations.filter(
    (e) => e.status === 'DRAFT' || e.status === 'IN_PROGRESS',
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform KPIs, pipeline health, and revenue performance"
      />

      <div className="space-y-8 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminKpis.map((kpi) => (
            <StatCard
              key={kpi.id}
              label={kpi.label}
              value={formatKpiValue(kpi)}
              change={kpi.change}
              changeLabel={kpi.changeLabel}
              icon={kpiIcons[kpi.id]}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Revenue & Margin" description="Monthly GMV and platform margin (YTD)">
            <RevenueAreaChart data={revenueByMonth} />
          </ChartCard>

          <ChartCard title="Deployments" description="Active placements and new starts per month">
            <DeploymentBarChart data={deploymentTrend} />
          </ChartCard>

          <ChartCard title="Talent Pipeline" description="Candidates by funnel stage">
            <PipelineBarChart data={pipelineByStage} />
          </ChartCard>

          <ChartCard title="Evaluations" description="Assessment status breakdown">
            <StatusPieChart data={evaluationsByStatus} />
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Trials</CardTitle>
              <Link to="/admin/trials" className="text-sm font-medium text-brand hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Candidate</DataTableHead>
                    <DataTableHead>Client</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {activeTrials.slice(0, 5).map((trial) => (
                    <DataTableRow key={trial.id}>
                      <DataTableCell className="font-medium">{trial.candidateName}</DataTableCell>
                      <DataTableCell>{trial.clientName}</DataTableCell>
                      <DataTableCell>
                        <StatusBadge status={trial.status} />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Evaluations</CardTitle>
              <Link
                to="/admin/evaluations"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Candidate</DataTableHead>
                    <DataTableHead>Community</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {pendingEvals.map((evaluation) => (
                    <DataTableRow key={evaluation.id}>
                      <DataTableCell className="font-medium">
                        {evaluation.candidateName}
                      </DataTableCell>
                      <DataTableCell className="text-muted-foreground">
                        {evaluation.skillCommunity}
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge status={evaluation.status} />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
