import { CandidateListingView } from '../../components/candidates/CandidateListingView';

export function SalesCandidatesPage() {
  return (
    <CandidateListingView
      title="Candidate Search"
      basePath="/sales/candidates"
      readOnly
    />
  );
}
