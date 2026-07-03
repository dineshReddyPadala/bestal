import { skillCommunities, users } from '@bestal/mock-data';
import { cn } from '@bestal/shared-utils';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPath,
  type Resolver,
} from 'react-hook-form';
import { Label } from '../ui/label';
import {
  candidateWizardDefaults,
  candidateWizardSchema,
  DRAFT_STORAGE_KEY,
  FIELD_LABELS,
  WIZARD_STEPS,
  type CandidateWizardValues,
  type WizardStepId,
} from './candidate-wizard-schema';

type CandidateWizardProps = {
  onSubmit: (values: CandidateWizardValues) => void;
  onCancel: () => void;
  onToast: (message: string) => void;
};

const textareaClass =
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

function FormField({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && ' *'}
      </Label>
      {children}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Wizard progress" className="mb-8">
      <ol className="flex flex-wrap gap-2">
        {WIZARD_STEPS.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active && 'border-brand bg-brand/10 text-brand',
                done && !active && 'border-emerald-500/30 bg-emerald-50 text-emerald-700',
                !done && !active && 'border-border text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                  active && 'bg-brand text-white',
                  done && !active && 'bg-emerald-500 text-white',
                  !done && !active && 'bg-muted',
                )}
              >
                {idx + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PersonalStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CandidateWizardValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Organization ID" name="organizationId" required>
        <Input id="organizationId" type="number" {...register('organizationId', { valueAsNumber: true })} />
        <FieldError message={errors.organizationId?.message} />
      </FormField>
      <FormField label="Source" name="source" required>
        <Select id="source" {...register('source')}>
          <option value="DIRECT">Direct</option>
          <option value="REFERRAL">Referral</option>
          <option value="JOB_BOARD">Job Board</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="AGENCY">Agency</option>
          <option value="INTERNAL">Internal</option>
          <option value="OTHER">Other</option>
        </Select>
      </FormField>
      <FormField label="First Name" name="firstName" required>
        <Input id="firstName" {...register('firstName')} />
        <FieldError message={errors.firstName?.message} />
      </FormField>
      <FormField label="Last Name" name="lastName" required>
        <Input id="lastName" {...register('lastName')} />
        <FieldError message={errors.lastName?.message} />
      </FormField>
      <FormField label="Email" name="email" required>
        <Input id="email" type="email" {...register('email')} />
        <FieldError message={errors.email?.message} />
      </FormField>
      <FormField label="Phone" name="phone">
        <Input id="phone" {...register('phone')} placeholder="+1 (415) 555-0100" />
      </FormField>
      <FormField label="Location" name="location">
        <Input id="location" {...register('location')} placeholder="San Francisco, CA" />
      </FormField>
      <FormField label="LinkedIn URL" name="linkedinUrl">
        <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
      </FormField>
      <FormField label="Profile Photo URL" name="photoUrl">
        <Input id="photoUrl" {...register('photoUrl')} placeholder="https://..." />
      </FormField>
    </div>
  );
}

function ProfessionalStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CandidateWizardValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Headline" name="headline">
        <Input id="headline" {...register('headline')} />
      </FormField>
      <FormField label="Years Experience" name="yearsExperience">
        <Input id="yearsExperience" type="number" min={0} {...register('yearsExperience', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Primary Skill Community ID" name="primarySkillCommunityId">
        <Select id="primarySkillCommunityId" {...register('primarySkillCommunityId', { valueAsNumber: true })}>
          <option value="">— Select —</option>
          {skillCommunities.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.id} — {sc.name}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Summary" name="summary">
          <textarea id="summary" rows={4} className={textareaClass} {...register('summary')} />
        </FormField>
      </div>
      <FormField label="Status" name="status" required>
        <Select id="status" {...register('status')}>
          <option value="NEW">New</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PLACED">Placed</option>
          <option value="DO_NOT_CONTACT">Do Not Contact</option>
        </Select>
      </FormField>
      <FormField label="Visibility" name="visibility" required>
        <Select id="visibility" {...register('visibility')}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="HIDDEN">Hidden</option>
        </Select>
      </FormField>
      <FormField label="Approval Status" name="approvalStatus" required>
        <Select id="approvalStatus" {...register('approvalStatus')}>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </FormField>
      <FormField label="Published At" name="publishedAt">
        <Input id="publishedAt" type="datetime-local" {...register('publishedAt')} />
      </FormField>
      <FormField label="Hidden At" name="hiddenAt">
        <Input id="hiddenAt" type="datetime-local" {...register('hiddenAt')} />
      </FormField>
      <FormField label="Approved At" name="approvedAt">
        <Input id="approvedAt" type="datetime-local" {...register('approvedAt')} />
      </FormField>
      <FormField label="Approved By" name="approvedById">
        <Select id="approvedById" {...register('approvedById', { valueAsNumber: true })}>
          <option value="">— None —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.id} — {u.firstName} {u.lastName}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Rejected At" name="rejectedAt">
        <Input id="rejectedAt" type="datetime-local" {...register('rejectedAt')} />
      </FormField>
      <FormField label="Rejected By" name="rejectedById">
        <Select id="rejectedById" {...register('rejectedById', { valueAsNumber: true })}>
          <option value="">— None —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.id} — {u.firstName} {u.lastName}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Rejection Reason" name="rejectionReason">
          <Input id="rejectionReason" {...register('rejectionReason')} />
        </FormField>
      </div>
      <FormField label="Created At" name="createdAt">
        <Input id="createdAt" type="datetime-local" {...register('createdAt')} />
      </FormField>
      <FormField label="Updated At" name="updatedAt">
        <Input id="updatedAt" type="datetime-local" {...register('updatedAt')} />
      </FormField>
      <FormField label="Deleted At" name="deletedAt">
        <Input id="deletedAt" type="datetime-local" {...register('deletedAt')} />
      </FormField>
      <FieldError message={errors.headline?.message} />
    </div>
  );
}

function SkillsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateWizardValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add skill communities with proficiency, years, and primary flag (maps to CandidateSkill).
      </p>
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-border/80 bg-muted/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Skill #{index + 1}</p>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Skill Community" name={`skills.${index}.skillCommunityId`} required>
              <Select {...register(`skills.${index}.skillCommunityId`, { valueAsNumber: true })}>
                {skillCommunities.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Proficiency Level" name={`skills.${index}.proficiencyLevel`} required>
              <Select {...register(`skills.${index}.proficiencyLevel`)}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </Select>
            </FormField>
            <FormField label="Years Experience" name={`skills.${index}.yearsExperience`}>
              <Input type="number" min={0} {...register(`skills.${index}.yearsExperience`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Primary Skill" name={`skills.${index}.isPrimary`}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-brand" {...register(`skills.${index}.isPrimary`)} />
                Mark as primary skill
              </label>
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Notes" name={`skills.${index}.notes`}>
                <textarea rows={2} className={textareaClass} {...register(`skills.${index}.notes`)} />
              </FormField>
            </div>
            <FormField label="Deleted At" name={`skills.${index}.deletedAt`}>
              <Input type="datetime-local" {...register(`skills.${index}.deletedAt`)} />
            </FormField>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            skillCommunityId: 1,
            proficiencyLevel: 'INTERMEDIATE',
            yearsExperience: undefined,
            isPrimary: false,
            notes: '',
            deletedAt: '',
          })
        }
      >
        Add skill
      </Button>
      {errors.skills && <FieldError message="Check skill entries for errors" />}
    </div>
  );
}

