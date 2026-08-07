import { CandidateListingView } from '../../components/candidates/CandidateListingView';

export function CandidatesPage() {
  return (
    <CandidateListingView
      basePath="/recruiter/candidates"
      importPath="/recruiter/candidates/import"
      title="Candidates"
      enableSubmitForApproval
    />
  );
}
