import { interviews, shortlists, trials } from '@bestal/mock-data';
import type { MockInterview } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@bestal/ui';
import {
  Calendar,
  ChevronRight,
  FlaskConical,
  Heart,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ClientCandidateCard } from '../../components/client/ClientCandidateCard';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { DEMO_CLIENT_ID, DEMO_USER } from '../../lib/demo-client';
import { getClientVisibleCandidates } from '../../lib/client-candidates';

const upcomingStatuses = new Set(['SCHEDULED', 'CONFIRMED', 'REQUESTED', 'RESCHEDULED']);

export function DashboardPage() {
  const navigate = useNavigate();
  const { shortlistedIds } = useClientShortlist();
  const visible = getClientVisibleCandidates();
  const clientInterviews: MockInterview[] = interviews.filter(
    (i) => i.clientId === DEMO_CLIENT_ID,
  );
  const upcomingInterviews = clientInterviews.filter(
    (i) => upcomingStatuses.has(i.status) && i.scheduledAt,
  );
  const pendingInterviews = clientInterviews.filter((i) => i.status === 'REQUESTED');
  const clientTrials = trials.filter((t) => t.clientId === DEMO_CLIENT_ID);
  const activeTrials = clientTrials.filter((t) =>
    ['IN_PROGRESS', 'SCHEDULED', 'REQUESTED'].includes(t.status),
  );
  const clientShortlists = shortlists.filter((s) => s.clientId === DEMO_CLIENT_ID);
  const featured = visible
    .filter((c) => shortlistedIds.includes(c.id))
    .slice(0, 2);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${DEMO_USER.name.split(' ')[0]}`}
        description={`${DEMO_USER.company} — discover and engage vetted talent`}
      />

      <div className="space-y-8 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Available Talent"
            value={visible.length}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Shortlisted"
            value={shortlistedIds.length}
            icon={<Heart className="h-5 w-5" />}
          />
          <StatCard
            label="Interview Requests"
            value={pendingInterviews.length + upcomingInterviews.length}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            label="Active Trials"
            value={activeTrials.length}
            icon={<FlaskConical className="h-5 w-5" />}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/client/search"
            className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Search className="mr-2 h-4 w-4" />
            Search candidates
          </Link>
          <Link
            to="/client/shortlisted"
            className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            View shortlist
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Upcoming Interviews</h2>
                <Link
                  to="/client/interviews"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No interviews scheduled.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingInterviews.slice(0, 3).map((interview) => (
                    <li
                      key={interview.id}
                      className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{interview.candidateName}</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.scheduledAt
                            ? formatDate(interview.scheduledAt)
                            : 'TBD'}{' '}
                          · {interview.type.replace('_', ' ')}
                        </p>
                      </div>
                      <StatusBadge status={interview.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Trial Requests</h2>
                <Link
                  to="/client/trials"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {activeTrials.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active trials.</p>
              ) : (
                <ul className="space-y-3">
                  {activeTrials.slice(0, 3).map((trial) => (
                    <li
                      key={trial.id}
                      className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{trial.candidateName}</p>
                        <p className="text-sm text-muted-foreground">{trial.title}</p>
                      </div>
                      <StatusBadge status={trial.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Your Shortlisted Talent</h2>
                <Link
                  to="/client/shortlisted"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {featured.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Shortlist candidates from search to track them here.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {featured.map((candidate) => (
                    <ClientCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      shortlisted
                      compact
                      onView={() => navigate(`/client/candidates/${candidate.id}`)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <h2 className="font-semibold text-foreground">Recruiter Shortlists</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {clientShortlists.map((sl) => (
                  <div key={sl.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{sl.title}</p>
                      <StatusBadge status={sl.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{sl.jobTitle}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {sl.entries.length} candidates · {sl.createdBy}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
