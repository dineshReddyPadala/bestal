import type { ResumeExtractionResponse } from './resume-extraction.types.js';

export type {
  ResumeExtractionEducation,
  ResumeExtractionExperience,
  ResumeExtractionResponse,
  ResumeExtractionSkill,
} from './resume-extraction.types.js';

const STATIC_EXTRACTION: ResumeExtractionResponse = {
  jobId: 'ext-demo-001',
  confidence: 0.91,
  extractedAt: new Date().toISOString(),
  warnings: [
    'GitHub URL not found on resume',
    'Bill rate is an estimate — verify before publishing',
  ],
  candidate: {
    firstName: 'Alexandra',
    lastName: 'Petrov',
    email: 'alexandra.petrov@example.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexandra-petrov',
    headline: 'Senior Data Engineer',
    summary:
      'Senior Data Engineer with strong Snowflake, dbt, Airflow and AWS experience.',
    yearsExperience: 8,
  },
  primaryRole: 'Senior Data Engineer',
  seniority: 'Senior',
  community: 'Data Engineering',
  skills: [
    { name: 'Snowflake', proficiencyLevel: 'ADVANCED', yearsExperience: 4, isPrimary: true },
    { name: 'dbt', proficiencyLevel: 'ADVANCED', yearsExperience: 3, isPrimary: true },
    { name: 'Airflow', proficiencyLevel: 'INTERMEDIATE', yearsExperience: 3, isPrimary: false },
    { name: 'AWS', proficiencyLevel: 'ADVANCED', yearsExperience: 5, isPrimary: false },
  ],
  experience: [
    {
      company: 'FinTech Corp',
      title: 'Senior Data Engineer',
      startDate: '2021-03',
      endDate: null,
      description: 'Built Snowflake + dbt pipelines; reduced batch latency by 40%.',
    },
    {
      company: 'Commerce Labs',
      title: 'Data Engineer',
      startDate: '2018-01',
      endDate: '2021-02',
      description: 'Owned ETL for analytics warehouse serving 2M+ daily events.',
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      graduationYear: 2017,
    },
  ],
  aiSummary:
    'Senior Data Engineer with strong Snowflake, dbt, Airflow and AWS experience.',
  strengths: 'Strong cloud data warehouse experience; good modern data stack exposure.',
  weaknesses: 'Limited leadership evidence.',
  riskFlags: 'No GitHub link found.',
  bestalScore: 84,
  recommendedClientRate: 38,
  recommendedCandidateRate: 25,
  rawSections: {
    summary: 'Senior Data Engineer with 8+ years building cloud data platforms.',
    skills: 'Snowflake, dbt, Airflow, AWS, SQL, Python',
    experience: 'Senior Data Engineer at FinTech Corp (2021–present)...',
    education: 'B.S. Computer Science, UC Berkeley, 2017',
  },
};

export type ResumeExtractionRequestBody = {
  fileName: string;
  mimeType: string;
  content: string;
};

