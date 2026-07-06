import { candidates } from './candidates.js';
import { documents } from './documents.js';
import { evaluations } from './evaluations.js';
import { getCandidateDetailProfile } from './candidateDetailProfile.js';
import { getScreeningForCandidate } from './screening.js';
import { getBestalScore } from './candidateScores.js';

export type EvaluationWorkflowStepId =
  | 'candidate_added'
  | 'resume_uploaded'
  | 'ai_screening'
  | 'recruiter_review'
  | 'schedule_evaluation'
  | 'conduct_evaluation'
  | 'upload_results'
  | 'ai_summary'
  | 'admin_approval'
  | 'bestal_score'
  | 'client_visible';

export type EvaluationWorkflowStepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type EvaluationWorkflowStep = {
  readonly id: EvaluationWorkflowStepId;
  readonly label: string;
  readonly description: string;
  readonly status: EvaluationWorkflowStepStatus;
  readonly completedAt: string | null;
  readonly actor: string | null;
};

export const EVALUATION_WORKFLOW_STEP_DEFS: readonly {
  id: EvaluationWorkflowStepId;
  label: string;
  description: string;
}[] = [
  { id: 'candidate_added', label: 'Candidate Added', description: 'Profile created in talent pool' },
  { id: 'resume_uploaded', label: 'Resume Uploaded', description: 'Resume on file for screening' },
  { id: 'ai_screening', label: 'AI Resume Screening', description: 'Automated skills and experience analysis' },
  { id: 'recruiter_review', label: 'Recruiter Review', description: 'Recruiter validates AI screening results' },
  { id: 'schedule_evaluation', label: 'Schedule Technical Evaluation', description: 'Assign evaluator and session time' },
  { id: 'conduct_evaluation', label: 'Conduct Evaluation', description: 'Live technical assessment session' },
  { id: 'upload_results', label: 'Upload Evaluation Results', description: 'PDF report and recording uploaded' },
  { id: 'ai_summary', label: 'AI Summarizes Evaluation', description: 'AI generates client-ready summary' },
  { id: 'admin_approval', label: 'Admin Review & Approval', description: 'Admin approves for client visibility' },
  { id: 'bestal_score', label: 'BesTal Score Updated', description: 'Composite score recalculated' },
  { id: 'client_visible', label: 'Candidate Visible to Clients', description: 'Published in client search portal' },
];

function hasResume(candidateId: number): boolean {
  return documents.some((d) => d.candidateId === candidateId && d.kind === 'RESUME');
}

function hasEvalPdf(candidateId: number): boolean {
  return documents.some(
    (d) => d.candidateId === candidateId && d.kind === 'EVALUATION_FORM',
  );
}

function getEvaluation(candidateId: number) {
  return evaluations.find((e) => e.candidateId === candidateId);
}

function stepStatus(
  index: number,
  completedThrough: number,
): EvaluationWorkflowStepStatus {
  if (index <= completedThrough) return 'completed';
  if (index === completedThrough + 1 && completedThrough < 11) return 'in_progress';
  return 'pending';
}

