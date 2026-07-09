import { formatDate } from '@bestal/shared-utils';
import { Badge, Button, Card, CardContent, Dialog, PageHeader, StatusBadge } from '@bestal/ui';
import { Calendar, Clock, Video } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { InterviewConfirmForm } from '../../components/forms/InterviewConfirmForm';
import {
  buildInterviewConfirmUpdate,
  type InterviewConfirmFormValues,
  type InterviewRequestType,
} from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';
import { toInterviewCard, useInterviewMutations, useInterviewsList } from '../../hooks/api/useInterviews';

type InterviewCard = ReturnType<typeof toInterviewCard> & { meetingUrl?: string | null };

export function InterviewsPage() {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError } = useInterviewsList({ limit: 100 });
  const { confirm } = useInterviewMutations();
  const [confirmTarget, setConfirmTarget] = useState<InterviewCard | null>(null);

  const records = useMemo(
    () =>
      (data?.data ?? []).map((item) => {
        const card = toInterviewCard(item);
        return { ...card, meetingUrl: card.meetingUrl };
      }),
    [data],
  );

  const sorted = useMemo(
    () =>
      [...records].sort((a, b) => {
        if (!a.scheduledAt) return 1;
        if (!b.scheduledAt) return -1;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      }),
    [records],
  );

  const handleConfirm = useCallback(
    async (values: InterviewConfirmFormValues) => {
      if (!confirmTarget) return;
      const update = buildInterviewConfirmUpdate(
        values,
        confirmTarget.type as InterviewRequestType,
      );
      try {
        await confirm.mutateAsync({
          id: confirmTarget.id,
          body: {
            scheduledAt: update.scheduledAt,
            durationMinutes: update.durationMinutes,
            timezone: update.timezone ?? undefined,
            location: update.location ?? undefined,
            meetingLink: update.meetingLink ?? undefined,
          },
        });
        show(`Interview confirmed — ${confirmTarget.candidateName}`);
        setConfirmTarget(null);
      } catch (err) {
        show(err instanceof Error ? err.message : 'Confirm failed');
      }
    },
    [confirm, confirmTarget, show],
  );

  return (
    <div>
      <PageHeader title="Interviews" description="Schedule and confirm client interview requests" />

      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {isError && (
        <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load interviews
        </div>
      )}

      {isLoading ? (
        <p className="p-6 text-sm text-muted-foreground">Loading interviews…</p>
      ) : (
        <div className="space-y-3 p-6">
          {sorted.map((interview) => (
            <Card key={interview.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{interview.candidateName}</h3>
                    <StatusBadge status={interview.status} />
                    <Badge variant="outline">{interview.type.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {interview.clientName} · {interview.interviewer}
                  </p>
                  {interview.notes && (
                    <p className="text-sm text-muted-foreground">{interview.notes}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  {interview.scheduledAt && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(interview.scheduledAt)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {interview.durationMinutes} min
                  </span>
                  {interview.meetingUrl && (
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                    >
                      <Video className="h-4 w-4" />
                      Join meeting
                    </a>
                  )}
                  {interview.status === 'REQUESTED' && (
                    <Button size="sm" onClick={() => setConfirmTarget(interview)}>
                      Confirm schedule
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        title={confirmTarget ? `Confirm interview — ${confirmTarget.candidateName}` : 'Confirm interview'}
        scrollable
        className="max-w-lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" form="interview-confirm-form">
              Confirm interview
            </Button>
          </>
        }
      >
        {confirmTarget && (
          <InterviewConfirmForm
            interviewType={confirmTarget.type as InterviewRequestType}
            formId="interview-confirm-form"
            showActions={false}
            onSubmit={handleConfirm}
            onCancel={() => setConfirmTarget(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
