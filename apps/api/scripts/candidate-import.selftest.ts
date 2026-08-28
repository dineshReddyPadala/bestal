import assert from 'node:assert/strict';
import {
  CANDIDATE_SHEET_COLUMNS,
  IMPORT_TEMPLATE_SHEETS,
  IMPORT_UPLOAD_REQUIRED_SHEETS,
  IMPORT_WORKBOOK_SHEETS,
  resolveImportedSkillCommunityId,
  resolveImportedSkillCommunityName,
} from '@bestal/shared-utils';
import {
  deriveImportedProfileStatus,
  isImportedPricingComplete,
} from '../src/modules/candidates/candidate-import-status.js';
import { buildCandidateImportTemplate } from '../src/modules/candidates/candidate-import.template.js';
import type { NormalizedCandidateImport } from '../src/modules/candidates/candidate-import.types.js';
import {
  IMPORT_LIMITS,
  parseAndValidateCandidateWorkbook,
} from '../src/modules/candidates/candidate-import.validator.js';

const TEST_SKILL_COMMUNITIES = [
  'Full Stack',
  'Frontend Development',
  'Product Design',
  'Scrum Master',
] as const;

function parseWorkbook(buffer: Buffer) {
  return parseAndValidateCandidateWorkbook(buffer, {
    skillCommunities: TEST_SKILL_COMMUNITIES,
  });
}

function baseCandidate(
  overrides: Partial<NormalizedCandidateImport> = {},
): NormalizedCandidateImport {
  return {
    sourceCandidateId: '1001',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: null,
    location: null,
    country: null,
    timezone: null,
    headline: null,
    yearsExperience: 5,
    primaryRole: 'Engineer',
    skillCommunity: 'Full Stack',
    aiSummary: null,
    strengths: null,
    weaknesses: null,
    availabilityStatus: null,
    availableFrom: null,
    billRate: null,
    payRate: null,
    currency: 'USD',
    source: 'OTHER',
    linkedinUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    currentCompany: null,
    currentTitle: null,
    noticePeriod: null,
    noticePeriodDays: null,
    preferredShift: null,
    preferredEngagement: null,
    minHoursPerWeek: null,
    maxHoursPerWeek: null,
    hoursPerWeek: null,
    education: null,
    resumeUrl: null,
    skills: [],
    evaluations: [],
    bgv: null,
    scores: [],
    hasAiFields: false,
    ...overrides,
  };
}

