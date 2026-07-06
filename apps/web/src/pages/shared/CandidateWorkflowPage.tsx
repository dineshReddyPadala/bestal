import { useParams } from 'react-router-dom';
import { CandidateEvaluationWorkflowView } from '../../components/evaluations/CandidateEvaluationWorkflowView';
import { PageHeader } from '@bestal/ui';
import { getSchemaCandidate } from '@bestal/mock-data';

type CandidateWorkflowPageProps = {
  basePath: '/admin/candidates' | '/recruiter/candidates';
};

export function CandidateWorkflowPage({ basePath }: CandidateWorkflowPageProps) {
  const { id } = useParams();
  const candidateId = Number(id);
  const record = getSchemaCandidate(candidateId);
  const fullName = record ? `${record.firstName} ${record.lastName}` : 'Candidate';

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title={`Evaluation Workflow — ${fullName}`}
        description="End-to-end path from candidate intake to client visibility"
      />
      <div className="p-4 sm:p-6">
        <CandidateEvaluationWorkflowView candidateId={candidateId} basePath={basePath} />
      </div>
    </div>
  );
}
