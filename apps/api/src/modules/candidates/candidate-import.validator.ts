import ExcelJS from 'exceljs';
import {
  BGV_SHEET_COLUMNS,
  CANDIDATE_REQUIRED_FIELDS,
  CANDIDATE_SHEET_COLUMNS,
  EVALUATION_SHEET_COLUMNS,
  IMPORT_AVAILABILITY_STATUSES,
  IMPORT_BGV_STATUSES,
  IMPORT_CANDIDATE_SOURCES,
  IMPORT_CURRENCIES,
  IMPORT_DATA_SHEETS,
  IMPORT_EVALUATION_TYPES,
  IMPORT_PREFERRED_ENGAGEMENTS,
  IMPORT_PROFICIENCY_LEVELS,
  IMPORT_RECOMMENDATION_VALUES,
  IMPORT_SKILL_COMMUNITY_ALIASES,
  IMPORT_SCORE_SOURCES,
  IMPORT_SKILL_COMMUNITIES,
  IMPORT_UPLOAD_REQUIRED_SHEETS,
  IMPORT_WORKBOOK_SHEETS,
  SCORES_SHEET_COLUMNS,
  SKILLS_SHEET_COLUMNS,
  normalizeEvaluationRecommendation,
  normalizeEvaluationType,
  parseNoticePeriodToDays,
} from '@bestal/shared-utils';
import type {
  CandidateAvailabilityStatus,
  CandidateScoreSource,
  CandidateSource,
  ProficiencyLevel,
} from '@prisma/client';
import type {
  ImportValidationError,
  NormalizedBgvRow,
  NormalizedCandidateImport,
  NormalizedEvaluationRow,
  NormalizedScoreRow,
  NormalizedSkillRow,
} from './candidate-import.types.js';

export const IMPORT_LIMITS = {
  maxFileBytes: 50 * 1024 * 1024,
  maxCandidates: 10000,
  maxRelatedRows: 100000,
  maxCellLength: 10000,
  previewExpiryHours: 24,
  chunkSize: 100,
  rowConcurrency: 5,
} as const;

type RawRow = Record<string, string>;

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'object') {
    if ('result' in value && value.result != null) {
      return cellToString(value.result as ExcelJS.CellValue);
    }
    if ('text' in value && typeof value.text === 'string') {
      return value.text.trim();
    }
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? '').join('').trim();
    }
    if ('formula' in value) {
      return '';
    }
  }
  return String(value).trim();
}

function pushError(
  errors: ImportValidationError[],
  error: ImportValidationError,
): void {
  errors.push(error);
}

function readSheetRows(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  expectedHeaders: readonly string[],
  errors: ImportValidationError[],
): RawRow[] {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    pushError(errors, {
      sheetName,
      errorCode: 'MISSING_SHEET',
      message: `Required sheet "${sheetName}" is missing.`,
    });
    return [];
  }

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = cellToString(cell.value);
  });

  // Trim trailing empty headers
  while (headers.length && !headers[headers.length - 1]) {
    headers.pop();
  }

  if (headers.length !== expectedHeaders.length) {
    pushError(errors, {
      sheetName,
      rowNumber: 1,
      errorCode: 'INVALID_HEADERS',
      message: `Sheet "${sheetName}" must have exactly ${expectedHeaders.length} columns.`,
    });
  }

  for (let i = 0; i < expectedHeaders.length; i += 1) {
    if ((headers[i] ?? '') !== expectedHeaders[i]) {
      pushError(errors, {
        sheetName,
        rowNumber: 1,
        columnName: expectedHeaders[i],
        suppliedValue: headers[i] ?? '',
        errorCode: 'INVALID_HEADER',
        message: `Expected column "${expectedHeaders[i]}" at position ${i + 1}, found "${headers[i] ?? ''}".`,
      });
    }
  }

  const rows: RawRow[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const raw: RawRow = {};
    let empty = true;
    for (let i = 0; i < expectedHeaders.length; i += 1) {
      const value = cellToString(row.getCell(i + 1).value);
      if (value.length > IMPORT_LIMITS.maxCellLength) {
        pushError(errors, {
          sheetName,
          rowNumber,
          columnName: expectedHeaders[i],
          errorCode: 'CELL_TOO_LONG',
          message: `Cell exceeds ${IMPORT_LIMITS.maxCellLength} characters.`,
        });
      }
      raw[expectedHeaders[i]] = value;
      if (value) empty = false;
    }
    if (!empty) {
      rows.push(raw);
      // stash row number
      (raw as RawRow & { __rowNumber: string }).__rowNumber = String(rowNumber);
    }
  });

  return rows;
}

