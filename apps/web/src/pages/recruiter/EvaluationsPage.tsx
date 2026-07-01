import { evaluations } from '@bestal/mock-data';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';

export function EvaluationsPage() {
  return (
    <div>
      <PageHeader
        title="Evaluations"
        description="Technical and behavioral assessments for candidates"
      />

      <div className="p-6">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Candidate</DataTableHead>
              <DataTableHead>Skill community</DataTableHead>
              <DataTableHead>Evaluator</DataTableHead>
              <DataTableHead>Overall</DataTableHead>
              <DataTableHead>Technical</DataTableHead>
              <DataTableHead>Communication</DataTableHead>
              <DataTableHead>Recommendation</DataTableHead>
              <DataTableHead>Status</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {evaluations.map((evaluation) => (
              <DataTableRow key={evaluation.id}>
                <DataTableCell className="font-medium">{evaluation.candidateName}</DataTableCell>
                <DataTableCell>{evaluation.skillCommunity}</DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {evaluation.evaluatorName}
                </DataTableCell>
                <DataTableCell>
                  {evaluation.overallScore !== null ? `${evaluation.overallScore}/10` : '—'}
                </DataTableCell>
                <DataTableCell>
                  {evaluation.technicalScore !== null ? `${evaluation.technicalScore}/10` : '—'}
                </DataTableCell>
                <DataTableCell>
                  {evaluation.communicationScore !== null
                    ? `${evaluation.communicationScore}/10`
                    : '—'}
                </DataTableCell>
                <DataTableCell>
                  {evaluation.recommendation ? (
                    <StatusBadge status={evaluation.recommendation} />
                  ) : (
                    '—'
                  )}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={evaluation.status} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
