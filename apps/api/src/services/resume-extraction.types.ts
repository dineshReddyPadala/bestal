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

/** Unified extract + AI screening response from Python. */
export type ResumeExtractionResponse = {
  jobId: string;
  confidence: number;
  extractedAt: string;
  warnings: string[];
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
  primaryRole: string | null;
  seniority: string | null;
  community: string | null;
  skills: ResumeExtractionSkill[];
  experience: ResumeExtractionExperience[];
  education: ResumeExtractionEducation[];
  aiSummary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  riskFlags: string | null;
  bestalScore: number | null;
  recommendedClientRate: number | null;
  recommendedCandidateRate: number | null;
  rawSections: {
    summary: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
  };
};