function parseDate(
  value: string,
  sheetName: string,
  rowNumber: number,
  columnName: string,
  errors: ImportValidationError[],
  sourceCandidateId?: string,
): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'INVALID_DATE',
      message: 'Dates must use YYYY-MM-DD.',
    });
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'INVALID_DATE',
      message: 'Invalid calendar date.',
    });
    return null;
  }
  return value;
}

function parseNumber(
  value: string,
  sheetName: string,
  rowNumber: number,
  columnName: string,
  errors: ImportValidationError[],
  sourceCandidateId?: string,
  opts?: { min?: number; max?: number; integer?: boolean },
): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'INVALID_NUMBER',
      message: 'Value must be numeric.',
    });
    return null;
  }
  if (opts?.integer && !Number.isInteger(parsed)) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'INVALID_NUMBER',
      message: 'Value must be an integer.',
    });
    return null;
  }
  if (opts?.min != null && parsed < opts.min) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'OUT_OF_RANGE',
      message: `Value must be >= ${opts.min}.`,
    });
    return null;
  }
  if (opts?.max != null && parsed > opts.max) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'OUT_OF_RANGE',
      message: `Value must be <= ${opts.max}.`,
    });
    return null;
  }
  return parsed;
}

function parseScore(
  value: string,
  sheetName: string,
  rowNumber: number,
  columnName: string,
  errors: ImportValidationError[],
  sourceCandidateId?: string,
): number | null {
  return parseNumber(value, sheetName, rowNumber, columnName, errors, sourceCandidateId, {
    min: 0,
    max: 100,
  });
}

function parseYesNo(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return ['yes', 'y', 'true', '1'].includes(normalized);
}

function mapProficiency(value: string): ProficiencyLevel | null {
  const map: Record<string, ProficiencyLevel> = {
    Beginner: 'BEGINNER',
    Intermediate: 'INTERMEDIATE',
    Advanced: 'ADVANCED',
    Expert: 'EXPERT',
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED',
    EXPERT: 'EXPERT',
  };
  return map[value] ?? null;
}

function assertAllowed(
  value: string,
  allowed: readonly string[],
  sheetName: string,
  rowNumber: number,
  columnName: string,
  errors: ImportValidationError[],
  sourceCandidateId?: string,
): boolean {
  if (!value) return true;
  if (!allowed.includes(value)) {
    pushError(errors, {
      sheetName,
      rowNumber,
      sourceCandidateId,
      columnName,
      suppliedValue: value,
      errorCode: 'INVALID_METADATA',
      message: `Invalid value. Allowed: ${allowed.join(', ')}.`,
    });
    return false;
  }
  return true;
}

function resolveSkillCommunityName(
  value: string,
  allowed: readonly string[],
): string {
  const trimmed = value.trim();
  const alias = IMPORT_SKILL_COMMUNITY_ALIASES[trimmed];
  if (alias && allowed.includes(alias)) {
    return alias;
  }
  return trimmed;
}

function assertSkillCommunity(
  value: string,
  allowed: readonly string[],
  sheetName: string,
  rowNumber: number,
  columnName: string,
  errors: ImportValidationError[],
  sourceCandidateId?: string,
): string | null {
  if (!value.trim()) return null;
  const resolved = resolveSkillCommunityName(value, allowed);
  assertAllowed(
    resolved,
    allowed,
    sheetName,
    rowNumber,
    columnName,
    errors,
    sourceCandidateId,
  );
  return resolved;
}

