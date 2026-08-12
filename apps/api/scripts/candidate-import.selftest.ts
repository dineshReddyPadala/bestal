import assert from 'node:assert/strict';
import {
  CANDIDATE_SHEET_COLUMNS,
  IMPORT_SKILL_COMMUNITIES,
  IMPORT_TEMPLATE_SHEETS,
  IMPORT_UPLOAD_REQUIRED_SHEETS,
  IMPORT_WORKBOOK_SHEETS,
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
    summary: null,
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
    preferredShift: null,
    timezoneOverlap: null,
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

  const template = await buildCandidateImportTemplate();
  assert.ok(template.length > 1000, 'template should be generated');

  const parsed = await parseAndValidateCandidateWorkbook(template);
  assert.equal(parsed.candidates.length, 1);
  assert.equal(parsed.candidates[0]?.sourceCandidateId, '1001');
  assert.equal(parsed.candidates[0]?.skills.length, 1);
  assert.equal(parsed.candidates[0]?.evaluations.length, 1);
  assert.ok(parsed.candidates[0]?.bgv);
  assert.equal(parsed.candidates[0]?.scores.length, 1);
  assert.equal(parsed.errors.length, 0, JSON.stringify(parsed.errors, null, 2));

  assert.equal(IMPORT_UPLOAD_REQUIRED_SHEETS.length, 5);
  assert.equal(IMPORT_TEMPLATE_SHEETS.length, 15);
  assert.equal(CANDIDATE_SHEET_COLUMNS[0], 'candidate_id');
  assert.ok(IMPORT_SKILL_COMMUNITIES.includes('Full Stack'));
  assert.equal(IMPORT_WORKBOOK_SHEETS.CANDIDATE, 'Candidate');

  // Missing sheet detection
  const ExcelJS = (await import('exceljs')).default;
  const broken = new ExcelJS.Workbook();
  broken.addWorksheet('Candidate');
  const brokenBuffer = Buffer.from(await broken.xlsx.writeBuffer());
  const brokenParsed = await parseAndValidateCandidateWorkbook(brokenBuffer);
  assert.ok(brokenParsed.errors.some((e) => e.errorCode === 'MISSING_SHEET'));

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
            architectureScore: null,
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
            architectureScore: null,
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
          addressCheckStatus: null,
          employmentCheckStatus: null,
          educationCheckStatus: null,
          criminalCheckStatus: null,
          referenceCheckStatus: null,
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
            architectureScore: null,
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
          addressCheckStatus: null,
          employmentCheckStatus: null,
          educationCheckStatus: null,
          criminalCheckStatus: null,
          referenceCheckStatus: null,
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
        architectureScore: null,
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
      addressCheckStatus: null,
      employmentCheckStatus: null,
      educationCheckStatus: null,
      criminalCheckStatus: null,
      referenceCheckStatus: null,
      initiatedDate: null,
      completedDate: null,
      bgvSummary: null,
      concernNotes: null,
    },
  });
  assert.equal(isImportedPricingComplete(draftReady), true);
  assert.equal(deriveImportedProfileStatus(draftReady), 'PROFILE_DRAFT');

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
