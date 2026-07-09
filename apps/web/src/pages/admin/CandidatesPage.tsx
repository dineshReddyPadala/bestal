import { CandidateListingView } from '../../components/candidates/CandidateListingView';

export function CandidatesPage() {
  return (
    <CandidateListingView
      basePath="/admin/candidates"
      addCandidatePath="/admin/candidates/new"
      title="Candidates"
    />
  );
}
