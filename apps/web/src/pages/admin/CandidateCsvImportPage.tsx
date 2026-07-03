import { CsvImportScreen } from '../../components/import/CsvImportScreen';

export function CandidateCsvImportPage() {
  return (
    <CsvImportScreen
      cancelPath="/admin/candidates"
      title="CSV Import"
      description="Bulk import candidates into the BesTal talent pool"
    />
  );
}