function AvailabilityStep() {
  const { register } = useFormContext<CandidateWizardValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Available From" name="availableFrom" required>
        <Input id="availableFrom" type="date" {...register('availableFrom')} />
      </FormField>
      <FormField label="Timezone" name="timezone">
        <Input id="timezone" {...register('timezone')} placeholder="America/New_York" />
      </FormField>
      <FormField label="Notice Period (days)" name="noticePeriodDays">
        <Input id="noticePeriodDays" type="number" min={0} {...register('noticePeriodDays', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Hours Per Week" name="hoursPerWeek">
        <Input id="hoursPerWeek" type="number" min={1} max={168} {...register('hoursPerWeek', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Preferred Engagement" name="preferredEngagement">
        <Select id="preferredEngagement" {...register('preferredEngagement')}>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="FREELANCE">Freelance</option>
        </Select>
      </FormField>
      <FormField label="Blackout Dates" name="blackoutDates">
        <Input id="blackoutDates" {...register('blackoutDates')} placeholder="2026-08-01, 2026-08-15" />
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Availability Notes" name="availabilityNotes">
          <textarea id="availabilityNotes" rows={3} className={textareaClass} {...register('availabilityNotes')} />
        </FormField>
      </div>
    </div>
  );
}

function PricingStep() {
  const { register } = useFormContext<CandidateWizardValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Expected Rate ($/hr)" name="expectedRate">
        <Input id="expectedRate" type="number" min={0} step={0.01} {...register('expectedRate', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Currency" name="currency">
        <Input id="currency" maxLength={3} {...register('currency')} />
      </FormField>
      <FormField label="Pay Rate ($/hr)" name="payRate">
        <Input id="payRate" type="number" min={0} step={0.01} {...register('payRate', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Bill Rate ($/hr)" name="billRate">
        <Input id="billRate" type="number" min={0} step={0.01} {...register('billRate', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Pricing Effective From" name="pricingEffectiveFrom">
        <Input id="pricingEffectiveFrom" type="date" {...register('pricingEffectiveFrom')} />
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Pricing Notes" name="pricingNotes">
          <textarea id="pricingNotes" rows={3} className={textareaClass} {...register('pricingNotes')} />
        </FormField>
      </div>
    </div>
  );
}

function UploadStep() {
  const { register, setValue, watch } = useFormContext<CandidateWizardValues>();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Resume Document ID" name="resumeDocumentId">
          <Input id="resumeDocumentId" type="number" {...register('resumeDocumentId', { valueAsNumber: true })} placeholder="Auto-set on upload" />
        </FormField>
        <FormField label="Profile Image Document ID" name="profileImageDocumentId">
          <Input id="profileImageDocumentId" type="number" {...register('profileImageDocumentId', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Intro Video Document ID" name="introVideoDocumentId">
          <Input id="introVideoDocumentId" type="number" {...register('introVideoDocumentId', { valueAsNumber: true })} />
        </FormField>
      </div>

      <FileUpload
        label="Resume (PDF / Word)"
        accept=".pdf,.doc,.docx"
        onFileSelect={(file) => {
          setValue('resumeFileName', file.name);
          setValue('resumeDocumentId', Math.floor(Math.random() * 9000) + 1000);
        }}
      />
      {watch('resumeFileName') && (
        <p className="text-sm text-muted-foreground">Selected: {watch('resumeFileName')}</p>
      )}

      <FileUpload
        label="Profile Image"
        accept=".jpg,.jpeg,.png,.webp"
        hint="JPEG or PNG up to 5 MB"
        onFileSelect={(file) => {
          setValue('profileImageFileName', file.name);
          setValue('profileImageDocumentId', Math.floor(Math.random() * 9000) + 1000);
          setValue('photoUrl', `https://demo.bestal.local/uploads/${file.name}`);
        }}
      />
      {watch('profileImageFileName') && (
        <p className="text-sm text-muted-foreground">Selected: {watch('profileImageFileName')}</p>
      )}

      <FileUpload
        label="Intro Video (optional)"
        accept=".mp4,.webm,.mov"
        hint="MP4 or WebM up to 100 MB"
        onFileSelect={(file) => {
          setValue('introVideoFileName', file.name);
          setValue('introVideoDocumentId', Math.floor(Math.random() * 9000) + 1000);
        }}
      />
      {watch('introVideoFileName') && (
        <p className="text-sm text-muted-foreground">Selected: {watch('introVideoFileName')}</p>
      )}
    </div>
  );
}

function ReviewStep() {
  const { getValues } = useFormContext<CandidateWizardValues>();
  const values = getValues();

  const scalarKeys = (Object.keys(FIELD_LABELS) as (keyof CandidateWizardValues)[]).filter(
    (k) => k !== 'skills',
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review all candidate schema fields before submitting. Data is saved locally only (demo).
      </p>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {scalarKeys.map((key) => {
          const val = values[key];
          const display =
            val === undefined || val === null || val === ''
              ? '—'
              : typeof val === 'number'
                ? String(val)
                : String(val);
          return (
            <div key={key} className="border-b border-border/50 pb-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {FIELD_LABELS[key]}
              </dt>
              <dd className="mt-0.5 break-words text-sm">{display}</dd>
            </div>
          );
        })}
      </dl>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Skills ({values.skills.length})</h4>
        <div className="space-y-2">
          {values.skills.map((skill, i) => {
            const community = skillCommunities.find((sc) => sc.id === skill.skillCommunityId);
            return (
              <div key={i} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                {community?.name ?? skill.skillCommunityId} · {skill.proficiencyLevel} ·{' '}
                {skill.yearsExperience ?? '—'} yrs · {skill.isPrimary ? 'Primary' : 'Secondary'}
                {skill.notes && <span className="text-muted-foreground"> — {skill.notes}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepContent({ stepId }: { stepId: WizardStepId }) {
  switch (stepId) {
    case 'personal':
      return <PersonalStep />;
    case 'professional':
      return <ProfessionalStep />;
    case 'skills':
      return <SkillsStep />;
    case 'availability':
      return <AvailabilityStep />;
    case 'pricing':
      return <PricingStep />;
    case 'upload':
      return <UploadStep />;
    case 'review':
      return <ReviewStep />;
    default:
      return null;
  }
}

export function CandidateWizard({ onSubmit, onCancel, onToast }: CandidateWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = WIZARD_STEPS[stepIndex]!;

  const methods = useForm<CandidateWizardValues>({
    resolver: zodResolver(candidateWizardSchema) as Resolver<CandidateWizardValues>,
    defaultValues: candidateWizardDefaults,
    mode: 'onBlur',
  });

  const { handleSubmit, trigger, getValues, reset, setValue } = methods;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CandidateWizardValues;
        reset({ ...candidateWizardDefaults, ...parsed });
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [reset]);

  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(getValues()));
    onToast('Draft saved locally (demo)');
  }, [getValues, onToast]);

  const runAi = useCallback(() => {
    const first = getValues('firstName') || 'Candidate';
    const headline = getValues('headline') || 'Senior Engineer';
    setValue(
      'summary',
      `AI-generated summary: ${first} is a strong ${headline} profile with verified skills and enterprise-ready experience. Recommended for client shortlists after evaluation.`,
    );
    onToast('AI screening complete — summary pre-filled (demo)');
  }, [getValues, setValue, onToast]);

  async function goNext() {
    const fields = [...currentStep.fields] as FieldPath<CandidateWizardValues>[];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
  }

  function goPrevious() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === WIZARD_STEPS.length - 1;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((values) => {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          onSubmit(values);
        })}
      >
        <StepIndicator currentStep={stepIndex} />

        <div className="mb-6">
          <h2 className="text-lg font-semibold">{currentStep.label}</h2>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </div>

        <div className="min-h-[320px] rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/10 p-6">
          <StepContent stepId={currentStep.id} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={saveDraft}>
              Save Draft
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={runAi}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Run AI
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isFirst && (
              <Button type="button" variant="outline" size="sm" onClick={goPrevious}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            )}
            {!isLast && (
              <Button type="button" variant="primary" size="sm" onClick={goNext}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {isLast && (
              <Button type="submit" variant="primary" size="sm">
                Submit
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