function isValidImportTimezone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === 'UTC') return true;
  if (!/^[A-Za-z_]+(?:\/[A-Za-z_]+)+$/.test(trimmed)) {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

function assertTimezone(
  value: string,
  sheetName: string,
  rowNumber: number,
  columnName: string,
  errors: ImportValidationError[],
  sourceCandidateId?: string,
): boolean {
  if (!value.trim()) return true;
  if (isValidImportTimezone(value)) return true;
  pushError(errors, {
    sheetName,
    rowNumber,
    sourceCandidateId,
    columnName,
    suppliedValue: value,
    errorCode: 'INVALID_METADATA',
    message: 'Invalid timezone. Use a valid IANA timezone (e.g. America/New_York) or UTC.',
  });
  return false;
}

function pipeField(value: string): string | null {
  if (!value) return null;
  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('|');
}

export type ParsedWorkbook = {
  candidates: Array<NormalizedCandidateImport & { rowNumber: number }>;
  errors: ImportValidationError[];
  sheetCounts: Record<string, number>;
};

export async function parseAndValidateCandidateWorkbook(
  fileBuffer: Buffer,
  options?: { skillCommunities?: readonly string[] },
): Promise<ParsedWorkbook> {
  const allowedSkillCommunities =
    options?.skillCommunities?.length ? options.skillCommunities : IMPORT_SKILL_COMMUNITIES;
  const errors: ImportValidationError[] = [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as unknown as ExcelJS.Buffer);

  for (const required of IMPORT_UPLOAD_REQUIRED_SHEETS) {
    if (!workbook.getWorksheet(required)) {
      pushError(errors, {
        sheetName: required,
        errorCode: 'MISSING_SHEET',
        message: `Required sheet "${required}" is missing.`,
      });
    }
  }

  const candidateRows = readSheetRows(
    workbook,
    IMPORT_WORKBOOK_SHEETS.CANDIDATE,
    CANDIDATE_SHEET_COLUMNS,
    errors,
  );
  const skillRows = readSheetRows(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SKILLS,
    SKILLS_SHEET_COLUMNS,
    errors,
  );
  const evaluationRows = readSheetRows(
    workbook,
    IMPORT_WORKBOOK_SHEETS.EVALUATION,
    EVALUATION_SHEET_COLUMNS,
    errors,
  );
  const bgvRows = readSheetRows(
    workbook,
    IMPORT_WORKBOOK_SHEETS.BGV,
    BGV_SHEET_COLUMNS,
    errors,
  );
  const scoreRows = readSheetRows(
    workbook,
    IMPORT_WORKBOOK_SHEETS.SCORES,
    SCORES_SHEET_COLUMNS,
    errors,
  );

  const sheetCounts: Record<string, number> = {
    [IMPORT_WORKBOOK_SHEETS.CANDIDATE]: candidateRows.length,
    [IMPORT_WORKBOOK_SHEETS.SKILLS]: skillRows.length,
    [IMPORT_WORKBOOK_SHEETS.EVALUATION]: evaluationRows.length,
    [IMPORT_WORKBOOK_SHEETS.BGV]: bgvRows.length,
    [IMPORT_WORKBOOK_SHEETS.SCORES]: scoreRows.length,
  };

  if (candidateRows.length === 0) {
    pushError(errors, {
      sheetName: IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      errorCode: 'EMPTY_CANDIDATE_SHEET',
      message: 'Candidate sheet must contain at least one data row.',
    });
  }
  if (candidateRows.length > IMPORT_LIMITS.maxCandidates) {
    pushError(errors, {
      sheetName: IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      errorCode: 'TOO_MANY_CANDIDATES',
      message: `Candidate sheet exceeds limit of ${IMPORT_LIMITS.maxCandidates} rows.`,
    });
  }

  const relatedTotal =
    skillRows.length + evaluationRows.length + bgvRows.length + scoreRows.length;
  if (relatedTotal > IMPORT_LIMITS.maxRelatedRows) {
    pushError(errors, {
      sheetName: IMPORT_DATA_SHEETS.join(','),
      errorCode: 'TOO_MANY_RELATED_ROWS',
      message: `Related sheets exceed limit of ${IMPORT_LIMITS.maxRelatedRows} rows.`,
    });
  }

  const candidatesById = new Map<string, NormalizedCandidateImport & { rowNumber: number }>();
  const seenIds = new Set<string>();

  for (const raw of candidateRows) {
    const rowNumber = Number((raw as RawRow & { __rowNumber?: string }).__rowNumber ?? 0);
    const sourceCandidateId = raw.candidate_id?.trim() ?? '';

    for (const field of CANDIDATE_REQUIRED_FIELDS) {
      if (!raw[field]?.trim()) {
        pushError(errors, {
          sheetName: IMPORT_WORKBOOK_SHEETS.CANDIDATE,
          rowNumber,
          sourceCandidateId: sourceCandidateId || undefined,
          columnName: field,
          errorCode: 'MISSING_REQUIRED',
          message: `Required field "${field}" is missing.`,
        });
      }
    }

    if (!sourceCandidateId) {
      continue;
    }

    if (seenIds.has(sourceCandidateId)) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.CANDIDATE,
        rowNumber,
        sourceCandidateId,
        columnName: 'candidate_id',
        suppliedValue: sourceCandidateId,
        errorCode: 'DUPLICATE_CANDIDATE_ID',
        message: 'candidate_id must be unique within the workbook.',
      });
      continue;
    }
    seenIds.add(sourceCandidateId);

    assertAllowed(
      raw.source,
      IMPORT_CANDIDATE_SOURCES,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'source',
      errors,
      sourceCandidateId,
    );
    assertAllowed(
      raw.availability_status,
      IMPORT_AVAILABILITY_STATUSES,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'availability_status',
      errors,
      sourceCandidateId,
    );
    assertAllowed(
      raw.currency,
      IMPORT_CURRENCIES,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'currency',
      errors,
      sourceCandidateId,
    );
    let skillCommunity: string | null = null;
    if (raw.skill_community) {
      skillCommunity = assertSkillCommunity(
        raw.skill_community,
        allowedSkillCommunities,
        IMPORT_WORKBOOK_SHEETS.CANDIDATE,
        rowNumber,
        'skill_community',
        errors,
        sourceCandidateId,
      );
    }
    if (raw.timezone) {
      assertTimezone(
        raw.timezone,
        IMPORT_WORKBOOK_SHEETS.CANDIDATE,
        rowNumber,
        'timezone',
        errors,
        sourceCandidateId,
      );
    }

    const yearsExperience = parseNumber(
      raw.years_experience,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'years_experience',
      errors,
      sourceCandidateId,
      { min: 0, max: 60, integer: true },
    );
    const billRate = parseNumber(
      raw.bill_rate,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'bill_rate',
      errors,
      sourceCandidateId,
      { min: 0 },
    );
    const payRate = parseNumber(
      raw.pay_rate,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'pay_rate',
      errors,
      sourceCandidateId,
      { min: 0 },
    );
    const availableFrom = parseDate(
      raw.available_from,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'available_from',
      errors,
      sourceCandidateId,
    );
    const noticePeriodDaysFromColumn = parseNumber(
      raw.notice_period_days,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'notice_period_days',
      errors,
      sourceCandidateId,
      { min: 0, max: 365, integer: true },
    );
    const noticePeriodDays =
      noticePeriodDaysFromColumn ??
      parseNoticePeriodToDays(raw.notice_period) ??
      null;
    const noticePeriod =
      noticePeriodDays != null
        ? `${noticePeriodDays} days`
        : raw.notice_period?.trim() || null;
    const minHoursPerWeek = parseNumber(
      raw.min_hours_per_week,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'min_hours_per_week',
      errors,
      sourceCandidateId,
      { min: 0, max: 168, integer: true },
    );
    const maxHoursPerWeek = parseNumber(
      raw.max_hours_per_week,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'max_hours_per_week',
      errors,
      sourceCandidateId,
      { min: 0, max: 168, integer: true },
    );
    const hoursPerWeek = parseNumber(
      raw.hours_per_week,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'hours_per_week',
      errors,
      sourceCandidateId,
      { min: 0, max: 168, integer: true },
    );
    assertAllowed(
      raw.preferred_engagement,
      IMPORT_PREFERRED_ENGAGEMENTS,
      IMPORT_WORKBOOK_SHEETS.CANDIDATE,
      rowNumber,
      'preferred_engagement',
      errors,
      sourceCandidateId,
    );

    const email = raw.email?.trim().toLowerCase() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.CANDIDATE,
        rowNumber,
        sourceCandidateId,
        columnName: 'email',
        suppliedValue: raw.email,
        errorCode: 'INVALID_EMAIL',
        message: 'Invalid email format.',
      });
    }

    const aiSummary = raw.ai_summary?.trim() || null;
    const strengths = pipeField(raw.strengths);
    const weaknesses = pipeField(raw.weaknesses);
    const hasAiFields = Boolean(aiSummary || strengths || weaknesses);

    candidatesById.set(sourceCandidateId, {
      rowNumber,
      sourceCandidateId,
      firstName: raw.first_name.trim(),
      lastName: raw.last_name.trim(),
      email,
      phone: raw.phone?.trim() || null,
      location: raw.location?.trim() || null,
      country: raw.country?.trim() || null,
      timezone: raw.timezone?.trim() || null,
      headline: raw.headline?.trim() || null,
      yearsExperience: yearsExperience ?? 0,
      primaryRole: raw.primary_role.trim(),
      skillCommunity,
      summary: raw.summary?.trim() || null,
      aiSummary,
      strengths,
      weaknesses,
      availabilityStatus: (raw.availability_status || null) as CandidateAvailabilityStatus | null,
      availableFrom,
      billRate,
      payRate,
      currency: raw.currency?.trim() || null,
      source: raw.source as CandidateSource,
      linkedinUrl: raw.linkedin_url?.trim() || null,
      githubUrl: raw.github_url?.trim() || null,
      portfolioUrl: raw.portfolio_url?.trim() || null,
      currentCompany: raw.current_company?.trim() || null,
      currentTitle: raw.current_title?.trim() || null,
      education: raw.education?.trim() || null,
      noticePeriod,
      noticePeriodDays,
      preferredShift: raw.preferred_shift?.trim() || null,
      preferredEngagement: raw.preferred_engagement?.trim() || null,
      minHoursPerWeek: minHoursPerWeek ?? hoursPerWeek,
      maxHoursPerWeek: maxHoursPerWeek ?? hoursPerWeek,
      hoursPerWeek,
      timezoneOverlap: raw.timezone_overlap?.trim() || null,
      resumeUrl: raw.resume_url?.trim() || null,
      skills: [],
      evaluations: [],
      bgv: null,
      scores: [],
      hasAiFields,
    });
  }

  for (const raw of skillRows) {
    const rowNumber = Number((raw as RawRow & { __rowNumber?: string }).__rowNumber ?? 0);
    const sourceCandidateId = raw.candidate_id?.trim() ?? '';
    const candidate = candidatesById.get(sourceCandidateId);
    if (!candidate) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.SKILLS,
        rowNumber,
        sourceCandidateId: sourceCandidateId || undefined,
        columnName: 'candidate_id',
        suppliedValue: sourceCandidateId,
        errorCode: 'ORPHAN_RELATED_ROW',
        message: 'Skills row references unknown candidate_id.',
      });
      continue;
    }
    if (!raw.skill_name?.trim()) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.SKILLS,
        rowNumber,
        sourceCandidateId,
        columnName: 'skill_name',
        errorCode: 'MISSING_REQUIRED',
        message: 'skill_name is required.',
      });
      continue;
    }
    assertAllowed(
      raw.proficiency,
      IMPORT_PROFICIENCY_LEVELS,
      IMPORT_WORKBOOK_SHEETS.SKILLS,
      rowNumber,
      'proficiency',
      errors,
      sourceCandidateId,
    );
    const proficiency = mapProficiency(raw.proficiency) ?? 'INTERMEDIATE';
    const yearsExperience = parseNumber(
      raw.years_experience,
      IMPORT_WORKBOOK_SHEETS.SKILLS,
      rowNumber,
      'years_experience',
      errors,
      sourceCandidateId,
      { min: 0, max: 60, integer: true },
    );
    const skill: NormalizedSkillRow = {
      skillName: raw.skill_name.trim().slice(0, 150),
      skillCategory: null,
      proficiency,
      yearsExperience,
      isPrimary: parseYesNo(raw.is_primary),
      skillCommunityName: candidate.skillCommunity,
    };
    candidate.skills.push(skill);
  }

  for (const raw of evaluationRows) {
    const rowNumber = Number((raw as RawRow & { __rowNumber?: string }).__rowNumber ?? 0);
    const sourceCandidateId = raw.candidate_id?.trim() ?? '';
    const candidate = candidatesById.get(sourceCandidateId);
    if (!candidate) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        sourceCandidateId: sourceCandidateId || undefined,
        columnName: 'candidate_id',
        suppliedValue: sourceCandidateId,
        errorCode: 'ORPHAN_RELATED_ROW',
        message: 'Evaluation row references unknown candidate_id.',
      });
      continue;
    }
    if (!raw.evaluator_name?.trim()) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        sourceCandidateId,
        columnName: 'evaluator_name',
        errorCode: 'MISSING_REQUIRED',
        message: 'evaluator_name is required.',
      });
      continue;
    }
    let evaluationType: string | null = null;
    if (raw.evaluation_type?.trim()) {
      const normalizedType = normalizeEvaluationType(raw.evaluation_type);
      if (!normalizedType) {
        pushError(errors, {
          sheetName: IMPORT_WORKBOOK_SHEETS.EVALUATION,
          rowNumber,
          sourceCandidateId,
          columnName: 'evaluation_type',
          suppliedValue: raw.evaluation_type,
          errorCode: 'INVALID_VALUE',
          message: `evaluation_type must be one of: ${IMPORT_EVALUATION_TYPES.join(', ')}.`,
        });
        continue;
      }
      evaluationType = normalizedType;
    }
    let recommendation: string | null = null;
    if (raw.recommendation?.trim()) {
      const normalizedRecommendation = normalizeEvaluationRecommendation(raw.recommendation);
      if (!normalizedRecommendation) {
        pushError(errors, {
          sheetName: IMPORT_WORKBOOK_SHEETS.EVALUATION,
          rowNumber,
          sourceCandidateId,
          columnName: 'recommendation',
          suppliedValue: raw.recommendation,
          errorCode: 'INVALID_VALUE',
          message: `recommendation must be one of: ${IMPORT_RECOMMENDATION_VALUES.join(', ')}.`,
        });
        continue;
      }
      recommendation = normalizedRecommendation;
    }
    const evaluation: NormalizedEvaluationRow = {
      evaluationType,
      evaluationDate: parseDate(
        raw.evaluation_date,
        IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        'evaluation_date',
        errors,
        sourceCandidateId,
      ),
      evaluatorName: raw.evaluator_name.trim(),
      evaluatorCompany: raw.evaluator_company?.trim() || null,
      technicalScore: parseScore(
        raw.technical_score,
        IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        'technical_score',
        errors,
        sourceCandidateId,
      ),
      communicationScore: parseScore(
        raw.communication_score,
        IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        'communication_score',
        errors,
        sourceCandidateId,
      ),
      problemSolvingScore: parseScore(
        raw.problem_solving_score,
        IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        'problem_solving_score',
        errors,
        sourceCandidateId,
      ),
      architectureScore: parseScore(
        raw.architecture_score,
        IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        'architecture_score',
        errors,
        sourceCandidateId,
      ),
      clientReadinessScore: parseScore(
        raw.client_readiness_score,
        IMPORT_WORKBOOK_SHEETS.EVALUATION,
        rowNumber,
        'client_readiness_score',
        errors,
        sourceCandidateId,
      ),
      recommendation,
      evaluationSummary: raw.evaluation_summary?.trim() || null,
      aiEvaluationSummary: raw.ai_evaluation_summary?.trim() || null,
      comments: raw.comments?.trim() || null,
    };
    if (evaluation.aiEvaluationSummary) {
      candidate.hasAiFields = true;
    }
    candidate.evaluations.push(evaluation);
  }

  for (const raw of bgvRows) {
    const rowNumber = Number((raw as RawRow & { __rowNumber?: string }).__rowNumber ?? 0);
    const sourceCandidateId = raw.candidate_id?.trim() ?? '';
    const candidate = candidatesById.get(sourceCandidateId);
    if (!candidate) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.BGV,
        rowNumber,
        sourceCandidateId: sourceCandidateId || undefined,
        columnName: 'candidate_id',
        suppliedValue: sourceCandidateId,
        errorCode: 'ORPHAN_RELATED_ROW',
        message: 'BGV row references unknown candidate_id.',
      });
      continue;
    }
    if (!raw.bgv_status?.trim()) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.BGV,
        rowNumber,
        sourceCandidateId,
        columnName: 'bgv_status',
        errorCode: 'MISSING_REQUIRED',
        message: 'bgv_status is required.',
      });
      continue;
    }
    assertAllowed(
      raw.bgv_status,
      IMPORT_BGV_STATUSES,
      IMPORT_WORKBOOK_SHEETS.BGV,
      rowNumber,
      'bgv_status',
      errors,
      sourceCandidateId,
    );
    if (candidate.bgv) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.BGV,
        rowNumber,
        sourceCandidateId,
        errorCode: 'DUPLICATE_BGV',
        message: 'Only one Background Verification row is allowed per candidate_id.',
      });
      continue;
    }
    const bgv: NormalizedBgvRow = {
      bgvStatus: raw.bgv_status.trim(),
      vendor: raw.vendor?.trim() || null,
      idCheckStatus: raw.id_check_status?.trim() || null,
      addressCheckStatus: raw.address_check_status?.trim() || null,
      employmentCheckStatus: raw.employment_check_status?.trim() || null,
      educationCheckStatus: raw.education_check_status?.trim() || null,
      criminalCheckStatus: raw.criminal_check_status?.trim() || null,
      referenceCheckStatus: raw.reference_check_status?.trim() || null,
      initiatedDate: parseDate(
        raw.initiated_date,
        IMPORT_WORKBOOK_SHEETS.BGV,
        rowNumber,
        'initiated_date',
        errors,
        sourceCandidateId,
      ),
      completedDate: parseDate(
        raw.completed_date,
        IMPORT_WORKBOOK_SHEETS.BGV,
        rowNumber,
        'completed_date',
        errors,
        sourceCandidateId,
      ),
      bgvSummary: raw.bgv_summary?.trim() || null,
      concernNotes: raw.concern_notes?.trim() || null,
    };
    candidate.bgv = bgv;
  }

  for (const raw of scoreRows) {
    const rowNumber = Number((raw as RawRow & { __rowNumber?: string }).__rowNumber ?? 0);
    const sourceCandidateId = raw.candidate_id?.trim() ?? '';
    const candidate = candidatesById.get(sourceCandidateId);
    if (!candidate) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        sourceCandidateId: sourceCandidateId || undefined,
        columnName: 'candidate_id',
        suppliedValue: sourceCandidateId,
        errorCode: 'ORPHAN_RELATED_ROW',
        message: 'Scores row references unknown candidate_id.',
      });
      continue;
    }
    if (!raw.score_source?.trim()) {
      pushError(errors, {
        sheetName: IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        sourceCandidateId,
        columnName: 'score_source',
        errorCode: 'MISSING_REQUIRED',
        message: 'score_source is required.',
      });
      continue;
    }
    assertAllowed(
      raw.score_source,
      IMPORT_SCORE_SOURCES,
      IMPORT_WORKBOOK_SHEETS.SCORES,
      rowNumber,
      'score_source',
      errors,
      sourceCandidateId,
    );
    const score: NormalizedScoreRow = {
      bestalScore: parseScore(
        raw.bestal_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'bestal_score',
        errors,
        sourceCandidateId,
      ),
      technicalScore: parseScore(
        raw.technical_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'technical_score',
        errors,
        sourceCandidateId,
      ),
      communicationScore: parseScore(
        raw.communication_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'communication_score',
        errors,
        sourceCandidateId,
      ),
      problemSolvingScore: parseScore(
        raw.problem_solving_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'problem_solving_score',
        errors,
        sourceCandidateId,
      ),
      architectureScore: parseScore(
        raw.architecture_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'architecture_score',
        errors,
        sourceCandidateId,
      ),
      reliabilityScore: parseScore(
        raw.reliability_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'reliability_score',
        errors,
        sourceCandidateId,
      ),
      clientReadinessScore: parseScore(
        raw.client_readiness_score,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'client_readiness_score',
        errors,
        sourceCandidateId,
      ),
      scoreSource: raw.score_source as CandidateScoreSource,
      scoreDate: parseDate(
        raw.score_date,
        IMPORT_WORKBOOK_SHEETS.SCORES,
        rowNumber,
        'score_date',
        errors,
        sourceCandidateId,
      ),
    };
    if (score.scoreSource === 'ATS_AI' || score.scoreSource === 'BESTAL_AI') {
      candidate.hasAiFields = true;
    }
    candidate.scores.push(score);
  }

  return {
    candidates: [...candidatesById.values()],
    errors,
    sheetCounts,
  };
}
