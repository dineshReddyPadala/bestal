import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { jobRequestsApi } from '../../lib/api/job-requests';
import { ApiError } from '../../lib/api/types';

const PERSONAL_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

const EXPERIENCE_OPTIONS = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal'] as const;
const RESOURCE_OPTIONS = ['1', '2-3', '4-5', '6+'] as const;

const step1Schema = z.object({
  jobTitle: z.string().trim().min(1, 'Job title is required').max(255),
  jobDescription: z.string().trim().min(10, 'Please provide at least 10 characters').max(10000),
  requiredSkills: z.string().trim().min(1, 'At least one skill is required'),
  experienceRequired: z.enum(EXPERIENCE_OPTIONS, { message: 'Select experience level' }),
  numberOfResources: z.enum(RESOURCE_OPTIONS, { message: 'Select headcount' }),
});

const step2Schema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required').max(255),
    website: z
      .string()
      .trim()
      .min(1, 'Website is required')
      .max(500)
      .transform((val) => (/^https?:\/\//i.test(val) ? val : `https://${val}`))
      .pipe(z.string().url('Enter a valid website URL')),
    contactName: z.string().trim().min(1, 'Contact name is required').max(150),
    contactEmail: z.string().trim().email('Enter a valid work email').max(255),
    contactPhone: z.string().trim().min(7, 'Enter a valid phone number').max(30),
    websiteConfirm: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    const domain = data.contactEmail.split('@')[1]?.toLowerCase();
    if (domain && PERSONAL_EMAIL_DOMAINS.includes(domain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please use your work email — we cannot route personal addresses.',
        path: ['contactEmail'],
      });
    }
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type FormValues = Step1Values & Step2Values;

type PostJobModalProps = {
  open: boolean;
  onClose: () => void;
};

function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export function PostJobModal({ open, onClose }: PostJobModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      jobTitle: '',
      jobDescription: '',
      requiredSkills: '',
      experienceRequired: undefined,
      numberOfResources: undefined,
      companyName: '',
      website: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      websiteConfirm: '',
    },
    mode: 'onBlur',
  });

  const submitMutation = useMutation({
    mutationFn: jobRequestsApi.submitPublic,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSubmittedMessage(null);
      setSubmitError(null);
      form.reset();
    }
  }, [open, form]);

  if (!open) return null;

  const fieldClass =
    'w-full rounded-[9px] border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-[14px] py-3 text-[15.5px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-teal)] focus:shadow-[0_0_0_3px_var(--mkt-teal-t)]';
  const labelClass = 'mb-[7px] block text-[13.5px] font-semibold text-[var(--mkt-ink)]';
  const errorClass = 'mt-1.5 text-sm text-red-600';

  async function handleNext() {
    setSubmitError(null);
    const values = form.getValues();
    const parsed = step1Schema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          form.setError(field as keyof FormValues, { message: issue.message });
        }
      }
      return;
    }
    setStep(2);
  }

  async function handleSubmit() {
    setSubmitError(null);
    const values = form.getValues();
    const parsed = step1Schema.merge(step2Schema).safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          form.setError(field as keyof FormValues, { message: issue.message });
          if (['jobTitle', 'jobDescription', 'requiredSkills', 'experienceRequired', 'numberOfResources'].includes(field)) {
            setStep(1);
          }
        }
      }
      return;
    }

    const skills = parseSkills(values.requiredSkills);
    if (skills.length === 0) {
      form.setError('requiredSkills', { message: 'At least one skill is required' });
      setStep(1);
      return;
    }

    try {
      const result = await submitMutation.mutateAsync({
        jobTitle: parsed.data.jobTitle,
        jobDescription: parsed.data.jobDescription,
        requiredSkills: skills,
        experienceRequired: parsed.data.experienceRequired,
        numberOfResources: parsed.data.numberOfResources,
        companyName: parsed.data.companyName,
        website: parsed.data.website,
        contactName: parsed.data.contactName,
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone,
        websiteConfirm: parsed.data.websiteConfirm,
      });
      setSubmittedMessage(result.message);
    } catch (err) {
      if (err instanceof ApiError && err.detail?.errors?.length) {
        setSubmitError(err.detail.errors.map((e) => e.message).join(' '));
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    }
  }

  return (
    <div className="mkt-modal-root">
      <div className="mkt-modal-backdrop" onClick={onClose} aria-hidden />
      <div className="mkt-modal" role="dialog" aria-modal aria-labelledby="post-job-title">
        <div className="mkt-modal-header">
          <div>
            <h2 id="post-job-title" className="text-xl font-bold text-[var(--mkt-ink)]">
              Post a Job
            </h2>
            <p className="mt-1 text-sm text-[var(--mkt-ink-d)]">
              Tell us what you need — our team will follow up to match proven talent.
            </p>
          </div>
          <button type="button" className="mkt-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {submittedMessage ? (
          <div className="mkt-modal-body">
            <div className="mkt-modal-success">
              <h3>Request received</h3>
              <p className="mt-3 text-base text-[var(--mkt-ink-d)]">{submittedMessage}</p>
            </div>
            <div className="mkt-modal-footer">
              <button type="button" className="mkt-btn mkt-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mkt-stepper" aria-label="Form progress">
              <div className={`mkt-step ${step === 1 ? 'mkt-step-active' : 'mkt-step-done'}`}>
                <span className="mkt-step-num">1</span>
                <span className="mkt-step-label">Job Details</span>
              </div>
              <div className="mkt-step-line" />
              <div className={`mkt-step ${step === 2 ? 'mkt-step-active' : ''}`}>
                <span className="mkt-step-num">2</span>
                <span className="mkt-step-label">Client Details</span>
              </div>
            </div>

            <div className="mkt-modal-body">
              {submitError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

              {step === 1 ? (
                <div className="space-y-[17px]">
                  <div>
                    <label className={labelClass} htmlFor="jobTitle">
                      Job title *
                    </label>
                    <input id="jobTitle" className={fieldClass} {...form.register('jobTitle')} />
                    {form.formState.errors.jobTitle && (
                      <p className={errorClass}>{form.formState.errors.jobTitle.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="jobDescription">
                      Job description *
                    </label>
                    <textarea
                      id="jobDescription"
                      rows={5}
                      className={`${fieldClass} resize-y min-h-[120px]`}
                      {...form.register('jobDescription')}
                    />
                    {form.formState.errors.jobDescription && (
                      <p className={errorClass}>{form.formState.errors.jobDescription.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="requiredSkills">
                      Required skills *
                    </label>
                    <input
                      id="requiredSkills"
                      className={fieldClass}
                      placeholder="e.g. React, Node.js, AWS"
                      {...form.register('requiredSkills')}
                    />
                    <p className="mt-1.5 text-xs text-[var(--mkt-ink-f)]">Separate skills with commas</p>
                    {form.formState.errors.requiredSkills && (
                      <p className={errorClass}>{form.formState.errors.requiredSkills.message}</p>
                    )}
                  </div>
                  <div className="mkt-form-grid-2">
                    <div>
                      <label className={labelClass} htmlFor="experienceRequired">
                        Experience required *
                      </label>
                      <select id="experienceRequired" className={fieldClass} {...form.register('experienceRequired')}>
                        <option value="">Select level</option>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {form.formState.errors.experienceRequired && (
                        <p className={errorClass}>{form.formState.errors.experienceRequired.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="numberOfResources">
                        Number of resources *
                      </label>
                      <select id="numberOfResources" className={fieldClass} {...form.register('numberOfResources')}>
                        <option value="">Select headcount</option>
                        {RESOURCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {form.formState.errors.numberOfResources && (
                        <p className={errorClass}>{form.formState.errors.numberOfResources.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-[17px]">
                  <div className="mkt-form-grid-2">
                    <div>
                      <label className={labelClass} htmlFor="companyName">
                        Company name *
                      </label>
                      <input id="companyName" className={fieldClass} {...form.register('companyName')} />
                      {form.formState.errors.companyName && (
                        <p className={errorClass}>{form.formState.errors.companyName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="website">
                        Website *
                      </label>
                      <input
                        id="website"
                        type="url"
                        className={fieldClass}
                        placeholder="https://"
                        {...form.register('website')}
                      />
                      {form.formState.errors.website && (
                        <p className={errorClass}>{form.formState.errors.website.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="contactName">
                      Primary contact name *
                    </label>
                    <input id="contactName" className={fieldClass} {...form.register('contactName')} />
                    {form.formState.errors.contactName && (
                      <p className={errorClass}>{form.formState.errors.contactName.message}</p>
                    )}
                  </div>
                  <div className="mkt-form-grid-2">
                    <div>
                      <label className={labelClass} htmlFor="contactEmail">
                        Primary contact email *
                      </label>
                      <input
                        id="contactEmail"
                        type="email"
                        className={fieldClass}
                        {...form.register('contactEmail')}
                      />
                      {form.formState.errors.contactEmail && (
                        <p className={errorClass}>{form.formState.errors.contactEmail.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="contactPhone">
                        Primary contact phone *
                      </label>
                      <input id="contactPhone" type="tel" className={fieldClass} {...form.register('contactPhone')} />
                      {form.formState.errors.contactPhone && (
                        <p className={errorClass}>{form.formState.errors.contactPhone.message}</p>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute h-0 w-0 overflow-hidden opacity-0"
                    {...form.register('websiteConfirm')}
                  />
                </div>
              )}
            </div>

            <div className="mkt-modal-footer">
              <button type="button" className="mkt-btn mkt-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              {step === 2 && (
                <button type="button" className="mkt-btn mkt-btn-secondary" onClick={() => setStep(1)}>
                  Previous
                </button>
              )}
              {step === 1 ? (
                <button type="button" className="mkt-btn mkt-btn-primary" onClick={() => void handleNext()}>
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="mkt-btn mkt-btn-primary"
                  disabled={submitMutation.isPending}
                  onClick={() => void handleSubmit()}
                >
                  {submitMutation.isPending ? 'Submitting…' : 'Submit request'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