async function main() {
  assert.equal(IMPORT_LIMITS.maxCandidates, 10000);
  assert.equal(IMPORT_LIMITS.maxRelatedRows, 100000);
  assert.equal(IMPORT_LIMITS.chunkSize, 100);
  assert.equal(IMPORT_LIMITS.rowConcurrency, 5);

  const template = await buildCandidateImportTemplate({
    skillCommunities: TEST_SKILL_COMMUNITIES,
  });
  assert.ok(template.length > 1000, 'template should be generated');

  const parsed = await parseWorkbook(template);
  assert.equal(parsed.candidates.length, 1);
  assert.equal(parsed.candidates[0]?.sourceCandidateId, '1001');
  assert.equal(parsed.candidates[0]?.skills.length, 1);
  assert.equal(parsed.candidates[0]?.evaluations.length, 1);
  assert.ok(parsed.candidates[0]?.bgv);
  assert.equal(parsed.candidates[0]?.scores.length, 1);
  assert.equal(parsed.errors.length, 0, JSON.stringify(parsed.errors, null, 2));
  assert.equal(parsed.candidates[0]?.timezone, 'Europe/London');

  assert.equal(IMPORT_UPLOAD_REQUIRED_SHEETS.length, 5);
  assert.equal(IMPORT_TEMPLATE_SHEETS.length, 20);
  assert.equal(CANDIDATE_SHEET_COLUMNS[0], 'candidate_id');
  assert.ok(TEST_SKILL_COMMUNITIES.includes('Full Stack'));
  assert.equal(IMPORT_WORKBOOK_SHEETS.CANDIDATE, 'Candidate');

  assert.equal(
    resolveImportedSkillCommunityName('Frontend Engineering', TEST_SKILL_COMMUNITIES),
    'Frontend Development',
  );
  assert.equal(
    resolveImportedSkillCommunityName('product design', TEST_SKILL_COMMUNITIES),
    'Product Design',
  );
  assert.equal(
    resolveImportedSkillCommunityName('Scrum Master', TEST_SKILL_COMMUNITIES),
    'Scrum Master',
  );

  const communityIds = new Map<string, bigint>([
    ['Frontend Development', 11n],
    ['Product Design', 22n],
    ['Scrum Master', 33n],
  ]);
  assert.equal(resolveImportedSkillCommunityId('Frontend Engineering', communityIds), 11n);
  assert.equal(resolveImportedSkillCommunityId('Product Design', communityIds), 22n);
  assert.equal(resolveImportedSkillCommunityId('scrum master', communityIds), 33n);

  // Missing sheet detection
  const ExcelJS = (await import('exceljs')).default;
  const broken = new ExcelJS.Workbook();
  broken.addWorksheet('Candidate');
  const brokenBuffer = Buffer.from(await broken.xlsx.writeBuffer());
  const brokenParsed = await parseAndValidateCandidateWorkbook(brokenBuffer);
  assert.ok(brokenParsed.errors.some((e) => e.errorCode === 'MISSING_SHEET'));

  const aliasWorkbook = new ExcelJS.Workbook();
  await aliasWorkbook.xlsx.load(template);
  const candidateSheet = aliasWorkbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.CANDIDATE);
  assert.ok(candidateSheet);
  const skillCommunityCol = CANDIDATE_SHEET_COLUMNS.indexOf('skill_community') + 1;
  candidateSheet.getRow(2).getCell(skillCommunityCol).value = 'Frontend Engineering';
  const extraCommunityWorkbook = new ExcelJS.Workbook();
  await extraCommunityWorkbook.xlsx.load(template);
  const extraCandidateSheet = extraCommunityWorkbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.CANDIDATE);
  assert.ok(extraCandidateSheet);
  extraCandidateSheet.getRow(2).getCell(skillCommunityCol).value = 'Product Design';

  const aliasParsed = await parseWorkbook(
    Buffer.from(await aliasWorkbook.xlsx.writeBuffer()),
  );
  assert.equal(aliasParsed.errors.length, 0, JSON.stringify(aliasParsed.errors, null, 2));
  assert.equal(aliasParsed.candidates[0]?.skillCommunity, 'Frontend Development');

  const extraParsed = await parseWorkbook(
    Buffer.from(await extraCommunityWorkbook.xlsx.writeBuffer()),
  );
  assert.equal(extraParsed.errors.length, 0, JSON.stringify(extraParsed.errors, null, 2));
  assert.equal(extraParsed.candidates[0]?.skillCommunity, 'Product Design');

  // Pipeline derivation matrix
  assert.equal(deriveImportedProfileStatus(baseCandidate()), 'IMPORTED');
  assert.equal(
    deriveImportedProfileStatus(
      baseCandidate({
        evaluations: [
          {
            evaluationType: 'TECHNICAL_INTERVIEW',
            evaluationDate: '2026-01-01',
            evaluatorName: 'Recruiter',
            evaluatorCompany: null,
            technicalScore: 80,
            communicationScore: null,
            problemSolvingScore: null,
            collaborationCulturalFitScore: null,
            clientReadinessScore: null,
            recommendation: 'HIRE',
            evaluationSummary: null,
            aiEvaluationSummary: null,
            comments: null,
          },
        ],
      }),
    ),
    'EVALUATION_COMPLETE',
  );
  assert.equal(
    deriveImportedProfileStatus(
      baseCandidate({
        evaluations: [
          {
            evaluationType: 'TECHNICAL_INTERVIEW',
            evaluationDate: null,
            evaluatorName: 'Recruiter',
            evaluatorCompany: null,
            technicalScore: null,
            communicationScore: null,
            problemSolvingScore: null,
            collaborationCulturalFitScore: null,
            clientReadinessScore: null,
            recommendation: null,
            evaluationSummary: null,
            aiEvaluationSummary: null,
            comments: null,
          },
        ],
        bgv: {
          bgvStatus: 'IN_PROGRESS',
          vendor: null,
          idCheckStatus: null,
          employmentCheckStatus: null,
          criminalCheckStatus: null,
          initiatedDate: null,
          completedDate: null,
          bgvSummary: null,
          concernNotes: null,
        },
      }),
    ),
    'BGV_PENDING',
  );
  assert.equal(
    deriveImportedProfileStatus(
      baseCandidate({
        evaluations: [
          {
            evaluationType: 'TECHNICAL_INTERVIEW',
            evaluationDate: null,
            evaluatorName: 'Recruiter',
            evaluatorCompany: null,
            technicalScore: null,
            communicationScore: null,
            problemSolvingScore: null,
            collaborationCulturalFitScore: null,
            clientReadinessScore: null,
            recommendation: null,
            evaluationSummary: null,
            aiEvaluationSummary: null,
            comments: null,
          },
        ],
        bgv: {
          bgvStatus: 'COMPLETED_CLEAR',
          vendor: null,
          idCheckStatus: null,
          employmentCheckStatus: null,
          criminalCheckStatus: null,
          initiatedDate: null,
          completedDate: null,
          bgvSummary: null,
          concernNotes: null,
        },
      }),
    ),
    'BGV_COMPLETE',
  );

  const draftReady = baseCandidate({
    billRate: 85,
    availabilityStatus: 'AVAILABLE',
    availableFrom: '2026-08-01',
    evaluations: [
      {
        evaluationType: 'TECHNICAL_INTERVIEW',
        evaluationDate: null,
        evaluatorName: 'Recruiter',
        evaluatorCompany: null,
        technicalScore: null,
        communicationScore: null,
        problemSolvingScore: null,
        collaborationCulturalFitScore: null,
        clientReadinessScore: null,
        recommendation: null,
        evaluationSummary: null,
        aiEvaluationSummary: null,
        comments: null,
      },
    ],
    bgv: {
      bgvStatus: 'CLEAR',
      vendor: null,
      idCheckStatus: null,
      employmentCheckStatus: null,
      criminalCheckStatus: null,
      initiatedDate: null,
      completedDate: null,
      bgvSummary: null,
      concernNotes: null,
    },
  });
  assert.equal(isImportedPricingComplete(draftReady), true);
  assert.equal(deriveImportedProfileStatus(draftReady), 'PROFILE_DRAFT');

  // Missing availability fields should fail validation
  const availabilityWorkbook = new ExcelJS.Workbook();
  await availabilityWorkbook.xlsx.load(template as unknown as ExcelJS.Buffer);
  const availabilitySheet = availabilityWorkbook.getWorksheet(IMPORT_WORKBOOK_SHEETS.CANDIDATE);
  assert.ok(availabilitySheet);
  availabilitySheet.getRow(2).getCell(
    CANDIDATE_SHEET_COLUMNS.indexOf('availability_status') + 1,
  ).value = '';
  availabilitySheet.getRow(2).getCell(
    CANDIDATE_SHEET_COLUMNS.indexOf('available_from') + 1,
  ).value = '';
  const missingAvailabilityBuffer = Buffer.from(await availabilityWorkbook.xlsx.writeBuffer());
  const missingAvailabilityParsed = await parseWorkbook(
    missingAvailabilityBuffer,
  );
  assert.ok(
    missingAvailabilityParsed.errors.some(
      (error) =>
        error.columnName === 'availability_status' &&
        error.errorCode === 'MISSING_REQUIRED',
    ),
    'missing availability_status should produce validation error',
  );
  assert.ok(
    missingAvailabilityParsed.errors.some(
      (error) =>
        error.columnName === 'available_from' && error.errorCode === 'MISSING_REQUIRED',
    ),
    'missing available_from should produce validation error',
  );

  // Template sample with eval+BGV+pricing should land at PROFILE_DRAFT or BGV_COMPLETE
  const sample = parsed.candidates[0]!;
  const derived = deriveImportedProfileStatus(sample);
  assert.ok(
    derived === 'PROFILE_DRAFT' ||
      derived === 'BGV_COMPLETE' ||
      derived === 'BGV_PENDING' ||
      derived === 'EVALUATION_COMPLETE',
    `unexpected derived status ${derived}`,
  );

  console.log('candidate-import tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
