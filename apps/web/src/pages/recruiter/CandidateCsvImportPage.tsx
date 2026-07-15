import { CsvImportScreen } from '../../components/import/CsvImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CsvImportScreen
      cancelPath="/recruiter/candidates"
      title="Data Import"
      description="Bulk import candidates into your recruiting pipeline"
    />
  );
}
