import ExcelJS from 'exceljs';
import {
  BGV_SHEET_COLUMNS,
  CANDIDATE_SHEET_COLUMNS,
  EVALUATION_SHEET_COLUMNS,
  IMPORT_AVAILABILITY_STATUSES,
  IMPORT_BGV_STATUSES,
  IMPORT_CANDIDATE_SOURCES,
  IMPORT_CURRENCIES,
  IMPORT_EVALUATION_TYPES,
  IMPORT_INSTRUCTIONS,
  IMPORT_PROFICIENCY_LEVELS,
  IMPORT_RECOMMENDATION_VALUES,
  IMPORT_SCORE_SOURCES,
  IMPORT_SKILL_COMMUNITIES,
  IMPORT_TIMEZONES,
  IMPORT_WORKBOOK_SHEETS,
  SCORES_SHEET_COLUMNS,
  SKILLS_SHEET_COLUMNS,
} from '@bestal/shared-utils';

const DROPDOWN_HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFF9C4' },
};

function styleHeader(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8EEF7' },
  };
}

function highlightDropdownHeaders(
  sheet: ExcelJS.Worksheet,
  headers: readonly string[],
  columnKeys: readonly string[],
): void {
  for (const key of columnKeys) {
    const index = headers.indexOf(key);
    if (index >= 0) {
      sheet.getCell(1, index + 1).fill = DROPDOWN_HEADER_FILL;
    }
  }
}

function addSheetWithHeaders(
  workbook: ExcelJS.Workbook,
  name: string,
  headers: readonly string[],
  dropdownColumns: readonly string[] = [],
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet(name);
  sheet.addRow([...headers]);
  styleHeader(sheet.getRow(1));
  if (dropdownColumns.length) {
    highlightDropdownHeaders(sheet, headers, dropdownColumns);
  }
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.max(14, Math.min(28, header.length + 4)),
  }));
  return sheet;
}

function addMetadataSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  values: readonly string[],
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet(name);
  sheet.addRow(['value']);
  styleHeader(sheet.getRow(1));
  for (const value of values) {
    sheet.addRow([value]);
  }
  sheet.getColumn(1).width = 28;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.state = 'veryHidden';
  return sheet;
}

function applyListValidation(
  sheet: ExcelJS.Worksheet,
  columnKey: string,
  headers: readonly string[],
  sourceSheetName: string,
  sourceRowCount: number,
  options?: { allowBlank?: boolean; fromRow?: number; toRow?: number },
): void {
  const colIndex = headers.indexOf(columnKey) + 1;
  if (colIndex <= 0) return;
  const allowBlank = options?.allowBlank ?? true;
  const fromRow = options?.fromRow ?? 2;
  const toRow = options?.toRow ?? 1002;
  const formula = `'${sourceSheetName}'!$A$2:$A$${sourceRowCount}`;
  for (let row = fromRow; row <= toRow; row += 1) {
    sheet.getCell(row, colIndex).dataValidation = {
      type: 'list',
      allowBlank,
      formulae: [formula],
    };
  }
}

export type CandidateImportTemplateOptions = {
  skillCommunities?: readonly string[];
  timezones?: readonly string[];
  currencies?: readonly string[];
};

