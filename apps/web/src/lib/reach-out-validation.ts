import { ApiError } from './api/types';
import { getApiErrorMessage } from './api/errors';

const PERSONAL_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

export type ReachOutJobValues = {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  experienceRequired: string;
  numberOfResources: string;
};

export type ReachOutFormValues = {
  companyName: string;
  location: string;
  timezone: string;
  companyWebsite: string;
  contactPersonName: string;
  email: string;
  phone: string;
  jobs: ReachOutJobValues[];
  additionalRequirements: string;
};

const FIELD_LABELS: Record<string, string> = {
  companyName: 'Company name',
  location: 'Location',
  timezone: 'Time zone',
  companyWebsite: 'Company website',
  contactPersonName: 'Contact person name',
  email: 'Email',
  phone: 'Phone number',
  jobTitle: 'Job title',
  jobDescription: 'Job description',
  requiredSkills: 'Required skills',
  experienceRequired: 'Experience required',
  numberOfResources: 'Number of resources',
  additionalRequirements: 'Additional requirements',
};

function isWorkEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  return Boolean(domain && !PERSONAL_EMAIL_DOMAINS.includes(domain));
}

function isValidWebsite(value: string) {
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

export function reachOutStepForField(field: string): number {
  if (field.startsWith('jobs.')) return 2;
  if (field === 'additionalRequirements') return 3;
  return 1;
}

export function formatReachOutFieldLabel(field: string): string {
  const jobMatch = field.match(/^jobs\.(\d+)\.(\w+)$/);
  if (jobMatch) {
    const roleNum = Number(jobMatch[1]) + 1;
    const label = FIELD_LABELS[jobMatch[2]] ?? jobMatch[2];
    return `Role ${roleNum} — ${label}`;
  }
  return FIELD_LABELS[field] ?? field;
}

export function getReachOutJobFieldError(
  fieldErrors: Record<string, string>,
  jobIndex: number,
  field: keyof ReachOutJobValues,
): string | undefined {
  return fieldErrors[`jobs.${jobIndex}.${field}`];
}

export function validateReachOutStep1(form: ReachOutFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.companyName.trim()) {
    errors.companyName = 'Company name is required';
  }
  if (!form.location.trim()) {
    errors.location = 'Location is required';
  }
  if (!form.timezone) {
    errors.timezone = 'Time zone is required';
  }
  if (form.companyWebsite.trim() && !isValidWebsite(form.companyWebsite.trim())) {
    errors.companyWebsite = 'Enter a valid company website';
  }
  if (!form.contactPersonName.trim()) {
    errors.contactPersonName = 'Contact person name is required';
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address';
  } else if (!isWorkEmail(form.email.trim())) {
    errors.email = 'Please use a work email address';
  }
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (form.phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Enter a valid phone number (at least 7 digits)';
  }

  return errors;
}

export function validateReachOutStep2(jobs: ReachOutJobValues[]): Record<string, string> {
  const errors: Record<string, string> = {};

  jobs.forEach((job, index) => {
    if (!job.jobTitle.trim()) {
      errors[`jobs.${index}.jobTitle`] = 'Job title is required';
    }
    if (!job.jobDescription.trim()) {
      errors[`jobs.${index}.jobDescription`] = 'Job description is required';
    } else if (job.jobDescription.trim().length < 10) {
      errors[`jobs.${index}.jobDescription`] = 'Job description must be at least 10 characters';
    }
    if (!job.requiredSkills.trim()) {
      errors[`jobs.${index}.requiredSkills`] = 'Required skills are required';
    }
    if (!job.experienceRequired) {
      errors[`jobs.${index}.experienceRequired`] = 'Experience required is required';
    }
    if (!job.numberOfResources) {
      errors[`jobs.${index}.numberOfResources`] = 'Number of resources is required';
    }
  });

  return errors;
}

export function validateReachOutStep3(
  form: Pick<ReachOutFormValues, 'additionalRequirements'>,
  uploadCount: number,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.additionalRequirements.trim()) {
    errors.additionalRequirements = 'Additional requirements are required';
  }
  if (uploadCount === 0) {
    errors.attachments = 'Please upload at least one document';
  }

  return errors;
}

export function validateReachOutForm(
  form: ReachOutFormValues,
  uploadCount: number,
): Record<string, string> {
  return {
    ...validateReachOutStep1(form),
    ...validateReachOutStep2(form.jobs),
    ...validateReachOutStep3(form, uploadCount),
  };
}

export function firstReachOutStepWithErrors(errors: Record<string, string>): number {
  const fields = Object.keys(errors);
  if (fields.length === 0) return 1;
  return Math.min(...fields.map((field) => reachOutStepForField(field)));
}

export function mapApiErrorsToReachOut(error: unknown): {
  fieldErrors: Record<string, string>;
  message: string;
  step: number;
} {
  if (!(error instanceof ApiError) || !error.detail?.errors?.length) {
    return {
      fieldErrors: {},
      message: getApiErrorMessage(error, 'Unable to submit your enquiry.'),
      step: 1,
    };
  }

  const fieldErrors = Object.fromEntries(
    error.detail.errors.map((entry) => [entry.field, entry.message]),
  );

  return {
    fieldErrors,
    message: error.detail.errors
      .map((entry) => `${formatReachOutFieldLabel(entry.field)}: ${entry.message}`)
      .join('. '),
    step: firstReachOutStepWithErrors(fieldErrors),
  };
}
