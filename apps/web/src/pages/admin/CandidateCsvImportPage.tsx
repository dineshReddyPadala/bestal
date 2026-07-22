import { CsvImportScreen } from '../../components/import/CsvImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CsvImportScreen
      cancelPath="/admin/candidates"
      title="Data Import"
    />
  );
}