export async function buildCandidateImportTemplate(
  options: CandidateImportTemplateOptions = {},
): Promise<Buffer> {
  const skillCommunities =
    options.skillCommunities?.length ? options.skillCommunities : IMPORT_SKILL_COMMUNITIES;
  const timezones = options.timezones?.length ? options.timezones : IMPORT_TIMEZONES;
  const currencies = options.currencies?.length ? options.currencies : IMPORT_CURRENCIES;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BesTal';
  workbook.created = new Date();

  const candidateDropdownColumns = [
    'source',
    'availability_status',
    'currency',
    'skill_community',
    'timezone',
  ] as const;

  const candidateSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.CANDIDATE,
    CANDIDATE_SHEET_COLUMNS,
    candidateDropdownColumns,
  );
  candidateSheet.addRow({
    candidate_id: '1001',
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada.lovelace@example.com',
    phone: '+1-555-0100',
    location: 'London',
    country: 'UK',
    timezone: 'Europe/London',
    headline: 'Senior Full Stack Engineer',
    years_experience: 8,
    primary_role: 'Full Stack Engineer',
    skill_community: skillCommunities[0] ?? 'Full Stack',
    summary: 'Experienced engineer with strong product sense.',
    ai_summary: '',
    strengths: 'React|System Design|Communication',
    weaknesses: '',
    availability_status: 'AVAILABLE',
    available_from: '2026-08-01',
    bill_rate: 85,
    pay_rate: 55,
    currency: 'USD',
    source: 'OTHER',
    linkedin_url: 'https://linkedin.com/in/example',
    github_url: 'https://github.com/example',
    portfolio_url: '',
    current_company: 'Example Corp',
    current_title: 'Staff Engineer',
    education: 'BSc Computer Science',
    notice_period: '2 weeks',
    notice_period_days: 14,
    preferred_shift: 'Day',
    preferred_engagement: 'CONTRACT',
    min_hours_per_week: 32,
    max_hours_per_week: 40,
    hours_per_week: 40,
    timezone_overlap: '4 hours EST',
    resume_url: '',
  });

  const skillsSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SKILLS,
    SKILLS_SHEET_COLUMNS,
    ['proficiency'],
  );
  skillsSheet.addRow({
    candidate_id: '1001',
    skill_name: 'React',
    proficiency: 'Advanced',
    years_experience: 6,
    is_primary: 'Yes',
  });

  const evaluationSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.EVALUATION,
    EVALUATION_SHEET_COLUMNS,
    ['evaluation_type', 'recommendation'],
  );
  evaluationSheet.addRow({
    candidate_id: '1001',
    evaluation_type: 'Live Technical Interview',
    evaluation_date: '2026-07-15',
    evaluator_name: 'Jane Recruiter',
    evaluator_company: 'BesTal',
    technical_score: 88,
    communication_score: 90,
    problem_solving_score: 85,
    architecture_score: 80,
    client_readiness_score: 87,
    recommendation: 'Hire',
    evaluation_summary: 'Strong technical depth and clear communication.',
    ai_evaluation_summary: '',
    comments: '',
  });

  const bgvDropdownColumns = [
    'bgv_status',
    'id_check_status',
    'address_check_status',
    'employment_check_status',
    'education_check_status',
    'criminal_check_status',
    'reference_check_status',
  ] as const;

  const bgvSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.BGV,
    BGV_SHEET_COLUMNS,
    bgvDropdownColumns,
  );
  bgvSheet.addRow({
    candidate_id: '1001',
    bgv_status: 'INITIATED',
    vendor: 'Example BGV Vendor',
    id_check_status: 'PENDING',
    address_check_status: 'PENDING',
    employment_check_status: 'PENDING',
    education_check_status: 'PENDING',
    criminal_check_status: 'PENDING',
    reference_check_status: 'PENDING',
    initiated_date: '2026-07-20',
    completed_date: '',
    bgv_summary: '',
    concern_notes: '',
  });

  const scoresSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SCORES,
    SCORES_SHEET_COLUMNS,
    ['score_source'],
  );
  scoresSheet.addRow({
    candidate_id: '1001',
    bestal_score: 86,
    technical_score: 88,
    communication_score: 90,
    problem_solving_score: 85,
    architecture_score: 80,
    reliability_score: 84,
    client_readiness_score: 87,
    score_source: 'MANUAL',
    score_date: '2026-07-15',
  });

  const communitySheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES,
    skillCommunities,
  );
  const availabilitySheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS,
    IMPORT_AVAILABILITY_STATUSES,
  );
  const evaluationTypesSheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.EVALUATION_TYPES,
    IMPORT_EVALUATION_TYPES,
  );
  const bgvStatusSheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.BGV_STATUS,
    IMPORT_BGV_STATUSES,
  );
  const sourceSheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES,
    IMPORT_CANDIDATE_SOURCES,
  );
  const proficiencySheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.PROFICIENCY_LEVELS,
    IMPORT_PROFICIENCY_LEVELS,
  );
  const recommendationSheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.RECOMMENDATION_VALUES,
    IMPORT_RECOMMENDATION_VALUES,
  );
  const currencySheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.CURRENCY,
    currencies,
  );
  const timezoneSheet = addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.TIMEZONES,
    timezones,
  );
  const scoreSourcesSheet = addMetadataSheet(workbook, 'Score Sources_values', IMPORT_SCORE_SOURCES);

  const instructions = workbook.addWorksheet(IMPORT_WORKBOOK_SHEETS.IMPORT_INSTRUCTIONS);
  instructions.addRow(['Instruction']);
  styleHeader(instructions.getRow(1));
  for (const line of IMPORT_INSTRUCTIONS) {
    instructions.addRow([line]);
  }
  instructions.addRow([`Allowed score_source values: ${IMPORT_SCORE_SOURCES.join(', ')}`]);
  instructions.getColumn(1).width = 110;
  instructions.views = [{ state: 'frozen', ySplit: 1 }];

  for (const column of candidateDropdownColumns) {
    applyListValidation(
      candidateSheet,
      column,
      CANDIDATE_SHEET_COLUMNS,
      column === 'source'
        ? IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES
        : column === 'availability_status'
          ? IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS
          : column === 'currency'
            ? IMPORT_WORKBOOK_SHEETS.CURRENCY
            : column === 'skill_community'
              ? IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES
              : IMPORT_WORKBOOK_SHEETS.TIMEZONES,
      column === 'source'
        ? sourceSheet.rowCount
        : column === 'availability_status'
          ? availabilitySheet.rowCount
          : column === 'currency'
            ? currencySheet.rowCount
            : column === 'skill_community'
              ? communitySheet.rowCount
              : timezoneSheet.rowCount,
      { allowBlank: column !== 'source' },
    );
  }

  applyListValidation(
    skillsSheet,
    'proficiency',
    SKILLS_SHEET_COLUMNS,
    IMPORT_WORKBOOK_SHEETS.PROFICIENCY_LEVELS,
    proficiencySheet.rowCount,
  );

  applyListValidation(
    evaluationSheet,
    'evaluation_type',
    EVALUATION_SHEET_COLUMNS,
    IMPORT_WORKBOOK_SHEETS.EVALUATION_TYPES,
    evaluationTypesSheet.rowCount,
  );
  applyListValidation(
    evaluationSheet,
    'recommendation',
    EVALUATION_SHEET_COLUMNS,
    IMPORT_WORKBOOK_SHEETS.RECOMMENDATION_VALUES,
    recommendationSheet.rowCount,
  );

  for (const column of bgvDropdownColumns) {
    applyListValidation(
      bgvSheet,
      column,
      BGV_SHEET_COLUMNS,
      IMPORT_WORKBOOK_SHEETS.BGV_STATUS,
      bgvStatusSheet.rowCount,
    );
  }

  applyListValidation(
    scoresSheet,
    'score_source',
    SCORES_SHEET_COLUMNS,
    'Score Sources_values',
    scoreSourcesSheet.rowCount,
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function buildCandidateImportErrorReport(
  errors: Array<{
    sheetName: string;
    rowNumber?: number | null;
    sourceCandidateId?: string | null;
    columnName?: string | null;
    suppliedValue?: string | null;
    errorCode: string;
    message: string;
  }>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Import Errors');
  const headers = [
    'sheet_name',
    'row_number',
    'candidate_id',
    'column_name',
    'supplied_value',
    'error_code',
    'message',
  ];
  sheet.addRow(headers);
  styleHeader(sheet.getRow(1));
  for (const error of errors) {
    sheet.addRow([
      error.sheetName,
      error.rowNumber ?? '',
      error.sourceCandidateId ?? '',
      error.columnName ?? '',
      error.suppliedValue ?? '',
      error.errorCode,
      error.message,
    ]);
  }
  sheet.columns = headers.map((header) => ({
    header,
    width: Math.max(16, Math.min(40, header.length + 8)),
  }));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
