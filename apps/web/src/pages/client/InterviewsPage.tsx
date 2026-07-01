import { interviews } from '@bestal/mock-data';
import {
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Calendar, Clock, ExternalLink, User } from 'lucide-react';
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

export function InterviewsPage() {
  const clientInterviews = interviews
    .filter((i) => i.clientId === DEMO_CLIENT_ID)
    .sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Scheduled and upcoming interviews with shortlisted candidates"
      />

      <div className="p-6">
        {clientInterviews.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No interviews scheduled"
            description="Interview requests will appear here once your team confirms availability."
          />
        ) : (
          <div className="grid gap-4">
            {clientInterviews.map((interview) => (
              <Card key={interview.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                          {interview.candidateName}
                        </h2>
                        <StatusBadge status={interview.status} />
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {interview.scheduledAt
                            ? formatDateTime(interview.scheduledAt)
                            : 'Awaiting scheduling'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {interview.durationMinutes} minutes · {interview.type.replace('_', ' ')}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          {interview.interviewer}
                        </span>
                      </div>

                      {interview.notes && (
                        <p className="text-sm text-muted-foreground">{interview.notes}</p>
                      )}
                    </div>

                    {interview.meetingUrl && (
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                      >
                        Join meeting
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
