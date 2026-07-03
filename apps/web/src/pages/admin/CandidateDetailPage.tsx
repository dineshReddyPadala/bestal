import { useParams } from 'react-router-dom';
import { CandidateDetailView } from '../../components/enterprise/CandidateDetailView';

export function CandidateDetailPage() {
  const { id } = useParams();
  return <CandidateDetailView candidateId={Number(id)} basePath="/admin/candidates" />;
}
