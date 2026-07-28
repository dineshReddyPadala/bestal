export const CANDIDATE_CSV_HEADERS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'location',
  'timezone',
  'headline',
  'years_experience',
  'primary_role',
  'summary',
  'ai_summary',
  'bestal_score',
  'strengths',
  'weaknesses',
  'skills',
  'bill_rate',
  'pay_rate',
  'currency',
  'availability_status',
  'available_from',
  'source',
  'oorwin_candidate_id',
] as const;

export type CandidateCsvHeader = (typeof CANDIDATE_CSV_HEADERS)[number];

export type CsvImportRow = {
  readonly rowNumber: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly timezone: string;
  readonly headline: string;
  readonly yearsExperience: string;
  readonly primaryRole: string;
  readonly billRate: string;
  readonly currency: string;
  readonly source: string;
  readonly errors: readonly string[];
  readonly isDuplicate: boolean;
  readonly duplicateOf: string | null;
};

export type CsvValidationResult = {
  readonly rows: readonly CsvImportRow[];
  readonly totalRows: number;
  readonly validCount: number;
  readonly errorCount: number;
  readonly duplicateCount: number;
  readonly readyCount: number;
  readonly isValid: boolean;
  readonly headerValid: boolean;
};

export type CsvImportSummary = {
  readonly imported: number;
  readonly skippedDuplicates: number;
  readonly failed: number;
  readonly totalProcessed: number;
};

const VALID_SOURCES = new Set([
  'DIRECT',
  'REFERRAL',
  'JOB_BOARD',
  'LINKEDIN',
  'AGENCY',
  'INTERNAL',
  'OTHER',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimal RFC4180-style CSV parser (handles quoted fields). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field.trim());
      field = '';
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(field.trim());
      field = '';
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      if (char === '\r') i++;
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export function generateTemplateCsv(): string {
  const header = CANDIDATE_CSV_HEADERS.join(',');
  const sample = [
    'Jordan',
    'Lee',
    'jordan.lee@email.com',
    '+1 (415) 555-0199',
    'Austin, TX',
    'America/Chicago',
    'Senior React Engineer',
    '8',
    'Full-Stack Engineer',
    'Strong React and Node background',
    'Experienced full-stack engineer',
    '82',
    'React|TypeScript',
    '',
    'React|Node',
    '145',
    '110',
    'USD',
    'AVAILABLE',
    '2026-08-01',
    'LINKEDIN',
    'OOR-1001',
  ].join(',');
  return `${header}\n${sample}\n`;
}

export function downloadTemplateCsv(): void {
  const blob = new Blob([generateTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bestal-candidate-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

function mapRow(cells: string[], rowNumber: number): Omit<CsvImportRow, 'errors' | 'isDuplicate' | 'duplicateOf'> {
  const get = (index: number) => cells[index]?.trim() ?? '';
  return {
    rowNumber,
    firstName: get(0),
    lastName: get(1),
    email: get(2),
    phone: get(3),
    location: get(4),
    timezone: get(5),
    headline: get(6),
    yearsExperience: get(7),
    primaryRole: get(8),
    billRate: get(15),
    currency: get(17).toUpperCase(),
    source: get(20).toUpperCase(),
  };
}

function validateRow(
  row: Omit<CsvImportRow, 'errors' | 'isDuplicate' | 'duplicateOf'>,
  seenEmails: Set<string>,
): CsvImportRow {
  const errors: string[] = [];

  if (!row.firstName) errors.push('First name is required');
  if (!row.lastName) errors.push('Last name is required');
  if (!row.email) {
    errors.push('Email is required');
  } else if (!EMAIL_RE.test(row.email)) {
    errors.push('Invalid email format');
  }

  if (row.yearsExperience && Number.isNaN(Number(row.yearsExperience))) {
    errors.push('Years experience must be a number');
  }
  if (row.billRate && Number.isNaN(Number(row.billRate))) {
    errors.push('Bill rate must be a number');
  }
  if (row.source && !VALID_SOURCES.has(row.source)) {
    errors.push(`Invalid source (use ${[...VALID_SOURCES].join(', ')})`);
  }
  if (row.currency && row.currency.length !== 3) {
    errors.push('Currency must be a 3-letter code');
  }

  const emailKey = row.email.toLowerCase();
  let isDuplicate = false;
  let duplicateOf: string | null = null;

  if (emailKey && seenEmails.has(emailKey)) {
    isDuplicate = true;
    duplicateOf = row.email;
    errors.push('Duplicate — email repeated in this file');
  } else if (emailKey) {
    seenEmails.add(emailKey);
  }

  return { ...row, errors, isDuplicate, duplicateOf };
}

export function validateCandidateCsv(text: string): CsvValidationResult {
  const parsed = parseCsv(text);
  if (parsed.length === 0) {
    return {
      rows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      readyCount: 0,
      isValid: false,
      headerValid: false,
    };
  }

  const headerRow = parsed[0]!.map(normalizeHeader);
  const expected = [...CANDIDATE_CSV_HEADERS];
  const headerValid = expected.every((h, i) => headerRow[i] === h);
  const dataRows = headerValid ? parsed.slice(1) : parsed;
  const seenEmails = new Set<string>();

  const rows = dataRows.map((cells, index) => {
    const rowNumber = headerValid ? index + 2 : index + 1;
    const mapped = mapRow(cells, rowNumber);
    const validated = validateRow(mapped, seenEmails);
    if (!headerValid && index === 0) {
      return {
        ...validated,
        errors: [
          ...validated.errors,
          'Header row does not match template — download template for correct columns',
        ],
      };
    }
    return validated;
  });

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;
  const errorCount = rows.filter((r) => r.errors.length > 0 && !r.isDuplicate).length;
  const readyCount = rows.filter((r) => r.errors.length === 0).length;

  return {
    rows,
    totalRows: rows.length,
    validCount,
    errorCount,
    duplicateCount,
    readyCount,
    isValid: rows.length > 0 && errorCount === 0 && duplicateCount === 0 && headerValid,
    headerValid,
  };
}

export function simulateImport(result: CsvValidationResult): CsvImportSummary {
  const imported = result.rows.filter((r) => r.errors.length === 0).length;
  const skippedDuplicates = result.rows.filter((r) => r.isDuplicate).length;
  const failed = result.rows.filter((r) => r.errors.length > 0 && !r.isDuplicate).length;

  return {
    imported,
    skippedDuplicates,
    failed,
    totalProcessed: result.totalRows,
  };
}

/** Demo CSV with one duplicate (Alexandra) and one invalid row for validation UX. */
export const DEMO_CSV_WITH_ISSUES = `first_name,last_name,email,phone,location,headline,years_experience,primary_skill,source,expected_rate,currency,timezone
Alexandra,Petrov,alexandra.petrov@email.com,+1 (415) 555-0101,San Francisco CA,Staff Engineer,10,Full-Stack Development,LINKEDIN,155,USD,America/Los_Angeles
Taylor,Reed,taylor.reed@email.com,+1 (512) 555-0188,Austin TX,DevOps Engineer,6,DevOps & Cloud,REFERRAL,140,USD,America/Chicago
Sam,Invalid,,+1 (212) 555-0177,New York NY,Backend Engineer,5,Full-Stack Development,LINKEDIN,130,USD,America/New_York
Morgan,Chen,morgan.chen@email.com,+1 (206) 555-0166,Seattle WA,ML Engineer,7,Machine Learning,AGENCY,160,USD,America/Los_Angeles
`;
