export type ApprovalGateInput = {
  profileStatus: string | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  approvalStatus: string;
  visibility: string;
  submittedForApprovalAt: string | null;
};

export type ApprovalGateResult = {
  allowed: boolean;
  blockers: readonly string[];
};

export function isBgvClear(status: string | null | undefined): boolean {
  return status === 'CLEAR' || status === 'COMPLETED_CLEAR';
}

export type TrialEligibilityInput = {
  evaluationStatus: string | null | undefined;
  bgvStatus: string | null | undefined;
  visibility?: string | null;
  approvalStatus?: string | null;
};

/** Client can request a trial when evaluation is complete and BGV is clear. */
export function isTrialEligible(input: TrialEligibilityInput): boolean {
  const evaluationOk = (input.evaluationStatus ?? 'NOT_STARTED') === 'COMPLETED';
  if (!evaluationOk || !isBgvClear(input.bgvStatus)) return false;
  if (input.visibility != null && input.visibility !== 'CLIENT_VISIBLE') return false;
  if (input.approvalStatus != null && input.approvalStatus !== 'APPROVED') return false;
  return true;
}

function isAwaitingAdminApproval(input: ApprovalGateInput): boolean {
  return (
    input.profileStatus === 'PENDING_APPROVAL' ||
    (input.profileStatus === 'PROFILE_DRAFT' && Boolean(input.submittedForApprovalAt))
  );
}

/** Admin sign-off — separate from client publish. Requires explicit submit step. */
export function canApprove(input: ApprovalGateInput): ApprovalGateResult {
  const blockers: string[] = [];
  const evaluationStatus = input.evaluationStatus ?? 'NOT_STARTED';
  const bgvStatus = input.bgvStatus ?? 'NOT_STARTED';

  if (input.approvalStatus !== 'PENDING') {
    blockers.push('Candidate is not pending approval');
  }
  if (!input.submittedForApprovalAt) {
    blockers.push('Candidate must be submitted for approval first');
  }
  if (!isAwaitingAdminApproval(input)) {
    blockers.push('Profile must be submitted as draft awaiting review');
  }
  if (evaluationStatus !== 'COMPLETED') {
    blockers.push('Evaluation must be completed');
  }
  if (bgvStatus === 'NOT_STARTED') {
    blockers.push('Background verification must be requested');
  }
  if (bgvStatus === 'FAILED') {
    blockers.push('Background verification failed');
  }

  return { allowed: blockers.length === 0, blockers };
}

/** Client portal visibility — separate step after admin approve. */
export function canPublish(input: ApprovalGateInput): ApprovalGateResult {
  const blockers: string[] = [];
  const evaluationStatus = input.evaluationStatus ?? 'NOT_STARTED';
  const bgvStatus = input.bgvStatus ?? 'NOT_STARTED';

  if (input.approvalStatus !== 'APPROVED') {
    blockers.push('Approve the candidate first');
  }
  if (input.profileStatus !== 'ADMIN_APPROVED') {
    blockers.push('Admin approval step must be completed');
  }
  if (input.visibility === 'CLIENT_VISIBLE') {
    blockers.push('Already published to clients');
  }
  if (evaluationStatus !== 'COMPLETED') {
    blockers.push('Evaluation must be completed');
  }
  if (bgvStatus === 'NOT_STARTED') {
    blockers.push('Background verification must be requested');
  }
  if (bgvStatus === 'FAILED') {
    blockers.push('Background verification failed');
  }

  return { allowed: blockers.length === 0, blockers };
}

export function readinessLabel(input: ApprovalGateInput): string {
  const approve = canApprove(input);
  const publish = canPublish(input);

  if (input.visibility === 'CLIENT_VISIBLE' && input.approvalStatus === 'APPROVED') {
    return 'Live on client portal';
  }
  if (input.approvalStatus === 'REJECTED') {
    return 'Rejected — internal only';
  }
  if (input.approvalStatus === 'APPROVED' && !publish.allowed) {
    return `Approved — ${publish.blockers[0] ?? 'not ready to publish'}`;
  }
  if (input.approvalStatus === 'APPROVED') {
    return 'Ready to publish to clients';
  }
  if (!input.submittedForApprovalAt) {
    return 'Not yet submitted for approval';
  }
  if (!approve.allowed) {
    return approve.blockers[0] ?? 'Not ready for approval';
  }
  return 'Ready for admin approval';
}
