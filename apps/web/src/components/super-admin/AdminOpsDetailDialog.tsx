import { Button, Dialog, StatusBadge } from '@bestal/ui';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { adminApi } from '../../lib/api/admin';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { DeploymentDto, TrialDto } from '../../lib/api/types';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

type AdminTrialDetailDialogProps = {
  trialId: number | null;
  onClose: () => void;
};

export function AdminTrialDetailDialog({ trialId, onClose }: AdminTrialDetailDialogProps) {
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
    void adminApi
      .getTrial(trialId)
      .then((data) => {
        if (!cancelled) setTrial(data as TrialDto);
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
          <DetailField label="Client" value={trial.clientName} />
          <DetailField label="Candidate" value={trial.candidateName} />
          <DetailField label="Status" value={<StatusBadge status={trial.status} />} />
          <DetailField label="Role" value={trial.roleTitle ?? '—'} />
          <DetailField label="Requested by" value={trial.requestedByName} />
          <DetailField
            label="Assigned recruiter"
            value={trial.assignedRecruiterName ?? '—'}
          />
          <DetailField label="Start date" value={formatDate(trial.startDate)} />
          <DetailField label="End date" value={formatDate(trial.endDate)} />
          <DetailField
            label="Duration"
            value={trial.durationDays != null ? `${trial.durationDays} days` : '—'}
          />
          <DetailField
            label="Converted to paid"
            value={trial.convertedToPaid ? 'Yes' : 'No'}
          />
          {trial.taskDescription ? (
            <div className="sm:col-span-2">
              <DetailField label="Task description" value={trial.taskDescription} />
            </div>
          ) : null}
          {trial.feedback ? (
            <div className="sm:col-span-2">
              <DetailField label="Feedback" value={trial.feedback} />
            </div>
          ) : null}
          {trial.rejectReason ? (
            <div className="sm:col-span-2">
              <DetailField label="Reject reason" value={trial.rejectReason} />
            </div>
          ) : null}
        </dl>
      ) : null}
    </Dialog>
  );
}

type AdminDeploymentDetailDialogProps = {
  deploymentId: number | null;
  onClose: () => void;
};

export function AdminDeploymentDetailDialog({
  deploymentId,
  onClose,
}: AdminDeploymentDetailDialogProps) {
  const [deployment, setDeployment] = useState<DeploymentDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deploymentId == null) {
      setDeployment(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adminApi
      .getDeployment(deploymentId)
      .then((data) => {
        if (!cancelled) setDeployment(data as DeploymentDto);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load deployment'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deploymentId]);

  return (
    <Dialog
      open={deploymentId != null}
      onClose={onClose}
      title={
        deployment ? `Deployment — ${deployment.candidateName}` : 'Deployment details'
      }
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
          Loading deployment…
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : deployment ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Client" value={deployment.clientName} />
          <DetailField label="Candidate" value={deployment.candidateName} />
          <DetailField label="Status" value={<StatusBadge status={deployment.status} />} />
          <DetailField label="Role" value={deployment.roleTitle} />
          <DetailField label="Placement type" value={deployment.placementType} />
          <DetailField label="Start date" value={formatDate(deployment.startDate)} />
          <DetailField label="End date" value={formatDate(deployment.endDate)} />
          <DetailField
            label="Bill rate"
            value={
              deployment.billingRate != null
                ? `$${deployment.billingRate}${deployment.currency ? ` ${deployment.currency}` : ''}`
                : '—'
            }
          />
          <DetailField
            label="Pay rate"
            value={deployment.candidatePayRate != null ? `$${deployment.candidatePayRate}` : '—'}
          />
          <DetailField
            label="Margin / hour"
            value={
              deployment.grossMarginPerHour != null
                ? `$${deployment.grossMarginPerHour}`
                : '—'
            }
          />
          <DetailField
            label="Expected hours / week"
            value={deployment.expectedHoursPerWeek ?? '—'}
          />
          <DetailField label="Work location" value={deployment.workLocation ?? '—'} />
          <DetailField label="Created by" value={deployment.createdByName} />
          {deployment.notes ? (
            <div className="sm:col-span-2">
              <DetailField label="Notes" value={deployment.notes} />
            </div>
          ) : null}
          {deployment.terminateReason ? (
            <div className="sm:col-span-2">
              <DetailField label="Terminate reason" value={deployment.terminateReason} />
            </div>
          ) : null}
        </dl>
      ) : null}
    </Dialog>
  );
}
