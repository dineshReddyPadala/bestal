import { CandidateImportScreen } from '../../components/import/CandidateImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CandidateImportScreen
      cancelPath="/admin/candidates"
      title="Candidate Data Import"
    />
  );
}
