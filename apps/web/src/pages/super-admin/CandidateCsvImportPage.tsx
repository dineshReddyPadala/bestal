import { CsvImportScreen } from '../../components/import/CsvImportScreen';

export function SuperAdminCandidateCsvImportPage() {
  return (
    <CsvImportScreen
      cancelPath="/super-admin/candidates"
      title="Data Import"
    />
  );
}
