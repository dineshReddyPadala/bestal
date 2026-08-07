import { z } from 'zod';

/** Payload stored on AutomationJob.inputReference for RESUME_SCREENING. */
export const resumeScreeningInputSchema = z.object({
  candidateId: z.number().int().positive(),
  documentId: z.number().int().positive(),
  fileName: z.string().min(1).max(255).optional(),
  mimeType: z.string().min(1).max(127).optional(),
});

const proficiencySchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']))
  .optional();

export const resumeScreeningSkillSchema = z.object({
  name: z.string().trim().max(150).optional(),
  skillName: z.string().trim().max(150).optional(),
  skillCategory: z.string().trim().max(100).optional(),
  proficiency: proficiencySchema,
  proficiencyLevel: proficiencySchema,
  yearsExperience: z.coerce.number().min(0).max(80).optional(),
  skillYearsExperience: z.coerce.number().min(0).max(80).optional(),
  isPrimary: z.boolean().optional(),
});

export const resumeScreeningExperienceSchema = z.object({
  company: z.string().trim().max(255),
  title: z.string().trim().max(255).optional(),
  startDate: z.string().trim().max(50).optional().nullable(),
  endDate: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const resumeScreeningEducationSchema = z.object({
  institution: z.string().trim().max(255),
  degree: z.string().trim().max(255).optional().nullable(),
  fieldOfStudy: z.string().trim().max(255).optional().nullable(),
  graduationYear: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
});

/**
 * Validated AI result from n8n. Supports nested `candidate` or flat fields.
 * All persistence goes through application validation — never trust raw output.
 */
export const resumeScreeningOutputSchema = z
  .object({
    confidence: z.coerce.number().min(0).max(1).optional(),
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    email: z.string().trim().email().max(255).optional(),
    phone: z.string().trim().max(30).optional(),
    location: z.string().trim().max(255).optional(),
    timezone: z.string().trim().max(100).optional(),
    headline: z.string().trim().max(255).optional(),
    yearsExperience: z.coerce.number().min(0).max(80).optional(),
    primaryRole: z.string().trim().max(150).optional(),
    summary: z.string().trim().max(20000).optional(),
    aiSummary: z.string().trim().max(20000).optional(),
    strengths: z.string().trim().max(20000).optional(),
    weaknesses: z.string().trim().max(20000).optional(),
    riskFlags: z.string().trim().max(20000).optional(),
    community: z.string().trim().max(150).optional(),
    skillCategory: z.string().trim().max(100).optional(),
    bestalScore: z.coerce.number().int().min(0).max(100).optional(),
    recommendedClientRate: z.coerce.number().min(0).optional(),
    recommendedCandidateRate: z.coerce.number().min(0).optional(),
    currentCompany: z.string().trim().max(255).optional(),
    /** Formatted education text for DB column when arrays are omitted. */
    education: z.string().trim().max(10000).optional(),
    experience: z.array(resumeScreeningExperienceSchema).max(50).optional(),
    educationHistory: z.array(resumeScreeningEducationSchema).max(20).optional(),
    skills: z.array(resumeScreeningSkillSchema).max(100).optional(),
    warnings: z.array(z.string()).optional(),
    candidate: z
      .object({
        firstName: z.string().trim().max(100).optional(),
        lastName: z.string().trim().max(100).optional(),
        email: z.string().trim().email().max(255).optional(),
        phone: z.string().trim().max(30).optional(),
        location: z.string().trim().max(255).optional(),
        timezone: z.string().trim().max(100).optional(),
        headline: z.string().trim().max(255).optional(),
        summary: z.string().trim().max(20000).optional(),
        yearsExperience: z.coerce.number().min(0).max(80).optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    const firstName = value.firstName ?? value.candidate?.firstName;
    const lastName = value.lastName ?? value.candidate?.lastName;
    if (!firstName?.trim() && !lastName?.trim() && !value.aiSummary?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AI output must include a name or aiSummary',
      });
    }
  });

export type ResumeScreeningInput = z.infer<typeof resumeScreeningInputSchema>;
export type ResumeScreeningOutput = z.infer<typeof resumeScreeningOutputSchema>;
export type ResumeScreeningSkill = z.infer<typeof resumeScreeningSkillSchema>;
