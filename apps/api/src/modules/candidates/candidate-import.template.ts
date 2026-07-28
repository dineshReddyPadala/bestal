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
  IMPORT_WORKBOOK_SHEETS,
  SCORES_SHEET_COLUMNS,
  SKILLS_SHEET_COLUMNS,
} from '@bestal/shared-utils';

function styleHeader(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8EEF7' },
  };
}

function addSheetWithHeaders(
  workbook: ExcelJS.Workbook,
  name: string,
  headers: readonly string[],
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet(name);
  sheet.addRow([...headers]);
  styleHeader(sheet.getRow(1));
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
): void {
  const sheet = workbook.addWorksheet(name);
  sheet.addRow(['value']);
  styleHeader(sheet.getRow(1));
  for (const value of values) {
    sheet.addRow([value]);
  }
  sheet.getColumn(1).width = 28;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

export async function buildCandidateImportTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BesTal';
  workbook.created = new Date();

  const candidateSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.CANDIDATE,
    CANDIDATE_SHEET_COLUMNS,
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
    skill_community: 'Full Stack',
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
    notice_period: '2 weeks',
    preferred_shift: 'Day',
    timezone_overlap: '4 hours EST',
    resume_url: '',
  });

  const skillsSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SKILLS,
    SKILLS_SHEET_COLUMNS,
  );
  skillsSheet.addRow({
    candidate_id: '1001',
    skill_name: 'React',
    skill_category: 'Frontend',
    proficiency: 'Advanced',
    years_experience: 6,
    is_primary: 'Yes',
  });
  skillsSheet.addRow({
    candidate_id: '1001',
    skill_name: 'Node.js',
    skill_category: 'Backend',
    proficiency: 'Advanced',
    years_experience: 5,
    is_primary: 'No',
  });

  const evaluationSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.EVALUATION,
    EVALUATION_SHEET_COLUMNS,
  );
  evaluationSheet.addRow({
    candidate_id: '1001',
    evaluation_type: 'TECHNICAL_INTERVIEW',
    evaluation_date: '2026-07-15',
    evaluator_name: 'Jane Recruiter',
    evaluator_company: 'BesTal',
    technical_score: 88,
    communication_score: 90,
    problem_solving_score: 85,
    architecture_score: 80,
    client_readiness_score: 87,
    recommendation: 'HIRE',
    evaluation_summary: 'Strong technical depth and clear communication.',
    ai_evaluation_summary: '',
    comments: '',
  });

  const bgvSheet = addSheetWithHeaders(
    workbook,
    IMPORT_WORKBOOK_SHEETS.BGV,
    BGV_SHEET_COLUMNS,
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

  addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES,
    IMPORT_SKILL_COMMUNITIES,
  );
  addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS,
    IMPORT_AVAILABILITY_STATUSES,
  );
  addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.EVALUATION_TYPES,
    IMPORT_EVALUATION_TYPES,
  );
  addMetadataSheet(workbook, IMPORT_WORKBOOK_SHEETS.BGV_STATUS, IMPORT_BGV_STATUSES);
  addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES,
    IMPORT_CANDIDATE_SOURCES,
  );
  addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.PROFICIENCY_LEVELS,
    IMPORT_PROFICIENCY_LEVELS,
  );
  addMetadataSheet(
    workbook,
    IMPORT_WORKBOOK_SHEETS.RECOMMENDATION_VALUES,
    IMPORT_RECOMMENDATION_VALUES,
  );
  addMetadataSheet(workbook, IMPORT_WORKBOOK_SHEETS.CURRENCY, IMPORT_CURRENCIES);

  const instructions = workbook.addWorksheet(IMPORT_WORKBOOK_SHEETS.IMPORT_INSTRUCTIONS);
  instructions.addRow(['Instruction']);
  styleHeader(instructions.getRow(1));
  for (const line of IMPORT_INSTRUCTIONS) {
    instructions.addRow([line]);
  }
  instructions.addRow([`Allowed score_source values: ${IMPORT_SCORE_SOURCES.join(', ')}`]);
  instructions.getColumn(1).width = 110;
  instructions.views = [{ state: 'frozen', ySplit: 1 }];

  // Data validations / dropdowns for key Candidate columns
  const sourceSheet = workbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES)!;
  const availabilitySheet = workbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS)!;
  const currencySheet = workbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.CURRENCY)!;
  const communitySheet = workbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES)!;

  candidateSheet.getColumn('source').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
    if (rowNumber === 1) return;
    cell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES}'!$A$2:$A$${sourceSheet.rowCount}`],
    };
  });
  candidateSheet.getColumn('availability_status').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
    if (rowNumber === 1) return;
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS}'!$A$2:$A$${availabilitySheet.rowCount}`],
    };
  });
  candidateSheet.getColumn('currency').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
    if (rowNumber === 1) return;
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.CURRENCY}'!$A$2:$A$${currencySheet.rowCount}`],
    };
  });
  candidateSheet.getColumn('skill_community').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
    if (rowNumber === 1) return;
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES}'!$A$2:$A$${communitySheet.rowCount}`],
    };
  });

  // Pre-apply dropdowns for a generous preview/edit range
  for (let row = 2; row <= 1002; row += 1) {
    candidateSheet.getCell(row, CANDIDATE_SHEET_COLUMNS.indexOf('source') + 1).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES}'!$A$2:$A$${sourceSheet.rowCount}`],
    };
    candidateSheet.getCell(row, CANDIDATE_SHEET_COLUMNS.indexOf('availability_status') + 1).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS}'!$A$2:$A$${availabilitySheet.rowCount}`],
    };
    candidateSheet.getCell(row, CANDIDATE_SHEET_COLUMNS.indexOf('currency') + 1).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.CURRENCY}'!$A$2:$A$${currencySheet.rowCount}`],
    };
    candidateSheet.getCell(row, CANDIDATE_SHEET_COLUMNS.indexOf('skill_community') + 1).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'${IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES}'!$A$2:$A$${communitySheet.rowCount}`],
    };
  }

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