/** Derive workflow progress from existing mock records. */
export function getEvaluationWorkflowForCandidate(candidateId: number): EvaluationWorkflowStep[] {
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) return [];

  const screening = getScreeningForCandidate(candidateId);
  const evaluation = getEvaluation(candidateId);
  const profile = getCandidateDetailProfile(candidateId);
  const resume = hasResume(candidateId);
  const evalPdf = hasEvalPdf(candidateId);
  const score = getBestalScore(candidateId);
  const published = candidate.visibility === 'PUBLISHED' && candidate.approvalStatus === 'APPROVED';

  let completedThrough = 0;
  if (resume) completedThrough = 1;
  if (screening) completedThrough = 2;
  if (screening && (screening.recommendation !== 'REVIEW' || evaluation)) completedThrough = 3;
  if (evaluation) completedThrough = 4;
  if (evaluation?.status === 'IN_PROGRESS' || evaluation?.status === 'COMPLETED') completedThrough = 5;
  if (evaluation?.status === 'COMPLETED') completedThrough = 6;
  if (evalPdf || (evaluation?.status === 'COMPLETED' && evaluation.technicalScore != null)) {
    completedThrough = 7;
  }
  if (profile?.evaluationDetail.aiEvaluationSummary && evaluation?.status === 'COMPLETED') {
    completedThrough = 8;
  }
  if (candidate.approvalStatus === 'APPROVED') completedThrough = 9;
  if (score > 0 && evaluation?.status === 'COMPLETED') completedThrough = 10;
  if (published) completedThrough = 11;

  const timestamps: Partial<Record<EvaluationWorkflowStepId, { at: string; actor: string }>> = {
    candidate_added: { at: '2026-06-01T10:00:00Z', actor: 'Rachel Kim' },
    resume_uploaded: resume
      ? {
          at: documents.find((d) => d.candidateId === candidateId && d.kind === 'RESUME')?.uploadedAt ?? '',
          actor: documents.find((d) => d.candidateId === candidateId && d.kind === 'RESUME')?.uploadedBy ?? 'Recruiter',
        }
      : undefined,
    ai_screening: screening ? { at: screening.runAt, actor: 'BesTal AI' } : undefined,
    recruiter_review: screening ? { at: screening.runAt, actor: 'Tom Bradley' } : undefined,
    schedule_evaluation: evaluation ? { at: '2026-06-10T09:00:00Z', actor: 'Rachel Kim' } : undefined,
    conduct_evaluation:
      evaluation?.status === 'COMPLETED' || evaluation?.status === 'IN_PROGRESS'
        ? { at: evaluation.completedAt ?? '2026-06-12T14:00:00Z', actor: evaluation.evaluatorName }
        : undefined,
    upload_results: evalPdf ? { at: '2026-06-14T16:00:00Z', actor: evaluation?.evaluatorName ?? 'Evaluator' } : undefined,
    ai_summary: profile?.evaluationDetail.aiEvaluationSummary
      ? { at: '2026-06-14T17:30:00Z', actor: 'BesTal AI' }
      : undefined,
    admin_approval:
      candidate.approvalStatus === 'APPROVED'
        ? { at: '2026-06-15T10:00:00Z', actor: 'Admin' }
        : undefined,
    bestal_score: score > 0 ? { at: '2026-06-15T10:05:00Z', actor: 'System' } : undefined,
    client_visible: published ? { at: '2026-06-15T11:00:00Z', actor: 'Rachel Kim' } : undefined,
  };

  return EVALUATION_WORKFLOW_STEP_DEFS.map((def, index) => {
    const meta = timestamps[def.id];
    return {
      id: def.id,
      label: def.label,
      description: def.description,
      status: stepStatus(index, completedThrough),
      completedAt: meta?.at ?? null,
      actor: meta?.actor ?? null,
    };
  });
}

export type PipelineBucket = {
  readonly stepId: EvaluationWorkflowStepId;
  readonly label: string;
  readonly candidates: readonly { id: number; name: string; role: string }[];
};

/** Candidates grouped by their current in-progress workflow step. */
export function getEvaluationPipeline(): readonly PipelineBucket[] {
  return EVALUATION_WORKFLOW_STEP_DEFS.map((def, stepIndex) => {
    const inStep = candidates.filter((c) => {
      const steps = getEvaluationWorkflowForCandidate(c.id);
      const inProgress = steps.find((s) => s.status === 'in_progress');
      if (inProgress) return inProgress.id === def.id;
      if (steps.every((s) => s.status === 'completed')) {
        return stepIndex === EVALUATION_WORKFLOW_STEP_DEFS.length - 1;
      }
      return false;
    });

    return {
      stepId: def.id,
      label: def.label,
      candidates: inStep.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        role: c.headline ?? 'Candidate',
      })),
    };
  });
}

export function getWorkflowProgressPercent(candidateId: number): number {
  const steps = getEvaluationWorkflowForCandidate(candidateId);
  const done = steps.filter((s) => s.status === 'completed').length;
  return Math.round((done / steps.length) * 100);
}
