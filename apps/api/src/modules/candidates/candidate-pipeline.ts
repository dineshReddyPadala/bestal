import type {
  CandidateApprovalStatus,
  CandidateProfileStatus,
  CandidateVisibility,
} from '@prisma/client';
import { BadRequestError } from '../../utils/index.js';

export type PipelineCandidateSnapshot = {
  profileStatus: CandidateProfileStatus | null;
  approvalStatus: CandidateApprovalStatus;
  visibility: CandidateVisibility;
  resumeDocumentId: bigint | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  aiSummary?: string | null;
  clientBillRate: { toString(): string } | null;
  availabilityStatus: string | null;
  availableFrom: Date | null;
  submittedForApprovalAt: Date | null;
};

export function hasResumeUploaded(candidate: PipelineCandidateSnapshot): boolean {
  return candidate.resumeDocumentId != null;
}

export function isPricingComplete(candidate: PipelineCandidateSnapshot): boolean {
  return (
    candidate.clientBillRate != null &&
    Number(candidate.clientBillRate) > 0 &&
    candidate.availabilityStatus != null &&
    candidate.availableFrom != null
  );
}

export function assertProfileStatus(
  candidate: PipelineCandidateSnapshot,
  expected: CandidateProfileStatus,
  action: string,
): void {
  if (candidate.profileStatus !== expected) {
    throw new BadRequestError(
      `${action} requires profile status ${expected}, current status is ${candidate.profileStatus ?? 'unset'}`,
    );
  }
}

export function assertResumeUploaded(
  candidate: PipelineCandidateSnapshot,
  action: string,
): void {
  if (!hasResumeUploaded(candidate)) {
    throw new BadRequestError(`${action} requires a resume to be uploaded first`);
  }
}

export function assertCanRunAiScreening(candidate: PipelineCandidateSnapshot): void {
  if (
    candidate.profileStatus !== 'SOURCED' &&
    candidate.profileStatus !== 'IMPORTED'
  ) {
    throw new BadRequestError(
      `AI screening requires profile status SOURCED or IMPORTED, current status is ${candidate.profileStatus ?? 'unset'}`,
    );
  }
  assertResumeUploaded(candidate, 'AI screening');
}

export function assertCanCompleteRecruiterReview(candidate: PipelineCandidateSnapshot): void {
  if (
    candidate.profileStatus !== 'AI_SCREENED' &&
    candidate.profileStatus !== 'IMPORTED'
  ) {
    throw new BadRequestError(
      `Recruiter review requires profile status AI_SCREENED or IMPORTED, current status is ${candidate.profileStatus ?? 'unset'}`,
    );
  }
}

/** Admin / super-admin add-candidate flows skip the recruiter review gate. */
export function isRecruiterReviewBypassRole(role: string | null | undefined): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function profileStatusAfterAiScreening(
  hasScreeningSignal: boolean,
  skipRecruiterReview: boolean,
): CandidateProfileStatus {
  if (!hasScreeningSignal) return 'SOURCED';
  return skipRecruiterReview ? 'RECRUITER_SCREENED' : 'AI_SCREENED';
}

export function assertCanCreateEvaluation(candidate: PipelineCandidateSnapshot): void {
  assertProfileStatus(candidate, 'RECRUITER_SCREENED', 'Technical evaluation');
}

export function assertCanCreateBackgroundCheck(candidate: PipelineCandidateSnapshot): void {
  assertProfileStatus(candidate, 'EVALUATION_COMPLETE', 'Background verification');
}

export function assertCanCompletePricing(candidate: PipelineCandidateSnapshot): void {
  assertProfileStatus(candidate, 'BGV_COMPLETE', 'Pricing and availability');
}

export function assertCanSubmitForApproval(candidate: PipelineCandidateSnapshot): void {
  assertProfileStatus(candidate, 'PROFILE_DRAFT', 'Submit for approval');
  if (!isPricingComplete(candidate)) {
    throw new BadRequestError(
      'Submit for approval requires client bill rate, availability status, and available-from date',
    );
  }
  // Imported candidates may proceed with supplied AI summary even without a local resume file.
  if (!hasResumeUploaded(candidate) && !candidate.aiSummary?.trim()) {
    throw new BadRequestError(
      'Submit for approval requires a resume upload or an imported AI summary',
    );
  }
  if (!candidate.aiSummary?.trim()) {
    throw new BadRequestError('Submit for approval requires an AI summary');
  }
  if (candidate.evaluationStatus !== 'COMPLETED') {
    throw new BadRequestError('Evaluation must be completed before submit for approval');
  }
  if (!candidate.bgvStatus || candidate.bgvStatus === 'NOT_STARTED') {
    throw new BadRequestError('Background verification must be started before submit for approval');
  }
  if (candidate.bgvStatus === 'FAILED') {
    throw new BadRequestError('Background verification failed — cannot submit for approval');
  }
  if (candidate.submittedForApprovalAt) {
    throw new BadRequestError('Candidate has already been submitted for approval');
  }
}

function isBgvClear(status: string | null): boolean {
  return status === 'CLEAR' || status === 'COMPLETED_CLEAR';
}

export function assertCanApprove(candidate: PipelineCandidateSnapshot): void {
  if (candidate.approvalStatus === 'APPROVED') {
    throw new BadRequestError('Candidate is already approved');
  }
  if (candidate.approvalStatus === 'REJECTED') {
    throw new BadRequestError('Rejected candidates cannot be approved');
  }
  if (!candidate.submittedForApprovalAt) {
    throw new BadRequestError('Candidate must be submitted for approval first');
  }
  if (
    candidate.profileStatus !== 'PENDING_APPROVAL' &&
    candidate.profileStatus !== 'PROFILE_DRAFT'
  ) {
    throw new BadRequestError(
      'Approve requires profile status PENDING_APPROVAL (submitted, awaiting admin review)',
    );
  }
  if (candidate.evaluationStatus !== 'COMPLETED') {
    throw new BadRequestError('Evaluation must be completed before approval');
  }
  if (!candidate.bgvStatus || candidate.bgvStatus === 'NOT_STARTED') {
    throw new BadRequestError('Background verification must be started before approval');
  }
  if (candidate.bgvStatus === 'FAILED') {
    throw new BadRequestError('Background verification failed — cannot approve');
  }
}

export function assertCanPublish(candidate: PipelineCandidateSnapshot): void {
  if (candidate.approvalStatus !== 'APPROVED') {
    throw new BadRequestError('Candidate must be admin-approved before publishing');
  }
  if (candidate.profileStatus !== 'ADMIN_APPROVED') {
    throw new BadRequestError('Publish requires profile status ADMIN_APPROVED');
  }
  if (candidate.visibility === 'CLIENT_VISIBLE') {
    throw new BadRequestError('Candidate is already client visible');
  }
  if (candidate.evaluationStatus !== 'COMPLETED') {
    throw new BadRequestError('Evaluation must be completed before publishing');
  }
  if (!isBgvClear(candidate.bgvStatus)) {
    throw new BadRequestError('Background verification must be clear before publishing');
  }
}

export function toPipelineSnapshot(
  candidate: PipelineCandidateSnapshot,
): PipelineCandidateSnapshot {
  return candidate;
}
