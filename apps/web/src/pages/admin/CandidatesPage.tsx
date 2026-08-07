import { CandidateListingView } from '../../components/candidates/CandidateListingView';

export function CandidatesPage() {
  return (
    <CandidateListingView
      basePath="/admin/candidates"
      importPath="/admin/candidates/import"
      title="Candidates"
    />
  );
}
