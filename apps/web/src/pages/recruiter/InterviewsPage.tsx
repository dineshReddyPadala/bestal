import { interviews } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Badge,
  Card,
  CardContent,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Calendar, Clock, Video } from 'lucide-react';

export function InterviewsPage() {
  const sorted = [...interviews].sort((a, b) => {
    if (!a.scheduledAt) return 1;
    if (!b.scheduledAt) return -1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Scheduled and completed interview sessions"
      />

      <div className="space-y-3 p-6">
        {sorted.map((interview) => (
          <Card key={interview.id}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{interview.candidateName}</h3>
                  <StatusBadge status={interview.status} />
                  <Badge variant="outline">{interview.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {interview.clientName} · Interviewer: {interview.interviewer}
                </p>
                {interview.notes && (
                  <p className="text-sm text-muted-foreground">{interview.notes}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2 text-sm text-muted-foreground sm:items-end">
                {interview.scheduledAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(interview.scheduledAt)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {interview.durationMinutes} min
                </span>
                {interview.meetingUrl && (
                  <a
                    href={interview.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    Join meeting
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
