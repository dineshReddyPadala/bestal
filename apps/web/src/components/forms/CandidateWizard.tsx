import {
  CANDIDATE_AVAILABILITY_LABELS,
  CANDIDATE_AVAILABILITY_STATUSES,
  CANDIDATE_PROFILE_STATUS_LABELS,
  CANDIDATE_VISIBILITY_LABELS,
  CANDIDATE_VISIBILITY_STATUSES,
  EVALUATION_RECOMMENDATIONS,
  EVALUATION_TYPES,
  cn,
} from '@bestal/shared-utils';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
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
  useWatch,
  type Resolver,
} from 'react-hook-form';
import { useSkillCommunitiesList } from '../../hooks/api/useSkillCommunities';
import { usePermissions } from '../../hooks/usePermissions';
import { applyResumeExtractionToWizardForm } from '../../lib/api/ai/resume-extraction.mapper';
import { mapEvaluationExtractionToForm } from '../../lib/api/ai/evaluation-extraction.mapper';
import { candidatesApi } from '../../lib/api/candidates';
import { evaluationsApi } from '../../lib/api/evaluations';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { SkillCommunityListItem } from '../../lib/api/types';
import { getBgvChecksForType } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';
import {
  buildCandidatePayload,
  canSubmitCandidateForApproval,
  candidateWizardDefaults,
  candidateWizardFormSchema,
  candidateWizardSaveSchema,
  candidateWizardSubmitSchema,
  DRAFT_STORAGE_KEY,
  getInitialTabForEntryMethod,
  WIZARD_TABS,
  type CandidateEntryMethod,
  type CandidateWizardFormValues,
  type CandidateWizardUploads,
  type CandidateWizardValues,
  type WizardTabId,
} from './candidate-wizard-schema';

