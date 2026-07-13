import type {
  ResumeExtractionRequest,
  ResumeExtractionResponse,
} from './resume-extraction.types';

/** Static sample matching the expected AI extraction response contract. */
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

/**
 * Extract resume fields via AI service.
 * When VITE_AI_EXTRACTION_URL is set, calls the external endpoint with base64 file content.
 * Otherwise returns static sample data for UI development.
 */
export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export async function extractResumeFromFile(file: File): Promise<ResumeExtractionResponse> {
  const content = await fileToBase64(file);
  return extractResume({
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    content,
  });
}

export async function extractResume(
  request: ResumeExtractionRequest,
): Promise<ResumeExtractionResponse> {
  const aiUrl = import.meta.env.VITE_AI_EXTRACTION_URL;

  if (aiUrl) {
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        detail ? `AI extraction failed: ${detail}` : `AI extraction failed: ${response.statusText}`,
      );
    }
    return (await response.json()) as ResumeExtractionResponse;
  }

  // Simulate network latency for realistic UX
  await new Promise((r) => setTimeout(r, 800));

  return {
    ...STATIC_EXTRACTION,
    jobId: `ext-stub-${Date.now()}`,
    extractedAt: new Date().toISOString(),
    warnings: [
      ...STATIC_EXTRACTION.warnings,
      `Stub extraction for "${request.fileName}" — connect VITE_AI_EXTRACTION_URL for live AI.`,
    ],
  };
}

export { STATIC_EXTRACTION };
