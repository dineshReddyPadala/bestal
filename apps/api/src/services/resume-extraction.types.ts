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
  jobId: string;
  confidence: number;
  extractedAt: string;
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
  rawSections: {
    summary: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
  };
  warnings: string[];
};