const PROFICIENCY_MAP: Record<string, ResumeExtractionResponse['skills'][number]['proficiencyLevel']> = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
  Beginner: 'BEGINNER',
  Intermediate: 'INTERMEDIATE',
  Advanced: 'ADVANCED',
  Expert: 'EXPERT',
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Normalize Python camelCase or snake_case payloads into the unified contract. */
export function normalizeResumeExtractionResponse(
  raw: unknown,
): ResumeExtractionResponse {
  const root = asRecord(raw);
  const candidateRaw = asRecord(root.candidate);
  const rawSections = asRecord(root.rawSections ?? root.raw_sections);

  const skillsRaw = Array.isArray(root.skills) ? root.skills : [];
  const experienceRaw = Array.isArray(root.experience) ? root.experience : [];
  const educationRaw = Array.isArray(root.education) ? root.education : [];

  return {
    jobId: asString(root.jobId ?? root.job_id) ?? `ext-${Date.now()}`,
    confidence: asNumber(root.confidence) ?? 0,
    extractedAt: asString(root.extractedAt ?? root.extracted_at) ?? new Date().toISOString(),
    warnings: Array.isArray(root.warnings)
      ? root.warnings.filter((item): item is string => typeof item === 'string')
      : [],
    candidate: {
      firstName: asString(candidateRaw.firstName ?? candidateRaw.first_name) ?? '',
      lastName: asString(candidateRaw.lastName ?? candidateRaw.last_name) ?? '',
      email: asString(candidateRaw.email),
      phone: asString(candidateRaw.phone),
      location: asString(candidateRaw.location),
      linkedinUrl: asString(candidateRaw.linkedinUrl ?? candidateRaw.linkedin_url),
      headline: asString(candidateRaw.headline),
      summary: asString(candidateRaw.summary),
      yearsExperience: asNumber(
        candidateRaw.yearsExperience ?? candidateRaw.years_experience,
      ),
    },
    primaryRole: asString(root.primaryRole ?? root.primary_role),
    seniority: asString(root.seniority),
    community: asString(root.community),
    skills: skillsRaw.map((item, index) => {
      const skill = asRecord(item);
      const levelRaw = String(
        skill.proficiencyLevel ?? skill.proficiency_level ?? skill.proficiency ?? 'INTERMEDIATE',
      );
      return {
        name: asString(skill.name) ?? `Skill ${index + 1}`,
        proficiencyLevel: PROFICIENCY_MAP[levelRaw] ?? 'INTERMEDIATE',
        yearsExperience: asNumber(skill.yearsExperience ?? skill.years_experience ?? skill.years),
        isPrimary: asBoolean(skill.isPrimary ?? skill.is_primary, index === 0),
      };
    }),
    experience: experienceRaw.map((item) => {
      const job = asRecord(item);
      return {
        company: asString(job.company) ?? '',
        title: asString(job.title) ?? '',
        startDate: asString(job.startDate ?? job.start_date),
        endDate: asString(job.endDate ?? job.end_date),
        description: asString(job.description),
      };
    }),
    education: educationRaw.map((item) => {
      const edu = asRecord(item);
      return {
        institution: asString(edu.institution) ?? '',
        degree: asString(edu.degree),
        fieldOfStudy: asString(edu.fieldOfStudy ?? edu.field_of_study),
        graduationYear: asNumber(edu.graduationYear ?? edu.graduation_year),
      };
    }),
    aiSummary: asString(root.aiSummary ?? root.ai_summary),
    strengths: asString(root.strengths),
    weaknesses: asString(root.weaknesses),
    riskFlags: asString(root.riskFlags ?? root.risk_flags),
    bestalScore: asNumber(root.bestalScore ?? root.bestal_score),
    recommendedClientRate: asNumber(
      root.recommendedClientRate ?? root.recommended_client_rate,
    ),
    recommendedCandidateRate: asNumber(
      root.recommendedCandidateRate ?? root.recommended_candidate_rate,
    ),
    rawSections: {
      summary: asString(rawSections.summary),
      skills: asString(rawSections.skills),
      experience: asString(rawSections.experience),
      education: asString(rawSections.education),
    },
  };
}

export class ResumeExtractionClient {
  constructor(private readonly aiExtractionUrl: string | null) {}

  get isLiveAiConfigured(): boolean {
    return Boolean(this.aiExtractionUrl);
  }

  /**
   * Returns unified extract+screening JSON.
   * - No AI_EXTRACTION_URL → hardcoded static response (no Python dependency).
   * - AI_EXTRACTION_URL set → POST file payload to Python and normalize response.
   * Upload to S3 / DB linking is handled by CandidateService separately.
   */
  async extract(
    request: ResumeExtractionRequestBody,
  ): Promise<ResumeExtractionResponse> {
    if (!this.aiExtractionUrl) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        ...STATIC_EXTRACTION,
        jobId: `ext-static-${Date.now()}`,
        extractedAt: new Date().toISOString(),
        warnings: [
          ...STATIC_EXTRACTION.warnings,
          `Static AI response for "${request.fileName}" — AI_EXTRACTION_URL is not configured.`,
        ],
      };
    }

    const response = await fetch(this.aiExtractionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        detail
          ? `AI extraction failed: ${detail}`
          : `AI extraction failed: ${response.status} ${response.statusText}`,
      );
    }

    return normalizeResumeExtractionResponse(await response.json());
  }
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
