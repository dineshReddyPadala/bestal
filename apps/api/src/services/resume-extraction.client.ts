import type {
  ResumeExtractionEducation,
  ResumeExtractionExperience,
  ResumeExtractionResponse,
  ResumeExtractionSkill,
} from './resume-extraction.types.js';

export type {
  ResumeExtractionEducation,
  ResumeExtractionExperience,
  ResumeExtractionResponse,
  ResumeExtractionSkill,
};

const STATIC_EXTRACTION: ResumeExtractionResponse = {
  jobId: 'ext-demo-001',
  confidence: 0.92,
  extractedAt: new Date().toISOString(),
  candidate: {
    firstName: 'Alexandra',
    lastName: 'Petrov',
    email: 'alexandra.petrov@example.com',
    phone: '+1 (415) 555-0142',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexandra-petrov',
    headline: 'Senior Full-Stack Engineer',
    summary:
      'Full-stack engineer with 8+ years building scalable payment and commerce platforms. Strong in TypeScript, React, and distributed systems.',
    yearsExperience: 8,
  },
  skills: [
    { name: 'TypeScript', proficiencyLevel: 'EXPERT', yearsExperience: 6, isPrimary: true },
    { name: 'React', proficiencyLevel: 'ADVANCED', yearsExperience: 5, isPrimary: true },
    { name: 'Node.js', proficiencyLevel: 'ADVANCED', yearsExperience: 6, isPrimary: false },
    { name: 'PostgreSQL', proficiencyLevel: 'ADVANCED', yearsExperience: 5, isPrimary: false },
  ],
  experience: [
    {
      company: 'FinTech Corp',
      title: 'Senior Software Engineer',
      startDate: '2021-03',
      endDate: null,
      description: 'Led payment platform migration; reduced latency by 40%.',
    },
    {
      company: 'Commerce Labs',
      title: 'Software Engineer',
      startDate: '2018-01',
      endDate: '2021-02',
      description: 'Built checkout microservices serving 2M+ daily transactions.',
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
  rawSections: {
    summary:
      'Full-stack engineer with 8+ years building scalable payment and commerce platforms.',
    skills: 'TypeScript, React, Node.js, PostgreSQL, AWS, Docker',
    experience: 'Senior Software Engineer at FinTech Corp (2021–present)...',
    education: 'B.S. Computer Science, UC Berkeley, 2017',
  },
  warnings: ['Email inferred from filename — verify before saving.'],
};

export type ResumeExtractionRequestBody = {
  fileName: string;
  mimeType: string;
  content: string;
};

export class ResumeExtractionClient {
  constructor(private readonly aiExtractionUrl: string | null) {}

  async extract(
    request: ResumeExtractionRequestBody,
  ): Promise<ResumeExtractionResponse> {
    if (!this.aiExtractionUrl) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        ...STATIC_EXTRACTION,
        jobId: `ext-stub-${Date.now()}`,
        extractedAt: new Date().toISOString(),
        warnings: [
          ...STATIC_EXTRACTION.warnings,
          `Stub extraction for "${request.fileName}" — set AI_EXTRACTION_URL for live Python AI.`,
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

    return (await response.json()) as ResumeExtractionResponse;
  }
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
