import { Button, Dialog, StatusBadge } from '@bestal/ui';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { trialsApi } from '../../lib/api/trials';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { TrialDto } from '../../lib/api/types';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

type ClientTrialDetailDialogProps = {
  trialId: number | null;
  onClose: () => void;
};

export function ClientTrialDetailDialog({ trialId, onClose }: ClientTrialDetailDialogProps) {
  const [trial, setTrial] = useState<TrialDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trialId == null) {
      setTrial(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void trialsApi
      .get(trialId)
      .then((data) => {
        if (!cancelled) setTrial(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load trial'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trialId]);

  return (
    <Dialog
      open={trialId != null}
      onClose={onClose}
      title={trial ? `Trial — ${trial.candidateName}` : 'Trial details'}
      className="max-w-lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading trial…
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : trial ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Candidate</dt>
            <dd className="mt-0.5 text-sm font-medium">{trial.candidateName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <StatusBadge status={trial.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="mt-0.5 text-sm font-medium">{trial.roleTitle ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Start date</dt>
            <dd className="mt-0.5 text-sm font-medium">{formatDate(trial.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">End date</dt>
            <dd className="mt-0.5 text-sm font-medium">{formatDate(trial.endDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Duration</dt>
            <dd className="mt-0.5 text-sm font-medium">
              {trial.durationDays != null ? `${trial.durationDays} days` : '—'}
            </dd>
          </div>
          {trial.taskDescription ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Task description</dt>
              <dd className="mt-0.5 text-sm">{trial.taskDescription}</dd>
            </div>
          ) : null}
          {trial.feedback ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Feedback</dt>
              <dd className="mt-0.5 text-sm">{trial.feedback}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Dialog>
  );
}
