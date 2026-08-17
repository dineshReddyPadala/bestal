import { formatCurrency } from '@bestal/shared-utils';
import { Button, Dialog, StatusBadge } from '@bestal/ui';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useOrgFormatDate } from '../../contexts/OrgSettingsContext';
import { deploymentsApi } from '../../lib/api/deployments';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { DeploymentDto } from '../../lib/api/types';

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

type ClientDeploymentDetailDialogProps = {
  deploymentId: number | null;
  onClose: () => void;
};

export function ClientDeploymentDetailDialog({
  deploymentId,
  onClose,
}: ClientDeploymentDetailDialogProps) {
  const formatDate = useOrgFormatDate();
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
    void deploymentsApi
      .get(deploymentId)
      .then((data) => {
        if (!cancelled) setDeployment(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load deployment'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deploymentId]);

  const endDateLabel = deployment?.endDate
    ? formatDate(deployment.endDate)
    : deployment?.status === 'ACTIVE' || deployment?.status === 'ON_HOLD'
      ? 'Ongoing'
      : '—';

  return (
    <Dialog
      open={deploymentId != null}
      onClose={onClose}
      title={
        deployment
          ? `${deployment.candidateName} — ${deployment.roleTitle}`
          : 'Deployment details'
      }
      description={
        deployment
          ? `Deployment #${String(deployment.id).padStart(2, '0')}`
          : undefined
      }
      className="max-w-lg"
      scrollable
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          {deployment ? (
            <Button
              variant="outline"
              size="sm"
              to={`/client/candidates/${deployment.candidateId}`}
              onClick={onClose}
            >
              View candidate profile
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
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
          <DetailField label="Candidate" value={deployment.candidateName} />
          <DetailField label="Status" value={<StatusBadge status={deployment.status} />} />
          <DetailField label="Role" value={deployment.roleTitle} />
          <DetailField label="Placement type" value={deployment.placementType.replace(/_/g, ' ')} />
          <DetailField
            label="Contract start"
            value={deployment.startDate ? formatDate(deployment.startDate) : '—'}
          />
          <DetailField label="Contract end" value={endDateLabel} />
          <DetailField
            label="Bill rate"
            value={
              deployment.billingRate != null
                ? `${formatCurrency(deployment.billingRate, deployment.currency ?? 'USD')}/hr`
                : 'Pending approval'
            }
          />
          <DetailField
            label="Expected hours / week"
            value={deployment.expectedHoursPerWeek ?? '—'}
          />
          <DetailField label="Work location" value={deployment.workLocation ?? '—'} />
          <DetailField label="Timezone" value={deployment.timezone?.replace(/_/g, ' ') ?? '—'} />
          <DetailField
            label="Reporting manager"
            value={deployment.reportingManagerName ?? '—'}
          />
          {deployment.reportingManagerEmail ? (
            <DetailField label="Manager email" value={deployment.reportingManagerEmail} />
          ) : null}
          {deployment.extensionRequestedEndDate ? (
            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Extension requested to{' '}
              <strong>{formatDate(deployment.extensionRequestedEndDate)}</strong>
            </div>
          ) : null}
          {deployment.terminateReason ? (
            <div className="sm:col-span-2">
              <DetailField label="End reason" value={deployment.terminateReason} />
            </div>
          ) : null}
        </dl>
      ) : null}
    </Dialog>
  );
}
