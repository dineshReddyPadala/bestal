/**
 * Expected JSON response from the AI resume extraction service.
 * This structure will be returned by a separate AI project endpoint.
 * For now, use the static stub in resume-extraction.stub.ts.
 */
export type ResumeExtractionSkill = {
  name: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience: number | null;
  isPrimary: boolean;
};

export type ResumeExtractionExperience = {
  company: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
};

export type ResumeExtractionEducation = {
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
};

export type ResumeExtractionResponse = {
  /** Extraction job id from AI service */
  jobId: string;
  /** Overall confidence score 0–1 */
  confidence: number;
  /** ISO timestamp when extraction completed */
  extractedAt: string;
  /** Parsed candidate fields */
  candidate: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedinUrl: string | null;
    headline: string | null;
    summary: string | null;
    yearsExperience: number | null;
  };
  skills: ResumeExtractionSkill[];
  experience: ResumeExtractionExperience[];
  education: ResumeExtractionEducation[];
  /** Raw text snippets for review */
  rawSections: {
    summary: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
  };
  /** Warnings or low-confidence fields */
  warnings: string[];
};

export type ResumeExtractionRequest = {
  fileName: string;
  mimeType: string;
  /** Base64-encoded file content or file URL — AI service defines transport */
  content?: string;
};
