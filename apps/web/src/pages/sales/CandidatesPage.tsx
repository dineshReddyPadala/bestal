import { CandidateListingView } from '../../components/candidates/CandidateListingView';

export function SalesCandidatesPage() {
  return (
    <CandidateListingView
      title="Candidates"
      basePath="/sales/candidates"
      readOnly
    />
  );
}
