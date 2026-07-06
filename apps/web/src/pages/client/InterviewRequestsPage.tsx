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
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { RequestInterviewDialog } from '../../components/client/RequestInterviewDialog';
import { useClientInterviewRequests } from '../../hooks/useClientEngagementRequests';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { useDemoToast } from '../../lib/use-demo-toast';

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
  const { message, show } = useDemoToast();
  const { shortlistedIds } = useClientShortlist();
  const { interviews: clientInterviews, addRequest } = useClientInterviewRequests();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);

  const sortedInterviews = useMemo(
    () =>
      [...clientInterviews].sort((a, b) => {
        if (!a.scheduledAt) return 1;
        if (!b.scheduledAt) return -1;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      }),
    [clientInterviews],
  );

  const upcoming = sortedInterviews.filter((i) =>
    ['SCHEDULED', 'CONFIRMED', 'REQUESTED', 'RESCHEDULED'].includes(i.status),
  );
  const completed = sortedInterviews.filter((i) => i.status === 'COMPLETED');

  return (
    <div>
      <PageHeader
        title="Interview Requests"
        description="Track scheduled interviews and pending requests"
        actions={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Request interview
          </Button>
        }
      />

      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {sortedInterviews.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No interview requests"
            description="Choose a published candidate and submit an interview request."
            action={{ label: 'Request interview', onClick: () => setPickerOpen(true) }}
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

      <PickCandidateDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Select candidate for interview"
        shortlistedIds={shortlistedIds}
        onSelect={(candidate) => {
          setSelected({ id: candidate.id, name: candidate.fullName });
        }}
      />

      {selected && (
        <RequestInterviewDialog
          open
          onClose={() => setSelected(null)}
          candidateName={selected.name}
          onSubmitted={() => {
            addRequest(selected.id, selected.name);
            show(`Interview requested — ${selected.name} (demo)`);
          }}
        />
      )}
    </div>
  );
}
