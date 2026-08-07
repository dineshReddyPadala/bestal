import {
  CANDIDATE_PROFILE_STATUS_LABELS,
  type CandidateProfileStatusValue,
} from '@bestal/shared-utils';
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@bestal/ui';
import { Loader2 } from 'lucide-react';
import { useCandidate } from '../../hooks/api/useCandidates';

const PIPELINE_STEPS: CandidateProfileStatusValue[] = [
  'SOURCED',
  'AI_SCREENED',
  'RECRUITER_SCREENED',
  'EVALUATION_PENDING',
  'EVALUATION_COMPLETE',
  'BGV_PENDING',
  'BGV_COMPLETE',
  'PROFILE_DRAFT',
  'PENDING_APPROVAL',
  'ADMIN_APPROVED',
  'CLIENT_VISIBLE',
];

function stepIndex(status: string | null | undefined): number {
  if (!status) return -1;
  const idx = PIPELINE_STEPS.indexOf(status as CandidateProfileStatusValue);
  return idx >= 0 ? idx : -1;
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

type CandidatePipelinePanelProps = {
  candidateId: number;
};

export function CandidatePipelinePanel({ candidateId }: CandidatePipelinePanelProps) {
  const { data: candidate, isLoading, isError, error } = useCandidate(candidateId);

  const currentIdx = stepIndex(candidate?.profileStatus);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading pipeline…
        </CardContent>
      </Card>
    );
  }

  if (isError || !candidate) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load pipeline'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Candidate pipeline</CardTitle>
          <StatusBadge status={candidate.profileStatus ?? 'SOURCED'} />
        </div>
        {candidate.profileStatus === 'PENDING_APPROVAL' ||
        candidate.approvalStatus === 'REJECTED' ||
        (candidate.profileStatus === 'RECRUITER_SCREENED' && candidate.rejectionReason) ? (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              candidate.approvalStatus === 'REJECTED'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {candidate.profileStatus === 'PENDING_APPROVAL' ? (
              <p>
                Awaiting admin review
                {candidate.submittedForApprovalAt
                  ? ` since ${formatWhen(candidate.submittedForApprovalAt)}`
                  : ''}
                .
              </p>
            ) : null}
            {candidate.approvalStatus === 'REJECTED' ? (
              <p>
                Rejected by admin
                {candidate.rejectedAt ? ` on ${formatWhen(candidate.rejectedAt)}` : ''}.
                {candidate.rejectionReason ? ` Reason: ${candidate.rejectionReason}` : ''}
              </p>
            ) : null}
            {candidate.profileStatus === 'RECRUITER_SCREENED' &&
            candidate.rejectionReason &&
            candidate.approvalStatus !== 'REJECTED' ? (
              <p>Sent back to recruiter. Reason: {candidate.rejectionReason}</p>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs">
          {PIPELINE_STEPS.map((step, idx) => {
            const done = currentIdx > idx;
            const active = candidate.profileStatus === step;
            return (
              <span key={step} className="inline-flex items-center gap-1">
                {idx > 0 ? (
                  <span className="mx-0.5 text-muted-foreground/50" aria-hidden>
                    →
                  </span>
                ) : null}
                <span
                  className={
                    active
                      ? 'rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand'
                      : done
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  }
                >
                  {CANDIDATE_PROFILE_STATUS_LABELS[step]}
                </span>
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
