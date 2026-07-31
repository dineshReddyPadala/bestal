import {
  CANDIDATE_PROFILE_STATUS_LABELS,
  type CandidateProfileStatusValue,
} from '@bestal/shared-utils';
import { Button, Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@bestal/ui';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCandidate, useCandidateMutations } from '../../hooks/api/useCandidates';
import { usePermissions } from '../../hooks/usePermissions';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';

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
  basePath?: '/admin/candidates' | '/recruiter/candidates' | '/super-admin/candidates';
};

export function CandidatePipelinePanel({
  candidateId,
  basePath = '/recruiter/candidates',
}: CandidatePipelinePanelProps) {
  const { data: candidate, isLoading, isError, error } = useCandidate(candidateId);
  const mutations = useCandidateMutations();
  const { canWriteCandidates } = usePermissions();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [busy, setBusy] = useState<string | null>(null);

  const currentIdx = stepIndex(candidate?.profileStatus);

  const run = async (key: string, action: () => Promise<unknown>, success: string) => {
    setBusy(key);
    try {
      await action();
      show(success);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Action failed'));
    } finally {
      setBusy(null);
    }
  };

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

  const hasResume = Boolean(candidate.hasResume ?? candidate.resume);

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Candidate pipeline</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={candidate.profileStatus ?? 'SOURCED'} />
          </div>
        </div>
        {candidate.profileStatus === 'PENDING_APPROVAL' ||
        candidate.approvalStatus === 'APPROVED' ||
        candidate.approvalStatus === 'REJECTED' ||
        (candidate.profileStatus === 'RECRUITER_SCREENED' && candidate.rejectionReason) ? (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              candidate.approvalStatus === 'REJECTED'
                ? 'border-red-200 bg-red-50 text-red-800'
                : candidate.approvalStatus === 'APPROVED'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : candidate.profileStatus === 'PENDING_APPROVAL'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
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
            {candidate.approvalStatus === 'APPROVED' ? (
              <p>
                Approved by admin
                {candidate.approvedAt ? ` on ${formatWhen(candidate.approvedAt)}` : ''}.
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
      <CardContent className="space-y-5">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE_STEPS.map((step, idx) => {
            const done = currentIdx > idx;
            const active = candidate.profileStatus === step;
            return (
              <li
                key={step}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                  active
                    ? 'border-brand bg-brand/5'
                    : done
                      ? 'border-border/60 bg-muted/30'
                      : 'border-border/40 text-muted-foreground'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" />
                )}
                <span>{CANDIDATE_PROFILE_STATUS_LABELS[step]}</span>
              </li>
            );
          })}
        </ol>

        {canWriteCandidates ? (
          <div className="flex flex-wrap gap-2">
            {['SOURCED', 'AI_SCREENED', 'RECRUITER_SCREENED', 'PROFILE_DRAFT'].includes(
              candidate.profileStatus ?? '',
            ) ? (
              <Button size="sm" variant="outline" to={`${basePath}/${candidateId}/edit`}>
                Edit profile
              </Button>
            ) : null}

            {candidate.profileStatus === 'SOURCED' ? (
              <Button
                size="sm"
                disabled={!hasResume || busy !== null}
                onClick={() =>
                  run(
                    'ai',
                    () => mutations.runAiScreening.mutateAsync({ id: candidateId }),
                    'AI screening complete',
                  )
                }
              >
                {busy === 'ai' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run AI screening
              </Button>
            ) : null}

            {candidate.profileStatus === 'AI_SCREENED' ? (
              <Button
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  run(
                    'recruiter',
                    () => mutations.completeRecruiterReview.mutateAsync({ id: candidateId }),
                    'Recruiter review complete',
                  )
                }
              >
                Complete recruiter review
              </Button>
            ) : null}

            {candidate.profileStatus === 'BGV_COMPLETE' ? (
              <Button
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  run(
                    'pricing',
                    () => mutations.completePricing.mutateAsync(candidateId),
                    'Pricing marked complete — profile draft',
                  )
                }
              >
                Complete pricing & availability
              </Button>
            ) : null}

            {candidate.profileStatus === 'PROFILE_DRAFT' &&
            !candidate.submittedForApprovalAt ? (
              <Button
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  run(
                    'submit',
                    () => mutations.submitForApproval.mutateAsync(candidateId),
                    'Submitted for admin approval',
                  )
                }
              >
                Submit for approval
              </Button>
            ) : null}
          </div>
        ) : null}

      </CardContent>
    </Card>
    </>
  );
}
