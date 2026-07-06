export type ApprovalGateInput = {
  evaluationStatus: string;
  bgvStatus: string;
  approvalStatus: string;
  visibility: string;
};

export type ApprovalGateResult = {
  allowed: boolean;
  blockers: readonly string[];
};

/** Internal sign-off — after evaluation done and BGV started (not failed). */
export function canApprove(input: ApprovalGateInput): ApprovalGateResult {
  const blockers: string[] = [];

  if (input.approvalStatus !== 'PENDING') {
    blockers.push('Candidate is not pending approval');
  }
  if (input.evaluationStatus !== 'COMPLETED') {
    blockers.push('Evaluation must be completed');
  }
  if (input.bgvStatus === 'NOT_STARTED') {
    blockers.push('Background verification must be requested');
  }
  if (input.bgvStatus === 'FAILED') {
    blockers.push('Background verification failed');
  }

  return { allowed: blockers.length === 0, blockers };
}

/** Client portal visibility — after approve and BGV clear. */
export function canPublish(input: ApprovalGateInput): ApprovalGateResult {
  const blockers: string[] = [];

  if (input.approvalStatus !== 'APPROVED') {
    blockers.push('Approve the candidate first');
  }
  if (input.visibility === 'PUBLISHED') {
    blockers.push('Already published to clients');
  }
  if (input.evaluationStatus !== 'COMPLETED') {
    blockers.push('Evaluation must be completed');
  }
  if (input.bgvStatus !== 'CLEAR') {
    blockers.push('Background verification must be clear');
  }

  return { allowed: blockers.length === 0, blockers };
}

export function readinessLabel(input: ApprovalGateInput): string {
  const approve = canApprove(input);
  const publish = canPublish(input);

  if (input.visibility === 'PUBLISHED' && input.approvalStatus === 'APPROVED') {
    return 'Live on client portal';
  }
  if (input.approvalStatus === 'REJECTED') {
    return 'Rejected — internal only';
  }
  if (input.approvalStatus === 'APPROVED' && !publish.allowed) {
    return `Approved — ${publish.blockers[0] ?? 'not ready to publish'}`;
  }
  if (input.approvalStatus === 'APPROVED') {
    return 'Ready to publish';
  }
  if (!approve.allowed) {
    return approve.blockers[0] ?? 'Not ready for approval';
  }
  return 'Ready for admin approval';
}
