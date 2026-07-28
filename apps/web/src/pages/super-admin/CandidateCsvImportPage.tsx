import { CandidateImportScreen } from '../../components/import/CandidateImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CandidateImportScreen
      cancelPath="/super-admin/candidates"
      title="Candidate Data Import"
    />
  );
}

export const SuperAdminCandidateCsvImportPage = CandidateCsvImportPage;
