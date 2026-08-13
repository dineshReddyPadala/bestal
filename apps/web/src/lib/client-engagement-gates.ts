/** Trial statuses that block a new trial request for the same candidate. */
export const BLOCKING_TRIAL_STATUSES = [
  'REQUESTED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
] as const;

export function hasBlockingTrialForCandidate(
  candidateId: number,
  trials: Array<{ candidateId: number; status: string }>,
): boolean {
  return trials.some(
    (trial) =>
      trial.candidateId === candidateId &&
      BLOCKING_TRIAL_STATUSES.includes(
        trial.status as (typeof BLOCKING_TRIAL_STATUSES)[number],
      ),
  );
}

export type DeploymentRequestBlockReason = 'pending' | 'active';

export function getDeploymentRequestBlockReason(
  candidateId: number,
  deployments: Array<{ candidateId: number; status: string }>,
): DeploymentRequestBlockReason | null {
  if (deployments.some((d) => d.candidateId === candidateId && d.status === 'PENDING')) {
    return 'pending';
  }
  if (
    deployments.some(
      (d) =>
        d.candidateId === candidateId &&
        (d.status === 'ACTIVE' || d.status === 'ON_HOLD'),
    )
  ) {
    return 'active';
  }
  return null;
}

export function deploymentRequestBlockMessage(
  reason: DeploymentRequestBlockReason | null,
): string | null {
  if (reason === 'pending') {
    return 'A deployment request is already pending for this candidate.';
  }
  if (reason === 'active') {
    return 'This candidate has an active deployment. Use Extend contract instead.';
  }
  return null;
}

export function trialRequestBlockMessage(blocked: boolean): string | null {
  if (!blocked) return null;
  return 'A trial was already requested or completed for this candidate.';
}
