import { cn } from '@bestal/shared-utils';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPath,
  type Resolver,
} from 'react-hook-form';
import { useSkillCommunitiesList } from '../../hooks/api/useSkillCommunities';
import type { SkillCommunityListItem } from '../../lib/api/types';
import { Label } from '../ui/label';
import {
  buildCandidatePayload,
  candidateWizardDefaults,
  candidateWizardFormSchema,
  DRAFT_STORAGE_KEY,
  REVIEW_FIELD_KEYS,
  USER_FIELD_LABELS,
  WIZARD_STEPS,
  type CandidateWizardFormValues,
  type CandidateWizardUploads,
  type CandidateWizardValues,
  type WizardStepId,
} from './candidate-wizard-schema';

type CandidateWizardProps = {
  onSubmit: (values: CandidateWizardValues, uploads: CandidateWizardUploads) => void | Promise<void>;
  onCancel: () => void;
  onToast: (message: string) => void;
};

const SkillCommunitiesContext = createContext<SkillCommunityListItem[]>([]);

function useSkillCommunityOptions() {
  return useContext(SkillCommunitiesContext);
}

function SkillCommunitySelectOptions() {
  const skillCommunities = useSkillCommunityOptions();
  return (
    <>
      <option value="">— Select —</option>
      {skillCommunities.map((community) => (
        <option key={community.id} value={community.id}>
          {community.name}
        </option>
      ))}
    </>
  );
}

function skillCommunityName(
  skillCommunities: SkillCommunityListItem[],
  id: number | undefined,
): string {
  if (!id) return '—';
  return skillCommunities.find((community) => community.id === id)?.name ?? String(id);
}

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
  } = useFormContext<CandidateWizardFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="sm:col-span-2">
        <FormField label="LinkedIn Profile" name="linkedinUrl">
          <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
        </FormField>
      </div>
      <FormField label="GitHub Profile" name="githubUrl">
        <Input id="githubUrl" {...register('githubUrl')} placeholder="https://github.com/..." />
      </FormField>
      <FormField label="Naukri Profile" name="naukriUrl">
        <Input id="naukriUrl" {...register('naukriUrl')} placeholder="https://naukri.com/..." />
      </FormField>
      <FormField label="Display Name" name="displayName">
        <Input id="displayName" {...register('displayName')} placeholder="Optional public display name" />
      </FormField>
      <FormField label="Oorwin Candidate ID" name="oorwinCandidateId">
        <Input id="oorwinCandidateId" {...register('oorwinCandidateId')} placeholder="External ATS ID" />
      </FormField>
    </div>
  );
}

function ProfessionalStep() {
  const { register } = useFormContext<CandidateWizardFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Headline" name="headline">
        <Input id="headline" {...register('headline')} placeholder="Senior Full-Stack Engineer" />
      </FormField>
      <FormField label="Primary Role" name="primaryRole">
        <Input id="primaryRole" {...register('primaryRole')} placeholder="Full-Stack Developer" />
      </FormField>
      <FormField label="Current Company" name="currentCompany">
        <Input id="currentCompany" {...register('currentCompany')} />
      </FormField>
      <FormField label="Education" name="education">
        <Input id="education" {...register('education')} placeholder="B.Tech Computer Science" />
      </FormField>
      <FormField label="Years Experience" name="yearsExperience">
        <Input
          id="yearsExperience"
          type="number"
          min={0}
          {...register('yearsExperience', { valueAsNumber: true })}
        />
      </FormField>
      <FormField label="Primary Skill Community" name="primarySkillCommunityId">
        <Select id="primarySkillCommunityId" {...register('primarySkillCommunityId', { valueAsNumber: true })}>
          <SkillCommunitySelectOptions />
        </Select>
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Summary" name="summary">
          <textarea id="summary" rows={4} className={textareaClass} {...register('summary')} />
        </FormField>
      </div>
      <div className="sm:col-span-2">
        <FormField label="Client Profile Summary" name="clientProfileSummary">
          <textarea
            id="clientProfileSummary"
            rows={3}
            className={textareaClass}
            {...register('clientProfileSummary')}
            placeholder="Client-facing profile summary"
          />
        </FormField>
      </div>
      <FormField label="Strengths" name="strengths">
        <textarea id="strengths" rows={2} className={textareaClass} {...register('strengths')} />
      </FormField>
      <FormField label="Weaknesses" name="weaknesses">
        <textarea id="weaknesses" rows={2} className={textareaClass} {...register('weaknesses')} />
      </FormField>
    </div>
  );
}

function SkillsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateWizardFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });
  const skillCommunities = useSkillCommunityOptions();
  const defaultSkillCommunityId = skillCommunities[0]?.id;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add skill communities with proficiency level and years of experience.
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
              <Select {...register(`skills.${index}.skillCommunityId`)}>
                <SkillCommunitySelectOptions />
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
              <Input
                type="number"
                min={0}
                {...register(`skills.${index}.yearsExperience`, { valueAsNumber: true })}
              />
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
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            skillCommunityId: defaultSkillCommunityId,
            proficiencyLevel: 'INTERMEDIATE',
            yearsExperience: undefined,
            isPrimary: false,
            notes: '',
          })
        }
        disabled={!defaultSkillCommunityId}
      >
        Add skill
      </Button>
      {errors.skills && <FieldError message="Check skill entries for errors" />}
    </div>
  );
}

function AvailabilityStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CandidateWizardFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Available From" name="availableFrom" required>
        <Input id="availableFrom" type="date" {...register('availableFrom')} />
        <FieldError message={errors.availableFrom?.message} />
      </FormField>
      <FormField label="Timezone" name="timezone">
        <Input id="timezone" {...register('timezone')} placeholder="America/New_York" />
      </FormField>
      <FormField label="Availability Status" name="availabilityStatus">
        <Select id="availabilityStatus" {...register('availabilityStatus')}>
          <option value="AVAILABLE">Available</option>
          <option value="PARTIALLY_AVAILABLE">Partially Available</option>
          <option value="NOT_AVAILABLE">Not Available</option>
          <option value="ON_NOTICE">On Notice</option>
        </Select>
      </FormField>
      <FormField label="Preferred Shift" name="preferredShift">
        <Select id="preferredShift" {...register('preferredShift')}>
          <option value="">— Any —</option>
          <option value="DAY">Day</option>
          <option value="EVENING">Evening</option>
          <option value="NIGHT">Night</option>
          <option value="FLEXIBLE">Flexible</option>
        </Select>
      </FormField>
      <FormField label="Notice Period (days)" name="noticePeriodDays">
        <Input id="noticePeriodDays" type="number" min={0} {...register('noticePeriodDays', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Hours Per Week" name="hoursPerWeek">
        <Input id="hoursPerWeek" type="number" min={1} max={168} {...register('hoursPerWeek', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Min Hours / Week" name="minHoursPerWeek">
        <Input id="minHoursPerWeek" type="number" min={1} max={168} {...register('minHoursPerWeek', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Max Hours / Week" name="maxHoursPerWeek">
        <Input id="maxHoursPerWeek" type="number" min={1} max={168} {...register('maxHoursPerWeek', { valueAsNumber: true })} />
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
  const { register } = useFormContext<CandidateWizardFormValues>();

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
      <div className="sm:col-span-2">
        <FormField label="Pricing Notes" name="pricingNotes">
          <textarea id="pricingNotes" rows={3} className={textareaClass} {...register('pricingNotes')} />
        </FormField>
      </div>
    </div>
  );
}

function DocumentsStep({
  onToast,
  pendingUploads,
}: {
  onToast?: (msg: string) => void;
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
}) {
  const { setValue, watch } = useFormContext<CandidateWizardFormValues>();
  const [extracting, setExtracting] = useState(false);

  async function handleResumeSelect(file: File) {
    pendingUploads.current.resume = file;
    setValue('resumeFileName', file.name, { shouldValidate: true });
    setExtracting(true);
    try {
      const { extractResume } = await import('../../lib/api/ai/resume-extraction.stub');
      const result = await extractResume({
        fileName: file.name,
        mimeType: file.type,
      });
      const c = result.candidate;
      if (c.firstName) setValue('firstName', c.firstName);
      if (c.lastName) setValue('lastName', c.lastName);
      if (c.email) setValue('email', c.email);
      if (c.phone) setValue('phone', c.phone);
      if (c.location) setValue('location', c.location);
      if (c.linkedinUrl) setValue('linkedinUrl', c.linkedinUrl);
      if (c.headline) setValue('headline', c.headline);
      if (c.summary) setValue('summary', c.summary);
      if (c.yearsExperience != null) setValue('yearsExperience', c.yearsExperience);
      onToast?.(`Resume extracted (${Math.round(result.confidence * 100)}% confidence)`);
    } catch {
      onToast?.('Resume uploaded — extraction unavailable');
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Upload files directly — no URLs needed. Documents are stored securely after you submit.
      </p>

      <div>
        <FileUpload
          label="Resume (PDF / Word)"
          accept=".pdf,.doc,.docx"
          onFileSelect={(file) => void handleResumeSelect(file)}
        />
        {extracting && (
          <p className="mt-2 text-sm text-muted-foreground">Extracting resume fields…</p>
        )}
        {watch('resumeFileName') && (
          <p className="mt-2 text-sm text-emerald-700">Selected: {watch('resumeFileName')}</p>
        )}
      </div>

      <div>
        <FileUpload
          label="Profile Photo"
          accept=".jpg,.jpeg,.png,.webp"
          hint="JPEG or PNG up to 5 MB"
          onFileSelect={(file) => {
            pendingUploads.current.profileImage = file;
            setValue('profileImageFileName', file.name, { shouldValidate: true });
          }}
        />
        {watch('profileImageFileName') && (
          <p className="mt-2 text-sm text-emerald-700">Selected: {watch('profileImageFileName')}</p>
        )}
      </div>

      <div>
        <FileUpload
          label="Intro Video (optional)"
          accept=".mp4,.webm,.mov"
          hint="MP4 or WebM up to 100 MB"
          onFileSelect={(file) => {
            pendingUploads.current.introVideo = file;
            setValue('introVideoFileName', file.name, { shouldValidate: true });
          }}
        />
        {watch('introVideoFileName') && (
          <p className="mt-2 text-sm text-emerald-700">Selected: {watch('introVideoFileName')}</p>
        )}
      </div>
    </div>
  );
}

function ReviewStep() {
  const { getValues } = useFormContext<CandidateWizardFormValues>();
  const values = getValues();
  const skillCommunities = useSkillCommunityOptions();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review your entries before creating the candidate. Status, approval workflow, and audit
        fields are set automatically by the system.
      </p>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {REVIEW_FIELD_KEYS.map((key) => {
          const val = values[key];
          let display: string;
          if (val === undefined || val === null || val === '') {
            display = '—';
          } else if (key === 'primarySkillCommunityId' && typeof val === 'number') {
            display = skillCommunityName(skillCommunities, val);
          } else {
            display = String(val);
          }
          return (
            <div key={key} className="border-b border-border/50 pb-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {USER_FIELD_LABELS[key]}
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
            const communityName = skillCommunityName(skillCommunities, skill.skillCommunityId);
            return (
              <div key={i} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                {communityName} · {skill.proficiencyLevel} ·{' '}
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

function StepContent({
  stepId,
  onToast,
  pendingUploads,
}: {
  stepId: WizardStepId;
  onToast?: (msg: string) => void;
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
}) {
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
      return <DocumentsStep onToast={onToast} pendingUploads={pendingUploads} />;
    case 'review':
      return <ReviewStep />;
    default:
      return null;
  }
}

export function CandidateWizard({ onSubmit, onCancel, onToast }: CandidateWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const pendingUploads = useRef<CandidateWizardUploads>({});
  const currentStep = WIZARD_STEPS[stepIndex]!;
  const {
    data: skillCommunities = [],
    isLoading: skillCommunitiesLoading,
    isError: skillCommunitiesError,
  } = useSkillCommunitiesList();

  const methods = useForm<CandidateWizardFormValues>({
    resolver: zodResolver(candidateWizardFormSchema) as Resolver<CandidateWizardFormValues>,
    defaultValues: candidateWizardDefaults,
    mode: 'onBlur',
  });

  const { handleSubmit, trigger, getValues, reset, setValue } = methods;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CandidateWizardFormValues;
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
      `${first} is a strong ${headline} with verified skills and enterprise-ready experience. Recommended for client shortlists after evaluation.`,
    );
    onToast('AI screening complete — summary pre-filled (demo)');
  }, [getValues, setValue, onToast]);

  async function goNext() {
    const fields = [...currentStep.fields] as FieldPath<CandidateWizardFormValues>[];
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

  if (skillCommunitiesLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading skill communities…
      </div>
    );
  }

  if (skillCommunitiesError || skillCommunities.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
        <p className="font-medium">Skill communities are not available.</p>
        <p className="mt-2">
          Ask an admin to seed skill communities, or run{' '}
          <code className="rounded bg-white/80 px-1 py-0.5">npm run db:seed</code> in{' '}
          <code className="rounded bg-white/80 px-1 py-0.5">apps/api</code>.
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onCancel}>
          Back to candidates
        </Button>
      </div>
    );
  }

  return (
    <SkillCommunitiesContext.Provider value={skillCommunities}>
      <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((formValues) => {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          void onSubmit(buildCandidatePayload(formValues), { ...pendingUploads.current });
          pendingUploads.current = {};
        })}
      >
        <StepIndicator currentStep={stepIndex} />

        <div className="mb-6">
          <h2 className="text-lg font-semibold">{currentStep.label}</h2>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </div>

        <div className="min-h-[320px] rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/10 p-6">
          <StepContent stepId={currentStep.id} onToast={onToast} pendingUploads={pendingUploads} />
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
                Create Candidate
              </Button>
            )}
          </div>
        </div>
      </form>
      </FormProvider>
    </SkillCommunitiesContext.Provider>
  );
}
