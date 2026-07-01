import { interviews } from '@bestal/mock-data';
import type { MockInterview } from '@bestal/mock-data';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
  Tabs,
} from '@bestal/ui';
import { Calendar, Clock, ExternalLink, Plus, User } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function InterviewCard({ interview }: { interview: MockInterview }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{interview.candidateName}</h2>
              <StatusBadge status={interview.status} />
              <StatusBadge status={interview.type} />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                {interview.scheduledAt
                  ? formatDateTime(interview.scheduledAt)
                  : 'Awaiting scheduling'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {interview.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4 shrink-0" />
                {interview.interviewer}
              </span>
            </div>

            {interview.notes && (
              <p className="text-sm text-muted-foreground">{interview.notes}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/client/candidates/${interview.candidateId}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted/50"
            >
              View candidate
            </Link>
            {interview.meetingUrl && (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Join meeting
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewRequestsPage() {
  const clientInterviews: MockInterview[] = useMemo(
    () =>
      [...interviews]
        .filter((i) => i.clientId === DEMO_CLIENT_ID)
        .sort((a, b) => {
          if (!a.scheduledAt) return 1;
          if (!b.scheduledAt) return -1;
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        }),
    [],
  );

  const upcoming = clientInterviews.filter((i) =>
    ['SCHEDULED', 'CONFIRMED', 'REQUESTED', 'RESCHEDULED'].includes(i.status),
  );
  const completed = clientInterviews.filter((i) => i.status === 'COMPLETED');

  return (
    <div>
      <PageHeader
        title="Interview Requests"
        description="Track scheduled interviews and pending requests"
        actions={
          <Link to="/client/search">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request from search
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6">
        {clientInterviews.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No interview requests"
            description="Request interviews from candidate profiles in search."
          />
        ) : (
          <Tabs
            tabs={[
              {
                id: 'upcoming',
                label: `Upcoming (${upcoming.length})`,
                content: (
                  <div className="grid gap-4">
                    {upcoming.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming interviews.</p>
                    ) : (
                      upcoming.map((interview) => (
                        <InterviewCard key={interview.id} interview={interview} />
                      ))
                    )}
                  </div>
                ),
              },
              {
                id: 'completed',
                label: `Completed (${completed.length})`,
                content: (
                  <div className="grid gap-4">
                    {completed.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No completed interviews.</p>
                    ) : (
                      completed.map((interview) => (
                        <InterviewCard key={interview.id} interview={interview} />
                      ))
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
