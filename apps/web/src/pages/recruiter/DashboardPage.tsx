import { candidates, evaluations, interviews } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@bestal/ui';
import { Calendar, ClipboardCheck, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const upcomingInterviews = interviews
  .filter((i) => i.status === 'SCHEDULED' || i.status === 'CONFIRMED')
  .slice(0, 5);

export function DashboardPage() {
  const activeCandidates = candidates.filter((c) => c.status === 'ACTIVE').length;
  const pendingEvaluations = evaluations.filter((e) => e.status === 'IN_PROGRESS').length;
  const scheduledInterviews = interviews.filter(
    (i) => i.status === 'SCHEDULED' || i.status === 'CONFIRMED',
  ).length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your recruiting pipeline at a glance"
        actions={
          <Link
            to="/recruiter/candidates"
            className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Browse talent
          </Link>
        }
      />

      <div className="space-y-8 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active candidates"
            value={activeCandidates}
            change={12}
            changeLabel="this month"
            icon={<UserCheck className="h-5 w-5" />}
          />
          <StatCard
            label="In evaluation"
            value={pendingEvaluations}
            icon={<ClipboardCheck className="h-5 w-5" />}
          />
          <StatCard
            label="Upcoming interviews"
            value={scheduledInterviews}
            change={8}
            changeLabel="this week"
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            label="Total pipeline"
            value={candidates.length}
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Interviews</CardTitle>
            <Link to="/recruiter/interviews" className="text-sm font-medium text-brand hover:underline">
              View schedule
            </Link>
          </CardHeader>
          <CardContent>
            <DataTable>
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead>Candidate</DataTableHead>
                  <DataTableHead>Client</DataTableHead>
                  <DataTableHead>Type</DataTableHead>
                  <DataTableHead>Scheduled</DataTableHead>
                  <DataTableHead>Status</DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {upcomingInterviews.map((interview) => (
                  <DataTableRow key={interview.id}>
                    <DataTableCell className="font-medium">{interview.candidateName}</DataTableCell>
                    <DataTableCell>{interview.clientName}</DataTableCell>
                    <DataTableCell>{interview.type}</DataTableCell>
                    <DataTableCell className="text-muted-foreground">
                      {interview.scheduledAt ? formatDate(interview.scheduledAt) : '—'}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge status={interview.status} />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
