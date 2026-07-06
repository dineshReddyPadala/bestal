import { EvaluationsPage as SharedEvaluationsPage } from '../shared/EvaluationsPage';

export function EvaluationsPage() {
  return (
    <SharedEvaluationsPage
      candidateBasePath="/admin/candidates"
      title="Evaluation Management"
      description="Review scores, recordings, and hiring recommendations across all candidates"
    />
  );
}
