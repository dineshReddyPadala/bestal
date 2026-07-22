import { CsvImportScreen } from '../../components/import/CsvImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CsvImportScreen
      cancelPath="/recruiter/candidates"
      title="Data Import"
    />
  );
}
