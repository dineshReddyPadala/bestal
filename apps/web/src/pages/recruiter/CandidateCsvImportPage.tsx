import { CandidateImportScreen } from '../../components/import/CandidateImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CandidateImportScreen
      cancelPath="/recruiter/candidates"
      title="Candidate Data Import"
    />
  );
}