type CandidateWizardProps = {
  entryMethod: CandidateEntryMethod;
  initialTab?: WizardTabId;
  initialFormValues?: Partial<CandidateWizardFormValues>;
  initialUploads?: CandidateWizardUploads;
  draftCandidateId?: number | null;
  onDraftCandidateId?: (id: number) => void;
  onSaveDraft: (
    values: CandidateWizardValues,
    uploads: CandidateWizardUploads,
    options?: { silent?: boolean },
  ) => boolean | Promise<boolean>;
  onSubmitForApproval: (
    values: CandidateWizardValues,
    uploads: CandidateWizardUploads,
  ) => void | Promise<void>;
  onCancel: () => void;
  onChangeEntryMethod?: () => void;
  onToast: (message: string) => void;
  submitError?: string | null;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
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
  hint,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && ' *'}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/80 bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: WizardTabId;
  onChange: (tab: WizardTabId) => void;
}) {
  return (
    <div className="mb-3 overflow-x-auto">
      <div className="inline-flex min-w-full flex-wrap gap-1 rounded-lg bg-muted p-1 text-muted-foreground sm:min-w-0">
        {WIZARD_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function preferNonEmpty(
  mapped: string | null | undefined,
  existing: string | null | undefined,
): string {
  const next = mapped?.trim() ?? '';
  if (next) return next;
  return existing?.trim() ?? '';
}

function BasicDetailsTab({
  pendingUploads,
  draftCandidateId,
  onAiScreeningComplete,
  onToast,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onAiScreeningComplete: (draftId: number, values: Partial<CandidateWizardFormValues>) => void;
  onToast: (message: string) => void;
}) {
  const {
    register,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useFormContext<CandidateWizardFormValues>();
  const skillCommunities = useSkillCommunityOptions();
  const resumeFileName = watch('resumeFileName');
  const profileStatus = watch('profileStatus');
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleResumeSelect(file: File) {
    pendingUploads.current.resume = file;
    setValue('resumeFileName', file.name, { shouldDirty: true, shouldValidate: true });
    setError(null);
    onToast(`Resume "${file.name}" ready — click Run AI Screening`);
  }

  async function runAiScreening() {
    const file = pendingUploads.current.resume;
    if (!file) {
      setError('Upload a resume first.');
      return;
    }
    if (skillCommunities.length === 0) {
      setError('Skill communities are not available. Run database seed first.');
      return;
    }

    setScreening(true);
    setError(null);
    try {
      const current = getValues();
      const { candidate, extraction } = await candidatesApi.extractResume(
        file,
        draftCandidateId ?? undefined,
      );
      const mapped = applyResumeExtractionToWizardForm(extraction, skillCommunities, file.name);
      const next: CandidateWizardFormValues = {
        ...candidateWizardDefaults,
        ...current,
        ...mapped,
        firstName: preferNonEmpty(mapped.firstName, current.firstName),
        lastName: preferNonEmpty(mapped.lastName, current.lastName),
        email: preferNonEmpty(mapped.email, current.email),
        phone: preferNonEmpty(mapped.phone, current.phone),
        location: preferNonEmpty(mapped.location, current.location),
        source: current.source || mapped.source || candidateWizardDefaults.source,
        resumeFileName: file.name,
      };
      reset(next);
      onAiScreeningComplete(candidate.id, mapped);
      onToast(
        draftCandidateId
          ? 'AI screening complete — existing candidate updated'
          : 'AI screening complete — profile fields populated',
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'AI screening failed'));
    } finally {
      setScreening(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Basic Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First Name" name="firstName" required>
            <Input id="firstName" {...register('firstName')} placeholder="Priya" />
            <FieldError message={errors.firstName?.message} />
          </FormField>
          <FormField label="Last Name" name="lastName" required>
            <Input id="lastName" {...register('lastName')} placeholder="Sharma" />
            <FieldError message={errors.lastName?.message} />
          </FormField>
          <FormField label="Email" name="email" required>
            <Input id="email" type="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </FormField>
          <FormField label="Phone" name="phone">
            <Input id="phone" {...register('phone')} placeholder="+91 98765 43210" />
          </FormField>
          <FormField label="Location" name="location">
            <Input id="location" {...register('location')} placeholder="Hyderabad, India" />
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
        </div>
      </SectionCard>

      <SectionCard title="Resume & AI Screening">
        <div className="space-y-4">
          <FileUpload
            label="Drag & Drop Resume"
            accept=".pdf,.doc,.docx"
            hint="PDF or DOCX — upload, then run AI to extract and prefill candidate details"
            onFileSelect={handleResumeSelect}
          />
          {resumeFileName ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-success/10 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Resume Uploaded — {resumeFileName}</span>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!resumeFileName || screening}
            onClick={() => void runAiScreening()}
          >
            {screening ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Running AI Screening…
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Run AI Screening
              </>
            )}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function ProfessionalDetailsTab() {
  const { register } = useFormContext<CandidateWizardFormValues>();

  return (
    <div className="space-y-4">
      <SectionCard title="Professional Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Current Role" name="primaryRole">
            <Input id="primaryRole" {...register('primaryRole')} placeholder="Senior Data Engineer" />
          </FormField>
          <FormField label="Current Company" name="currentCompany">
            <Input id="currentCompany" {...register('currentCompany')} />
          </FormField>
          <FormField label="Years Experience" name="yearsExperience">
            <Input
              id="yearsExperience"
              type="number"
              min={0}
              {...register('yearsExperience', { valueAsNumber: true })}
              placeholder="Years"
            />
          </FormField>
          <FormField label="Skill Community" name="primarySkillCommunityId">
            <Select
              id="primarySkillCommunityId"
              {...register('primarySkillCommunityId', { valueAsNumber: true })}
            >
              <SkillCommunitySelectOptions />
            </Select>
          </FormField>
          <FormField label="Display Name" name="displayName" hint="Shown to clients">
            <Input id="displayName" {...register('displayName')} placeholder="Priya S." />
          </FormField>
          <FormField label="Headline" name="headline">
            <Input id="headline" {...register('headline')} />
          </FormField>
          <FormField label="Education" name="education">
            <Input id="education" {...register('education')} />
          </FormField>
          <FormField label="Timezone" name="timezone">
            <Select id="timezone" {...register('timezone')}>
              <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
              <option value="America/New_York">EST (America/New_York)</option>
              <option value="America/Chicago">CST (America/Chicago)</option>
              <option value="America/Los_Angeles">PST (America/Los_Angeles)</option>
              <option value="Europe/London">GMT (Europe/London)</option>
              <option value="UTC">UTC</option>
            </Select>
          </FormField>
          <FormField label="LinkedIn" name="linkedinUrl">
            <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
          </FormField>
          <FormField label="GitHub" name="githubUrl">
            <Input id="githubUrl" {...register('githubUrl')} placeholder="https://github.com/..." />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="AI Profile (editable)">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="BesTal Score" name="bestalScore">
            <Input
              id="bestalScore"
              type="number"
              min={0}
              max={100}
              {...register('bestalScore', { valueAsNumber: true })}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="AI Summary" name="aiSummary">
              <textarea id="aiSummary" rows={5} className={textareaClass} {...register('aiSummary')} />
            </FormField>
          </div>
          <FormField label="Strengths" name="strengths">
            <textarea id="strengths" rows={3} className={textareaClass} {...register('strengths')} />
          </FormField>
          <FormField label="Weaknesses" name="weaknesses">
            <textarea id="weaknesses" rows={3} className={textareaClass} {...register('weaknesses')} />
          </FormField>
        </div>
      </SectionCard>
    </div>
  );
}

function SkillsTab() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateWizardFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });
  const skillCommunities = useSkillCommunityOptions();
  const defaultSkillCommunityId = skillCommunities[0]?.id;

  return (
    <SectionCard title="Skills">
      <p className="mb-4 text-sm text-muted-foreground">
        Add skill communities with proficiency level and years of experience.
      </p>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-border/80 bg-muted/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Skill #{index + 1}</p>
              {fields.length > 0 && (
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
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand"
                    {...register(`skills.${index}.isPrimary`)}
                  />
                  Mark as primary skill
                </label>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Notes / Skill name" name={`skills.${index}.notes`}>
                  <textarea
                    rows={2}
                    className={textareaClass}
                    {...register(`skills.${index}.notes`)}
                    placeholder="e.g. Snowflake, dbt"
                  />
                </FormField>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!defaultSkillCommunityId}
          onClick={() =>
            append({
              skillCommunityId: Number(defaultSkillCommunityId),
              proficiencyLevel: 'INTERMEDIATE',
              yearsExperience: undefined,
              isPrimary: fields.length === 0,
              notes: '',
            })
          }
        >
          Add skill
        </Button>
        {errors.skills ? <FieldError message="Check skill entries for errors" /> : null}
      </div>
    </SectionCard>
  );
}

function AvailabilityTab() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CandidateWizardFormValues>();

  return (
    <SectionCard title="Availability">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Availability" name="availabilityStatus">
          <Select id="availabilityStatus" {...register('availabilityStatus')}>
            {CANDIDATE_AVAILABILITY_STATUSES.map((value) => (
              <option key={value} value={value}>
                {CANDIDATE_AVAILABILITY_LABELS[value]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Available From" name="availableFrom" required>
          <Input id="availableFrom" type="date" {...register('availableFrom')} />
          <FieldError message={errors.availableFrom?.message} />
        </FormField>
        <FormField label="Notice Period (days)" name="noticePeriodDays">
          <Input
            id="noticePeriodDays"
            type="number"
            min={0}
            {...register('noticePeriodDays', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Preferred Engagement" name="preferredEngagement">
          <Select id="preferredEngagement" {...register('preferredEngagement')}>
            <option value="">— Select —</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="CONTRACT">Contract</option>
            <option value="FREELANCE">Freelance</option>
          </Select>
        </FormField>
        <FormField label="Hours Per Week" name="hoursPerWeek">
          <Input
            id="hoursPerWeek"
            type="number"
            min={0}
            {...register('hoursPerWeek', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Preferred Shift" name="preferredShift">
          <Input id="preferredShift" {...register('preferredShift')} placeholder="e.g. IST mornings" />
        </FormField>
        <FormField label="Min Hours / Week" name="minHoursPerWeek">
          <Input
            id="minHoursPerWeek"
            type="number"
            min={0}
            {...register('minHoursPerWeek', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Max Hours / Week" name="maxHoursPerWeek">
          <Input
            id="maxHoursPerWeek"
            type="number"
            min={0}
            {...register('maxHoursPerWeek', { valueAsNumber: true })}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Availability Notes" name="availabilityNotes">
            <textarea
              id="availabilityNotes"
              rows={4}
              className={textareaClass}
              {...register('availabilityNotes')}
            />
          </FormField>
        </div>
      </div>
    </SectionCard>
  );
}

function PricingTab() {
  const { register, watch } = useFormContext<CandidateWizardFormValues>();
  const { canViewPayRate } = usePermissions();
  const payRate = watch('payRate');
  const billRate = watch('billRate');
  const margin =
    typeof payRate === 'number' &&
    typeof billRate === 'number' &&
    !Number.isNaN(payRate) &&
    !Number.isNaN(billRate)
      ? billRate - payRate
      : null;

  return (
    <SectionCard title="Pricing (Internal Only)">
      <div className="grid gap-4 sm:grid-cols-2">
        {canViewPayRate && (
          <FormField label="Candidate Pay Rate ($/hr)" name="payRate">
            <Input
              id="payRate"
              type="number"
              min={0}
              step={0.01}
              {...register('payRate', { valueAsNumber: true })}
            />
          </FormField>
        )}
        <FormField label="Client Bill Rate ($/hr)" name="billRate">
          <Input
            id="billRate"
            type="number"
            min={0}
            step={0.01}
            {...register('billRate', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Margin" name="margin" hint="Auto calculated">
          <Input id="margin" readOnly value={margin == null ? '' : `${margin}/hr`} placeholder="—" />
        </FormField>
        <FormField label="Currency" name="currency">
          <Input id="currency" maxLength={3} {...register('currency')} />
        </FormField>
        <FormField label="Expected Rate" name="expectedRate">
          <Input
            id="expectedRate"
            type="number"
            min={0}
            step={0.01}
            {...register('expectedRate', { valueAsNumber: true })}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Pricing Notes" name="pricingNotes">
            <textarea id="pricingNotes" rows={3} className={textareaClass} {...register('pricingNotes')} />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-brand" {...register('trialEligible')} />
            Trial Eligible
          </label>
        </div>
      </div>
    </SectionCard>
  );
}

function EvaluationTab({
  pendingUploads,
  draftCandidateId,
  onToast,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onToast: (message: string) => void;
}) {
  const { register, setValue, watch } = useFormContext<CandidateWizardFormValues>();
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const evaluationFileName = watch('evaluationFileName');

  function handleEvaluationSelect(file: File) {
    pendingUploads.current.evaluationFile = file;
    setValue('evaluationFileName', file.name, { shouldDirty: true });
    setError(null);
    onToast(`Evaluation "${file.name}" ready — click Run AI Screening`);
  }

  async function runEvaluationAiScreening() {
    const file = pendingUploads.current.evaluationFile;
    if (!file) {
      setError('Upload an evaluation document first.');
      return;
    }

    setExtracting(true);
    setError(null);
    try {
      const { extraction, liveAi } = await evaluationsApi.extractEvaluation(
        file,
        draftCandidateId ?? undefined,
      );
      const patch = mapEvaluationExtractionToForm(extraction, file.name);
      if (!patch.aiEvaluationSummary?.trim()) {
        throw new Error('AI did not return an evaluation summary for this document.');
      }

      if (patch.evaluatorName) {
        setValue('evaluatorName', patch.evaluatorName, { shouldDirty: true });
      }
      if (patch.evaluatorCompany) {
        setValue('evaluatorCompany', patch.evaluatorCompany, { shouldDirty: true });
      }
      if (patch.evaluationType) {
        setValue('evaluationType', patch.evaluationType, { shouldDirty: true });
      }
      if (patch.evaluationDate) {
        setValue('evaluationDate', patch.evaluationDate, { shouldDirty: true });
      }
      if (patch.recommendation) {
        setValue('evaluationRecommendation', patch.recommendation, { shouldDirty: true });
      }
      if (patch.technicalScore != null) {
        setValue('technicalScore', patch.technicalScore, { shouldDirty: true });
      }
      if (patch.communicationScore != null) {
        setValue('communicationScore', patch.communicationScore, { shouldDirty: true });
      }
      if (patch.problemSolvingScore != null) {
        setValue('problemSolvingScore', patch.problemSolvingScore, { shouldDirty: true });
      }
      if (patch.architectureScore != null) {
        setValue('architectureScore', patch.architectureScore, { shouldDirty: true });
      }
      if (patch.clientReadinessScore != null) {
        setValue('clientReadinessScore', patch.clientReadinessScore, { shouldDirty: true });
      }
      if (patch.evaluatorComments) {
        setValue('evaluatorComments', patch.evaluatorComments, { shouldDirty: true });
      }
      setValue('aiEvaluationSummary', patch.aiEvaluationSummary, { shouldDirty: true });
      setValue('evaluationFileName', file.name, { shouldDirty: true });

      const confidence = Math.round(extraction.confidence * 100);
      const modeNote = liveAi ? '' : ' (demo/static AI)';
      onToast(
        `Evaluation AI screening complete (${confidence}% confidence)${modeNote} — review fields before saving`,
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Evaluation AI screening failed'));
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Evaluation document">
        <div className="space-y-4">
          <FileUpload
            label="Upload evaluation PDF"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hint={
              extracting
                ? 'Uploading & extracting via BesTal API…'
                : 'PDF or Word — upload, then run AI to prefill scores and summary'
            }
            onFileSelect={(file) => {
              if (!extracting) handleEvaluationSelect(file);
            }}
          />
          {evaluationFileName ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-success/10 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Evaluation Uploaded — {evaluationFileName}</span>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!evaluationFileName || extracting}
            onClick={() => void runEvaluationAiScreening()}
          >
            {extracting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Running AI Screening…
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Run AI Screening
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Evaluator details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Evaluator name" name="evaluatorName" required>
            <Input
              id="evaluatorName"
              {...register('evaluatorName')}
              placeholder="External evaluator name"
            />
          </FormField>
          <FormField label="Evaluator company" name="evaluatorCompany">
            <Input id="evaluatorCompany" {...register('evaluatorCompany')} />
          </FormField>
          <FormField label="Evaluation type" name="evaluationType">
            <Select id="evaluationType" {...register('evaluationType')}>
              <option value="">— Select —</option>
              {EVALUATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Evaluation date" name="evaluationDate">
            <Input id="evaluationDate" type="date" {...register('evaluationDate')} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Recommendation" name="evaluationRecommendation">
              <Select id="evaluationRecommendation" {...register('evaluationRecommendation')}>
                <option value="">— Select —</option>
                {EVALUATION_RECOMMENDATIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Scores">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Technical score" name="technicalScore">
            <Input
              id="technicalScore"
              type="number"
              min={0}
              max={100}
              {...register('technicalScore', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Communication score" name="communicationScore">
            <Input
              id="communicationScore"
              type="number"
              min={0}
              max={100}
              {...register('communicationScore', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Problem solving score" name="problemSolvingScore">
            <Input
              id="problemSolvingScore"
              type="number"
              min={0}
              max={100}
              {...register('problemSolvingScore', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Architecture score" name="architectureScore">
            <Input
              id="architectureScore"
              type="number"
              min={0}
              max={100}
              {...register('architectureScore', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Client readiness score" name="clientReadinessScore">
            <Input
              id="clientReadinessScore"
              type="number"
              min={0}
              max={100}
              {...register('clientReadinessScore', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Comments & summary">
        <div className="space-y-4">
          <FormField label="Evaluator comments" name="evaluatorComments">
            <textarea
              id="evaluatorComments"
              rows={3}
              className={textareaClass}
              {...register('evaluatorComments')}
            />
          </FormField>
          <FormField label="AI evaluation summary" name="aiEvaluationSummary">
            <textarea
              id="aiEvaluationSummary"
              rows={3}
              className={textareaClass}
              {...register('aiEvaluationSummary')}
            />
          </FormField>
        </div>
      </SectionCard>
    </div>
  );
}

function BackgroundCheckTab({
  pendingUploads,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
}) {
  const { register, setValue, watch } = useFormContext<CandidateWizardFormValues>();
  const checkType = watch('bgvCheckType');

  useEffect(() => {
    if (!checkType) return;
    const checks = getBgvChecksForType(checkType);
    setValue('bgvEmployment', checks.employment);
    setValue('bgvEducation', checks.education);
    setValue('bgvReference', checks.reference);
    setValue('bgvAddress', checks.address);
    setValue('bgvCriminal', checks.criminal);
  }, [checkType, setValue]);

  return (
    <div className="space-y-4">
      <SectionCard title="Background Verification details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" name="bgvStatus">
            <Select id="bgvStatus" {...register('bgvStatus')}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLEAR">Completed ✓</option>
              <option value="FAILED">Failed</option>
            </Select>
          </FormField>
          <FormField label="Vendor" name="bgvVendor">
            <Input id="bgvVendor" {...register('bgvVendor')} placeholder="e.g. Checkr, Sterling" />
          </FormField>
          <FormField label="Requested by" name="bgvRequestedByName">
            <Input
              id="bgvRequestedByName"
              {...register('bgvRequestedByName')}
              placeholder="Requester full name"
            />
          </FormField>
          <FormField label="Package type" name="bgvCheckType">
            <Select id="bgvCheckType" {...register('bgvCheckType')}>
              <option value="COMPREHENSIVE">Comprehensive</option>
              <option value="CRIMINAL">Criminal</option>
              <option value="EMPLOYMENT">Employment</option>
              <option value="EDUCATION">Education</option>
              <option value="REFERENCE">Reference</option>
              <option value="IDENTITY">Identity / address</option>
              <option value="CREDIT">Credit</option>
            </Select>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Checks to run">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              ['bgvEmployment', 'Employment'],
              ['bgvEducation', 'Education'],
              ['bgvReference', 'Reference'],
              ['bgvAddress', 'Address'],
              ['bgvCriminal', 'Criminal'],
            ] as const
          ).map(([name, label]) => (
            <FormField key={name} label={label} name={name}>
              <Select id={name} {...register(name)}>
                <option value="NOT_STARTED">Not requested</option>
                <option value="PENDING">Requested</option>
              </Select>
            </FormField>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notes & documents">
        <div className="space-y-4">
          <FormField label="Notes" name="bgvNotes">
            <textarea id="bgvNotes" rows={3} className={textareaClass} {...register('bgvNotes')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FileUpload
                label="Consent form"
                accept=".pdf,.doc,.docx"
                onFileSelect={(file) => {
                  pendingUploads.current.bgvConsentFile = file;
                  setValue('bgvConsentFileName', file.name, { shouldDirty: true });
                }}
              />
              {watch('bgvConsentFileName') ? (
                <p className="mt-2 text-sm text-success">Selected: {watch('bgvConsentFileName')}</p>
              ) : null}
            </div>
            <div>
              <FileUpload
                label="Report document"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onFileSelect={(file) => {
                  pendingUploads.current.bgvFile = file;
                  setValue('bgvFileName', file.name, { shouldDirty: true });
                }}
              />
              {watch('bgvFileName') ? (
                <p className="mt-2 text-sm text-success">Selected: {watch('bgvFileName')}</p>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function DocumentsTab({ pendingUploads }: { pendingUploads: MutableRefObject<CandidateWizardUploads> }) {
  const { setValue, watch } = useFormContext<CandidateWizardFormValues>();

  return (
    <SectionCard title="Documents">
      <div className="space-y-6">
        {watch('resumeFileName') ? (
          <p className="text-sm text-muted-foreground">Resume on file: {watch('resumeFileName')}</p>
        ) : null}
        <div>
          <FileUpload
            label="Profile Photo"
            accept=".jpg,.jpeg,.png,.webp"
            hint="JPEG or PNG up to 5 MB"
            onFileSelect={(file) => {
              pendingUploads.current.profileImage = file;
              setValue('profileImageFileName', file.name, { shouldDirty: true });
            }}
          />
          {watch('profileImageFileName') ? (
            <p className="mt-2 text-sm text-success">Selected: {watch('profileImageFileName')}</p>
          ) : null}
        </div>
        <div>
          <FileUpload
            label="Intro Video (optional)"
            accept=".mp4,.webm,.mov"
            hint="MP4 or WebM up to 100 MB"
            onFileSelect={(file) => {
              pendingUploads.current.introVideo = file;
              setValue('introVideoFileName', file.name, { shouldDirty: true });
            }}
          />
          {watch('introVideoFileName') ? (
            <p className="mt-2 text-sm text-success">Selected: {watch('introVideoFileName')}</p>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function ReviewTab() {
  const { register, watch } = useFormContext<CandidateWizardFormValues>();
  const values = watch();

  return (
    <div className="space-y-4">
      <SectionCard title="Review Summary">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">
              {[values.firstName, values.lastName].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{values.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium">{values.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="font-medium">{values.location || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Source</dt>
            <dd className="font-medium">{values.source || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{values.primaryRole || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Skills</dt>
            <dd className="font-medium">{values.skills?.length ? `${values.skills.length} skill(s)` : '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Available From</dt>
            <dd className="font-medium">{values.availableFrom || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bill Rate</dt>
            <dd className="font-medium">{values.billRate != null ? `$${values.billRate}/hr` : '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">BesTal Score</dt>
            <dd className="font-medium">{values.bestalScore ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Technical Score</dt>
            <dd className="font-medium">{values.technicalScore ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Recommendation</dt>
            <dd className="font-medium">{values.evaluationRecommendation || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Evaluator</dt>
            <dd className="font-medium">{values.evaluatorName || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">BGV Status</dt>
            <dd className="font-medium">{values.bgvStatus || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">BGV Vendor</dt>
            <dd className="font-medium">{values.bgvVendor || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Resume</dt>
            <dd className="font-medium">{values.resumeFileName || '—'}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Visibility">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Profile Status" name="profileStatus">
            <input type="hidden" {...register('profileStatus')} />
            <div className="flex h-11 items-center rounded-md border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
              {profileStatus
                ? CANDIDATE_PROFILE_STATUS_LABELS[profileStatus]
                : 'Sourced'}
            </div>
          </FormField>
          <FormField label="Visibility" name="visibility">
            <Select id="visibility" {...register('visibility')}>
              {CANDIDATE_VISIBILITY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {CANDIDATE_VISIBILITY_LABELS[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                {...register('publishAfterApproval')}
              />
              Publish to Clients after Approval
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Recruiter Notes" name="recruiterNotes">
          <textarea
            id="recruiterNotes"
            rows={6}
            className={textareaClass}
            {...register('recruiterNotes')}
            placeholder="Internal notes for the hiring team…"
          />
        </FormField>
      </SectionCard>
    </div>
  );
}

function TabContent({
  tabId,
  pendingUploads,
  draftCandidateId,
  onAiScreeningComplete,
  onToast,
}: {
  tabId: WizardTabId;
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onAiScreeningComplete: (draftId: number, values: Partial<CandidateWizardFormValues>) => void;
  onToast: (message: string) => void;
}) {
  switch (tabId) {
    case 'basic':
      return (
        <BasicDetailsTab
          pendingUploads={pendingUploads}
          draftCandidateId={draftCandidateId}
          onAiScreeningComplete={onAiScreeningComplete}
          onToast={onToast}
        />
      );
    case 'professional':
      return <ProfessionalDetailsTab />;
    case 'skills':
      return <SkillsTab />;
    case 'availability':
      return <AvailabilityTab />;
    case 'pricing':
      return <PricingTab />;
    case 'evaluation':
      return (
        <EvaluationTab
          pendingUploads={pendingUploads}
          draftCandidateId={draftCandidateId}
          onToast={onToast}
        />
      );    case 'background-check':
      return <BackgroundCheckTab pendingUploads={pendingUploads} />;
    case 'documents':
      return <DocumentsTab pendingUploads={pendingUploads} />;
    case 'review':
      return <ReviewTab />;
    default:
      return null;
  }
}

export function CandidateWizard({
  entryMethod,
  initialTab,
  initialFormValues,
  initialUploads,
  draftCandidateId,
  onDraftCandidateId,
  onSaveDraft,
  onSubmitForApproval,
  onCancel,
  onChangeEntryMethod,
  onToast,
  submitError,
  isSavingDraft = false,
  isSubmitting = false,
}: CandidateWizardProps) {
  const [activeTab, setActiveTab] = useState<WizardTabId>(
    initialTab ?? getInitialTabForEntryMethod(entryMethod),
  );
  const pendingUploads = useRef<CandidateWizardUploads>(initialUploads ?? {});
  const {
    data: skillCommunities = [],
    isLoading: skillCommunitiesLoading,
    isError: skillCommunitiesError,
  } = useSkillCommunitiesList();

  const methods = useForm<CandidateWizardFormValues>({
    resolver: zodResolver(candidateWizardFormSchema) as Resolver<CandidateWizardFormValues>,
    defaultValues: {
      ...candidateWizardDefaults,
      ...initialFormValues,
    },
    mode: 'onBlur',
  });

  const { handleSubmit, getValues, reset, setValue } = methods;
  const watchedValues = useWatch({ control: methods.control }) as CandidateWizardFormValues;

  useEffect(() => {
    if (initialFormValues) {
      reset({ ...candidateWizardDefaults, ...initialFormValues });
      pendingUploads.current = initialUploads ?? {};
      return;
    }

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CandidateWizardFormValues;
        reset({ ...candidateWizardDefaults, ...parsed });
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [initialFormValues, initialUploads, reset]);

  const currentTab = WIZARD_TABS.find((tab) => tab.id === activeTab) ?? WIZARD_TABS[0]!;
  const currentTabIndex = WIZARD_TABS.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex <= 0;
  const isLastTab = currentTabIndex >= WIZARD_TABS.length - 1;
  const formValues = watchedValues ?? getValues();
  const submitReady = canSubmitCandidateForApproval(formValues);

  const handleAiScreeningComplete = useCallback(
    (draftId: number, mapped: Partial<CandidateWizardFormValues>) => {
      onDraftCandidateId?.(draftId);
      if (mapped.profileStatus == null) {
        setValue('profileStatus', 'AI_SCREENED');
      }
      setActiveTab('professional');
    },
    [onDraftCandidateId, setValue],
  );

  const persistLocalDraft = useCallback(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(getValues()));
  }, [getValues]);

  async function saveDraft(silent = false): Promise<boolean> {
    const values = getValues();
    const parsed = candidateWizardSaveSchema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      onToast(first?.message ?? 'Enter first name, last name, email, and source before saving');
      setActiveTab('basic');
      return false;
    }
    persistLocalDraft();
    return onSaveDraft(
      buildCandidatePayload(values),
      { ...pendingUploads.current },
      { silent },
    );
  }

  async function goNext() {
    if (isLastTab) return;
    const saved = await saveDraft(true);
    if (!saved) return;
    const next = WIZARD_TABS[currentTabIndex + 1];
    if (next) setActiveTab(next.id);
  }

  function goPrevious() {
    if (isFirstTab) return;
    const prev = WIZARD_TABS[currentTabIndex - 1];
    if (prev) setActiveTab(prev.id);
  }

  async function submitForApproval(formValuesToSubmit: CandidateWizardFormValues) {
    if (!canSubmitCandidateForApproval(formValuesToSubmit)) {
      onToast(
        'Complete Basic Details (with AI screening), Skills, Availability, and Pricing before submitting',
      );
      return;
    }
    const parsed = candidateWizardSubmitSchema.safeParse(formValuesToSubmit);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      onToast(first?.message ?? 'Please complete required fields before submitting');
      const field = first?.path[0];
      if (
        field === 'firstName' ||
        field === 'lastName' ||
        field === 'email' ||
        field === 'source'
      ) {
        setActiveTab('basic');
      } else if (field === 'skills' || field === 'primarySkillCommunityId') {
        setActiveTab('skills');
      } else if (field === 'availableFrom') {
        setActiveTab('availability');
      } else if (field === 'billRate') {
        setActiveTab('pricing');
      }
      return;
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    await onSubmitForApproval(buildCandidatePayload(parsed.data), { ...pendingUploads.current });
  }

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
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit((values) => {
            void submitForApproval(values);
          })}
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            <div>
              <h2 className="text-base font-semibold">{currentTab.label}</h2>
              <p className="text-sm text-muted-foreground">{currentTab.description}</p>
              {draftCandidateId ? (
                <p className="mt-1 text-xs text-muted-foreground">Draft candidate #{draftCandidateId}</p>
              ) : null}
            </div>

            <div>
            <TabContent
              tabId={activeTab}
              pendingUploads={pendingUploads}
              draftCandidateId={draftCandidateId}
              onAiScreeningComplete={handleAiScreeningComplete}
              onToast={onToast}
            />
            </div>

            {submitError ? (
              <div
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {submitError}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-border bg-background pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {onChangeEntryMethod && (
                  <Button type="button" variant="ghost" size="sm" onClick={onChangeEntryMethod}>
                    Change method
                  </Button>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!isFirstTab ? (
                  <Button type="button" variant="outline" size="sm" onClick={goPrevious}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingDraft || isSubmitting}
                  onClick={() => void saveDraft()}
                >
                  {isSavingDraft ? 'Saving…' : 'Save Draft'}
                </Button>
                {!isLastTab ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isSavingDraft || isSubmitting}
                    onClick={() => void goNext()}
                  >
                    {isSavingDraft ? (
                      'Saving…'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!submitReady || isSavingDraft || isSubmitting}
                    title={
                      submitReady
                        ? undefined
                        : 'Complete Basic Details (with AI screening), Skills, Availability, and Pricing first'
                    }
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit for Approval'}
                  </Button>
                )}
              </div>
            </div>
            {isLastTab && !submitReady ? (
              <p className="mt-2 text-right text-xs text-muted-foreground">
                Submit unlocks after Basic Details (with AI screening), Skills, Availability, and Pricing
                are complete.
              </p>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </SkillCommunitiesContext.Provider>
  );
}
