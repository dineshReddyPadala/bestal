import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  Tabs,
} from '@bestal/ui';
import { Calendar, FlaskConical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useTrialMutations } from '../../hooks/api/useTrials';
import { useClientTrialRequests, trialDurationDays } from '../../hooks/useClientEngagementRequests';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';

function formatOptionalDate(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatDate(trimmed);
}

function formatTrialDateRange(startDate: string, endDate: string): string {
  const start = formatOptionalDate(startDate);
  const end = formatOptionalDate(endDate);
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – TBD`;
  if (end) return `TBD – ${end}`;
  return 'Dates TBD';
}

function TrialCard({
  trial,
  onFeedback,
}: {
  trial: ReturnType<typeof useClientTrialRequests>['trials'][number];
  onFeedback?: (trialId: number) => void;
}) {
  const durationDays = trialDurationDays(trial.startDate, trial.endDate);
  const needsFeedback =
    trial.status === 'COMPLETED' && !trial.feedback?.trim() && onFeedback;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{trial.candidateName}</h2>
              <StatusBadge status={trial.status} />
            </div>
            <p className="font-medium text-foreground">{trial.title}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatTrialDateRange(trial.startDate, trial.endDate)}
              </span>
              {trial.rate > 0 && (
                <span>{formatCurrency(trial.rate, trial.currency)}/hr</span>
              )}
              {durationDays != null && trial.hoursPerWeek === 0 && (
                <span>
                  {durationDays} day{durationDays === 1 ? '' : 's'}
                </span>
              )}
              {trial.hoursPerWeek > 0 && <span>{trial.hoursPerWeek} hrs/week</span>}
              {trial.recruiter && <span>Recruiter: {trial.recruiter}</span>}
            </div>
            {trial.feedback && (
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {trial.feedback}
                {trial.clientRating != null && (
                  <span className="mt-1 block font-medium text-foreground">
                    Rating: {trial.clientRating}/5
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to={`/client/candidates/${trial.candidateId}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted/50"
            >
              View candidate
            </Link>
            {needsFeedback && (
              <Button size="sm" onClick={() => onFeedback(trial.id)}>
                Submit feedback
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrialRequestsPage() {
  const { message, show, showError } = useDemoToast();
  const { trials: clientTrials, addRequest } = useClientTrialRequests();
  const { submitFeedback } = useTrialMutations();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);
  const [feedbackTrialId, setFeedbackTrialId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState('5');
  const [decision, setDecision] = useState<'CONTINUE' | 'DO_NOT_CONTINUE'>('CONTINUE');

  const active = useMemo(
    () =>
      clientTrials.filter((t) =>
        ['REQUESTED', 'APPROVED', 'IN_PROGRESS'].includes(t.status),
      ),
    [clientTrials],
  );
  const completed = useMemo(
    () => clientTrials.filter((t) => ['COMPLETED', 'CANCELLED', 'FAILED'].includes(t.status)),
    [clientTrials],
  );

  const feedbackTrial = clientTrials.find((t) => t.id === feedbackTrialId);

  async function handleSubmitFeedback() {
    if (!feedbackTrialId || feedbackText.trim().length < 3) {
      showError('Please enter feedback (min 3 characters)');
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        id: feedbackTrialId,
        body: {
          feedback: feedbackText.trim(),
          clientRating: Number(rating),
          decision,
        },
      });
      show(
        decision === 'CONTINUE'
          ? 'Feedback submitted — continue with deployment'
          : 'Feedback submitted — do not continue',
      );
      setFeedbackTrialId(null);
      setFeedbackText('');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Feedback failed'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Trial Requests"
        actions={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Request trial
          </Button>
        }
      />

      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {clientTrials.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="h-8 w-8" />}
            title="No trial requests"
            action={{ label: 'Request trial', onClick: () => setPickerOpen(true) }}
          />
        ) : (
          <Tabs
            tabs={[
              {
                id: 'active',
                label: `Active (${active.length})`,
                content: (
                  <div className="grid gap-4">
                    {active.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active trials.</p>
                    ) : (
                      active.map((trial) => <TrialCard key={trial.id} trial={trial} />)
                    )}
                  </div>
                ),
              },
              {
                id: 'history',
                label: `History (${completed.length})`,
                content: (
                  <div className="grid gap-4">
                    {completed.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No completed trials.</p>
                    ) : (
                      completed.map((trial) => (
                        <TrialCard
                          key={trial.id}
                          trial={trial}
                          onFeedback={setFeedbackTrialId}
                        />
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
        title="Select candidate for trial"
        trialEligibleOnly
        onSelect={(candidate) => {
          setSelected({ id: candidate.id, name: candidate.fullName });
        }}
      />

      {selected && (
        <RequestTrialDialog
          open
          onClose={() => setSelected(null)}
          candidateName={selected.name}
          onSubmit={async (values) => {
            await addRequest(selected.id, selected.name, values);
            show(`Trial requested — ${selected.name}`);
          }}
        />
      )}

      {feedbackTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">Trial feedback</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {feedbackTrial.candidateName} — rate the pilot and choose next step
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <Select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="mt-1"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} / 5
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Feedback</label>
                <Input
                  className="mt-1"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="How did the pilot go?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Decision</label>
                <Select
                  value={decision}
                  onChange={(e) =>
                    setDecision(e.target.value as 'CONTINUE' | 'DO_NOT_CONTINUE')
                  }
                  className="mt-1"
                >
                  <option value="CONTINUE">Continue with deployment</option>
                  <option value="DO_NOT_CONTINUE">Do not continue</option>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFeedbackTrialId(null)}>
                Cancel
              </Button>
              <Button onClick={() => void handleSubmitFeedback()}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
