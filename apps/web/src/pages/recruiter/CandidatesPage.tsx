import { CandidateListingView } from '../../components/candidates/CandidateListingView';

export function CandidatesPage() {
  return (
    <CandidateListingView
      basePath="/recruiter/candidates"
      addCandidatePath="/recruiter/candidates/new"
      importPath="/recruiter/candidates/import"
      title="Candidates"
      enableSubmitForApproval
    />
  );
}
