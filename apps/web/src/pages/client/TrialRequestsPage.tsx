import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
  Tabs,
} from '@bestal/ui';
import { Calendar, FlaskConical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useClientTrialRequests, trialDurationDays } from '../../hooks/useClientEngagementRequests';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { useDemoToast } from '../../lib/use-demo-toast';

function TrialCard({ trial }: { trial: ReturnType<typeof useClientTrialRequests>['trials'][number] }) {
  const durationDays = trialDurationDays(trial.startDate, trial.endDate);

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
                {formatDate(trial.startDate)} – {formatDate(trial.endDate)}
              </span>
              {trial.rate > 0 && (
                <span>{formatCurrency(trial.rate, trial.currency)}/hr</span>
              )}
              {durationDays != null && trial.hoursPerWeek === 0 && (
                <span>{durationDays} day{durationDays === 1 ? '' : 's'}</span>
              )}
              {trial.hoursPerWeek > 0 && <span>{trial.hoursPerWeek} hrs/week</span>}
              {trial.recruiter && <span>Recruiter: {trial.recruiter}</span>}
            </div>
            {trial.feedback && (
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {trial.feedback}
              </p>
            )}
          </div>
          <Link
            to={`/client/candidates/${trial.candidateId}`}
            className="inline-flex h-9 shrink-0 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted/50"
          >
            View candidate
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrialRequestsPage() {
  const { message, show } = useDemoToast();
  const { shortlistedIds } = useClientShortlist();
  const { trials: clientTrials, addRequest } = useClientTrialRequests();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);

  const active = useMemo(
    () =>
      clientTrials.filter((t) =>
        ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'EXTENDED'].includes(t.status),
      ),
    [clientTrials],
  );
  const completed = useMemo(
    () => clientTrials.filter((t) => ['COMPLETED', 'CANCELLED'].includes(t.status)),
    [clientTrials],
  );

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
                      completed.map((trial) => <TrialCard key={trial.id} trial={trial} />)
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
        shortlistedIds={shortlistedIds}
        onSelect={(candidate) => {
          setSelected({ id: candidate.id, name: candidate.fullName });
        }}
      />

      {selected && (
        <RequestTrialDialog
          open
          onClose={() => setSelected(null)}
          candidateName={selected.name}
          onSubmit={(values) => {
            addRequest(selected.id, selected.name, values);
            show(`Trial requested — ${selected.name} (demo)`);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
