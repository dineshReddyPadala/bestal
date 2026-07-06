import { EvaluationsPage as SharedEvaluationsPage } from '../shared/EvaluationsPage';

export function EvaluationsPage() {
  return (
    <SharedEvaluationsPage
      candidateBasePath="/recruiter/candidates"
      title="Evaluation Management"
      description="Review scores, recordings, and hiring recommendations for your candidates"
    />
  );
}
