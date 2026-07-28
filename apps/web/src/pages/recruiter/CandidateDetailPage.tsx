import { useParams } from 'react-router-dom';
import { CandidatePipelinePanel } from '../../components/candidates/CandidatePipelinePanel';
import { CandidateDetailView } from '../../components/enterprise/CandidateDetailView';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  return (
    <div className="space-y-6">
      <CandidatePipelinePanel candidateId={candidateId} basePath="/recruiter/candidates" />
      <CandidateDetailView candidateId={candidateId} basePath="/recruiter/candidates" />
    </div>
  );
}
