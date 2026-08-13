import {
  BGV_PER_CHECK_STATUS_OPTIONS,
  CANDIDATE_AVAILABILITY_LABELS,
  CANDIDATE_AVAILABILITY_STATUSES,
  CANDIDATE_PROFILE_STATUS_LABELS,
  CANDIDATE_SOURCE_OPTIONS,
  CANDIDATE_VISIBILITY_LABELS,
  CANDIDATE_VISIBILITY_STATUSES,
  EVALUATION_RECOMMENDATIONS,
  EVALUATION_TYPES,
  cn,
  formatBgvStatusLabel,
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
import { AiScreeningStatusBanner } from '../candidates/AiScreeningStatusBanner';
import { useSkillCommunitiesList } from '../../hooks/api/useSkillCommunities';
import { useAiScreeningJob } from '../../hooks/useAiScreeningJob';
import { useBgvAiJob } from '../../hooks/useBgvAiJob';
import { useEvaluationAiJob } from '../../hooks/useEvaluationAiJob';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import { useOrgSettings } from '../../contexts/OrgSettingsContext';
import { applyResumeExtractionToWizardForm } from '../../lib/api/ai/resume-extraction.mapper';
import { TIMEZONE_OPTIONS } from '../../lib/timezones';
import { mapEvaluationExtractionToForm } from '../../lib/api/ai/evaluation-extraction.mapper';
import { mapBgvExtractionToForm } from '../../lib/api/ai/bgv-extraction.mapper';
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
  getCandidateSourceLabel,
  PREFERRED_SHIFT_OPTIONS,
  DRAFT_STORAGE_KEY,
  getInitialTabForEntryMethod,
  validateWizardTabForSave,
  WIZARD_TABS,
  BGV_WIZARD_STATUS_OPTIONS,
  type CandidateEntryMethod,
  type CandidateWizardFormValues,
  type CandidateWizardUploads,
  type CandidateWizardValues,
  type WizardTabId,
} from './candidate-wizard-schema';

export type CandidateWizardMode = 'superAdminCreate' | 'importedEdit';

type CandidateWizardProps = {
  entryMethod: CandidateEntryMethod;
  initialTab?: WizardTabId;
  /** Controls super-admin create vs admin/recruiter imported edit restrictions. */
  wizardMode?: CandidateWizardMode;
  /** When true, do not restore a browser-stored draft (fresh Add Candidate). */
  freshStart?: boolean;
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
  /** When true, the last tab shows Update instead of Submit for Approval. */
  isEditMode?: boolean;
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
  allowAiScreening,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onAiScreeningComplete: (draftId: number, values: Partial<CandidateWizardFormValues>) => void;
  onToast: (message: string) => void;
  allowAiScreening: boolean;
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
  const aiScreening = useAiScreeningJob();
  const [error, setError] = useState<string | null>(null);

  function handleResumeSelect(file: File) {
    pendingUploads.current.resume = file;
    setValue('resumeFileName', file.name, { shouldDirty: true, shouldValidate: true });
    setError(null);
    aiScreening.reset();
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

    setError(null);
    try {
      const current = getValues();
      const result = await aiScreening.runScreening(file, draftCandidateId ?? undefined);
      if (!result) return;

      const { candidate, extraction } = result;
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
        profileStatus:
          (candidate.profileStatus as CandidateWizardFormValues['profileStatus']) ??
          mapped.profileStatus,
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
              {CANDIDATE_SOURCE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {getCandidateSourceLabel(value)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </SectionCard>

      {allowAiScreening ? (
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
            <AiScreeningStatusBanner
              status={aiScreening.status}
              errorMessage={aiScreening.errorMessage ?? error}
              retrying={aiScreening.isRunning}
              onRetry={
                aiScreening.status === 'FAILED' && pendingUploads.current.resume
                  ? () => void runAiScreening()
                  : undefined
              }
            />
            {error && aiScreening.status !== 'FAILED' ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!resumeFileName || aiScreening.isRunning}
              onClick={() => void runAiScreening()}
            >
              {aiScreening.isRunning ? (
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
      ) : resumeFileName ? (
        <SectionCard title="Resume">
          <p className="text-sm text-muted-foreground">Resume on file: {resumeFileName}</p>
        </SectionCard>
      ) : null}
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
              <option value="">— Select —</option>
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
    watch,
    formState: { errors },
  } = useFormContext<CandidateWizardFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });
  const skillCommunities = useSkillCommunityOptions();
  const primarySkillCommunityId = watch('primarySkillCommunityId');
  const defaultSkillCommunityId = primarySkillCommunityId ?? skillCommunities[0]?.id;

  return (
    <SectionCard title="Skills">
      <p className="mb-4 text-sm text-muted-foreground">
        Add individual skills (e.g. React, Node.js). Each skill can belong to a skill community
        such as Full Stack — defaults to the candidate&apos;s primary community when left blank.
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
              <FormField label="Skill name" name={`skills.${index}.skillName`} required>
                <Input
                  {...register(`skills.${index}.skillName`)}
                  placeholder="e.g. React, Node.js"
                />
              </FormField>
              <FormField label="Skill community" name={`skills.${index}.skillCommunityId`}>
                <Select {...register(`skills.${index}.skillCommunityId`)}>
                  <option value="">— Primary community —</option>
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
                <FormField label="Notes" name={`skills.${index}.notes`}>
                  <textarea
                    rows={2}
                    className={textareaClass}
                    {...register(`skills.${index}.notes`)}
                    placeholder="Optional context about this skill"
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
          onClick={() =>
            append({
              skillName: '',
              skillCategory: '',
              skillCommunityId: defaultSkillCommunityId ?? undefined,
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
          <Select id="preferredShift" {...register('preferredShift')}>
            <option value="">— Select —</option>
            {PREFERRED_SHIFT_OPTIONS.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </Select>
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
  const pay = typeof payRate === 'number' && Number.isFinite(payRate) ? payRate : null;
  const bill = typeof billRate === 'number' && Number.isFinite(billRate) ? billRate : null;
  const margin = pay != null && bill != null ? bill - pay : null;

  return (
    <SectionCard title="Pricing (Internal Only)">
      <div className="grid gap-4 sm:grid-cols-3">
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
        <FormField label="Gross Margin ($/hr)" name="margin" hint="Auto calculated">
          <Input
            id="margin"
            readOnly
            value={margin == null ? '' : String(margin)}
            placeholder="—"
          />
        </FormField>
        <FormField label="Expected Rate ($/hr)" name="expectedRate">
          <Input
            id="expectedRate"
            type="number"
            min={0}
            step={0.01}
            {...register('expectedRate', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Currency" name="currency">
          <Input id="currency" maxLength={3} {...register('currency')} />
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
  allowAiAnalysis,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onToast: (message: string) => void;
  allowAiAnalysis: boolean;
}) {
  const { register, setValue, watch } = useFormContext<CandidateWizardFormValues>();
  const [error, setError] = useState<string | null>(null);
  const evaluationAi = useEvaluationAiJob();
  const evaluationFileName = watch('evaluationFileName');
  const extracting = evaluationAi.isRunning;

  function handleEvaluationSelect(file: File) {
    pendingUploads.current.evaluationFile = file;
    setValue('evaluationFileName', file.name, { shouldDirty: true });
    setError(null);
    evaluationAi.reset();
    onToast(`Evaluation "${file.name}" ready — click Run AI Screening`);
  }

  function applyEvaluationPatch(
    extraction: Parameters<typeof mapEvaluationExtractionToForm>[0],
    fileName: string,
    liveAi: boolean,
  ) {
    const patch = mapEvaluationExtractionToForm(extraction, fileName);
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
    setValue('evaluationFileName', fileName, { shouldDirty: true });

    const confidence = Math.round(extraction.confidence * 100);
    const modeNote = liveAi ? '' : ' (demo/static AI)';
    onToast(
      `Evaluation AI screening complete (${confidence}% confidence)${modeNote} — review fields before saving`,
    );
  }

  async function runEvaluationAiScreening() {
    const file = pendingUploads.current.evaluationFile;
    if (!file) {
      setError('Upload an evaluation document first.');
      return;
    }
    if (draftCandidateId == null || draftCandidateId <= 0) {
      setError('Save or create the candidate draft before running evaluation AI.');
      return;
    }

    setError(null);
    try {
      const result = await evaluationAi.runAnalysis(file, draftCandidateId);
      if (!result) return;
      applyEvaluationPatch(result.extraction, file.name, result.liveAi);
    } catch (err) {
      setError(
        evaluationAi.errorMessage ||
          getApiErrorMessage(err, 'Evaluation AI screening failed'),
      );
    }
  }

  return (
    <div className="space-y-4">
      {allowAiAnalysis ? (
        <SectionCard title="Evaluation document">
          <div className="space-y-4">
            <FileUpload
              label="Upload evaluation PDF"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint={
                extracting
                  ? 'Uploading & processing via BesTal API…'
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
            <AiScreeningStatusBanner
              context="evaluation"
              status={evaluationAi.status}
              errorMessage={evaluationAi.errorMessage || error}
              retrying={extracting}
              onRetry={
                evaluationAi.status === 'FAILED'
                  ? () => void runEvaluationAiScreening()
                  : undefined
              }
            />
            {error && evaluationAi.status !== 'FAILED' ? (
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
      ) : (
        <SectionCard title="Evaluation document">
          <p className="text-sm text-muted-foreground">
            Upload the evaluation form or report. Files are stored on the evaluation record without
            AI analysis for imported candidates.
          </p>
          <div className="mt-4 space-y-4">
            <FileUpload
              label="Evaluation form"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint="PDF or Word — stored without AI analysis"
              onFileSelect={(file) => {
                pendingUploads.current.evaluationFile = file;
                setValue('evaluationFileName', file.name, { shouldDirty: true });
              }}
            />
            {evaluationFileName ? (
              <p className="text-sm text-muted-foreground">
                {evaluationFileName.startsWith('http') || evaluationFileName.includes('/')
                  ? `Document on file: ${evaluationFileName.split('/').pop()}`
                  : `Selected: ${evaluationFileName}`}
              </p>
            ) : null}
          </div>
        </SectionCard>
      )}

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

function mapExtractionStatusToWizardBgvStatus(status: string | undefined): string {
  const raw = (status ?? '').trim().toUpperCase().replace(/\s+/g, '_');
  if (raw === 'CLEAR' || raw === 'COMPLETED_CLEAR') return 'CLEAR';
  if (raw === 'FAILED' || raw === 'REJECTED') return 'FAILED';
  if (raw === 'NOT_STARTED') return 'NOT_STARTED';
  return 'IN_PROGRESS';
}

function BackgroundCheckTab({
  pendingUploads,
  draftCandidateId,
  onToast,
  allowAiAnalysis,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onToast: (message: string) => void;
  allowAiAnalysis: boolean;
}) {
  const { register, setValue, watch } = useFormContext<CandidateWizardFormValues>();
  const [error, setError] = useState<string | null>(null);
  const bgvAi = useBgvAiJob();
  const bgvFileName = watch('bgvFileName');
  const aiBgvSummary = watch('aiBgvSummary');
  const extracting = bgvAi.isRunning;
  const checkType = watch('bgvCheckType');

  useEffect(() => {
    if (!allowAiAnalysis) return;
    if (!checkType) return;
    const checks = getBgvChecksForType(checkType);
    setValue('bgvEmployment', checks.employment);
    setValue('bgvEducation', checks.education);
    setValue('bgvReference', checks.reference);
    setValue('bgvAddress', checks.address);
    setValue('bgvCriminal', checks.criminal);
  }, [checkType, setValue, allowAiAnalysis]);

  function handleBgvReportSelect(file: File) {
    pendingUploads.current.bgvFile = file;
    setValue('bgvFileName', file.name, { shouldDirty: true });
    setError(null);
    bgvAi.reset();
    onToast(`BGV report "${file.name}" ready — click Run BGV AI Analysis`);
  }

  function applyBgvPatch(
    extraction: Parameters<typeof mapBgvExtractionToForm>[0],
    fileName: string,
    liveAi: boolean,
    backgroundCheckId?: number,
  ) {
    const patch = mapBgvExtractionToForm(extraction);
    if (!patch.aiBgvSummary?.trim()) {
      throw new Error('AI did not return a background verification summary.');
    }

    if (patch.vendorName) {
      setValue('bgvVendor', patch.vendorName, { shouldDirty: true });
    }
    if (patch.checkType) {
      setValue('bgvCheckType', patch.checkType as CandidateWizardFormValues['bgvCheckType'], {
        shouldDirty: true,
      });
    }
    setValue('aiBgvSummary', patch.aiBgvSummary, { shouldDirty: true });
    if (patch.resultSummary) {
      setValue('bgvResultSummary', patch.resultSummary, { shouldDirty: true });
    }
    if (patch.concernNotes) {
      setValue('bgvConcernNotes', patch.concernNotes, { shouldDirty: true });
      setValue('bgvNotes', patch.concernNotes, { shouldDirty: true });
    }
    setValue('bgvStatus', mapExtractionStatusToWizardBgvStatus(extraction.status), {
      shouldDirty: true,
    });
    setValue('bgvFileName', fileName, { shouldDirty: true });
    if (backgroundCheckId != null && backgroundCheckId > 0) {
      setValue('bgvBackgroundCheckId', backgroundCheckId, { shouldDirty: true });
    }

    const confidence = Math.round(extraction.confidence * 100);
    const modeNote = liveAi ? '' : ' (demo/static AI)';
    onToast(
      `BGV AI analysis complete (${confidence}% confidence)${modeNote} — review fields before submitting`,
    );
  }

  async function runBgvAiAnalysis() {
    const file = pendingUploads.current.bgvFile;
    if (!file) {
      setError('Upload a BGV report first.');
      return;
    }
    if (draftCandidateId == null || draftCandidateId <= 0) {
      setError('Save the candidate draft first (Next on any prior tab), then run BGV AI analysis.');
      return;
    }

    setError(null);
    try {
      const result = await bgvAi.runAnalysis(file, draftCandidateId);
      if (!result) return;
      applyBgvPatch(
        result.extraction,
        file.name,
        result.liveAi,
        result.backgroundCheckId ?? bgvAi.backgroundCheckId ?? undefined,
      );
    } catch (err) {
      setError(bgvAi.errorMessage || getApiErrorMessage(err, 'BGV AI analysis failed'));
    }
  }

  return (
    <div className="space-y-4">
      {allowAiAnalysis ? (
        <>
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p>
                Upload the vendor BGV report and run AI analysis. When n8n is configured, BesTal extracts
                check statuses, updates the BGV record, syncs the candidate badge, and notifies admins.
              </p>
            </div>
          </div>

          <SectionCard title="BGV report & AI analysis">
        <div className="space-y-4">
          <FileUpload
            label="Upload BGV report"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hint={
              extracting
                ? 'Analyzing BGV report via BesTal API…'
                : 'PDF or Word — save draft first, then run AI analysis'
            }
            onFileSelect={(file) => {
              if (!extracting) handleBgvReportSelect(file);
            }}
          />
          {bgvFileName ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-success/10 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>BGV Report — {bgvFileName}</span>
            </div>
          ) : null}
          <AiScreeningStatusBanner
            context="bgv"
            status={bgvAi.status}
            errorMessage={bgvAi.errorMessage || error}
            retrying={extracting}
            onRetry={bgvAi.status === 'FAILED' ? () => void runBgvAiAnalysis() : undefined}
          />
          {error && bgvAi.status !== 'FAILED' ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!bgvFileName || extracting}
            onClick={() => void runBgvAiAnalysis()}
          >
            {extracting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Running BGV AI Analysis…
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Run BGV AI Analysis
              </>
            )}
          </Button>
        </div>
      </SectionCard>
        </>
      ) : (
        <SectionCard title="Background verification documents">
          <p className="text-sm text-muted-foreground">
            Upload consent forms, supporting documents, or the final BGV report. Files are stored on
            the BGV record without AI analysis for imported candidates.
          </p>
          <div className="mt-4 space-y-4">
            <FileUpload
              label="Consent form (optional)"
              accept=".pdf,.doc,.docx"
              hint="PDF or Word"
              onFileSelect={(file) => {
                pendingUploads.current.bgvConsentFile = file;
                setValue('bgvConsentFileName', file.name, { shouldDirty: true });
              }}
            />
            {watch('bgvConsentFileName') ? (
              <p className="text-sm text-muted-foreground">
                Consent selected: {watch('bgvConsentFileName')}
              </p>
            ) : null}
            <FileUpload
              label="Supporting document"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              hint="PDF, Word, or image"
              onFileSelect={(file) => {
                pendingUploads.current.bgvSupportingFile = file;
                setValue('bgvSupportingFileName', file.name, { shouldDirty: true });
              }}
            />
            {watch('bgvSupportingFileName') ? (
              <p className="text-sm text-muted-foreground">
                Supporting doc selected: {watch('bgvSupportingFileName')}
              </p>
            ) : null}
            <FileUpload
              label="BGV report"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint="PDF or Word — stored without AI analysis"
              onFileSelect={(file) => {
                pendingUploads.current.bgvFile = file;
                setValue('bgvFileName', file.name, { shouldDirty: true });
              }}
            />
            {bgvFileName ? (
              <p className="text-sm text-muted-foreground">Report selected: {bgvFileName}</p>
            ) : null}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Background Verification details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" name="bgvStatus">
            <Select id="bgvStatus" {...register('bgvStatus')}>
              {BGV_WIZARD_STATUS_OPTIONS.filter((status) => status !== 'COMPLETED_CLEAR').map(
                (status) => (
                  <option key={status} value={status}>
                    {status === 'CLEAR' ? 'Completed (Clear)' : status.replace(/_/g, ' ')}
                  </option>
                ),
              )}
            </Select>
          </FormField>
          <FormField label="Vendor" name="bgvVendor">
            <Input id="bgvVendor" {...register('bgvVendor')} placeholder="e.g. Checkr, Sterling" />
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
          <FormField label="Initiated date" name="bgvInitiatedDate">
            <Input id="bgvInitiatedDate" type="date" {...register('bgvInitiatedDate')} />
          </FormField>
          <FormField label="Completed date" name="bgvCompletedDate">
            <Input id="bgvCompletedDate" type="date" {...register('bgvCompletedDate')} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Checks to run">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              ['bgvIdCheck', 'Identity'],
              ['bgvEmployment', 'Employment'],
              ['bgvEducation', 'Education'],
              ['bgvReference', 'Reference'],
              ['bgvAddress', 'Address'],
              ['bgvCriminal', 'Criminal'],
            ] as const
          ).map(([name, label]) => (
            <FormField key={name} label={label} name={name}>
              <Select id={name} {...register(name)}>
                {allowAiAnalysis ? (
                  <>
                    <option value="NOT_STARTED">Not requested</option>
                    <option value="PENDING">Requested</option>
                  </>
                ) : (
                  <>
                    {!BGV_PER_CHECK_STATUS_OPTIONS.includes(
                      watch(name) as (typeof BGV_PER_CHECK_STATUS_OPTIONS)[number],
                    ) && watch(name) ? (
                      <option value={watch(name) as string}>
                        {formatBgvStatusLabel(watch(name) as string)}
                      </option>
                    ) : null}
                    {BGV_PER_CHECK_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatBgvStatusLabel(status)}
                      </option>
                    ))}
                  </>
                )}
              </Select>
            </FormField>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="AI results & notes">
        <div className="space-y-4">
          <FormField label="BGV summary" name="bgvResultSummary">
            <textarea
              id="bgvResultSummary"
              rows={3}
              className={textareaClass}
              {...register('bgvResultSummary')}
              placeholder="Overall BGV summary from import or manual entry"
            />
          </FormField>
          <FormField label="AI BGV summary" name="aiBgvSummary">
            <textarea
              id="aiBgvSummary"
              rows={3}
              className={textareaClass}
              {...register('aiBgvSummary')}
              placeholder="Populated after BGV AI analysis"
            />
          </FormField>
          <FormField label="Concern notes" name="bgvConcernNotes">
            <textarea
              id="bgvConcernNotes"
              rows={2}
              className={textareaClass}
              {...register('bgvConcernNotes')}
            />
          </FormField>
          <FormField label="Notes" name="bgvNotes">
            <textarea id="bgvNotes" rows={3} className={textareaClass} {...register('bgvNotes')} />
          </FormField>
          <div>
            <FileUpload
              label="Consent form (optional)"
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
          {aiBgvSummary?.trim() ? (
            <p className="text-xs text-muted-foreground">
              BGV analysis complete — candidate badge will reflect status on save. Admins are notified
              when analysis runs on an existing BGV record.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

function DocumentsTab({
  pendingUploads,
  allowResumeUpload,
}: {
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  allowResumeUpload?: boolean;
}) {
  const { setValue, watch } = useFormContext<CandidateWizardFormValues>();
  const profilePreviewUrl = watch('profileImagePreviewUrl');

  return (
    <SectionCard title="Documents">
      <div className="space-y-6">
        {allowResumeUpload ? (
          <div>
            <FileUpload
              label="Resume"
              accept=".pdf,.doc,.docx"
              hint="PDF or DOCX — stored without AI analysis"
              onFileSelect={(file) => {
                pendingUploads.current.resume = file;
                setValue('resumeFileName', file.name, { shouldDirty: true });
              }}
            />
            {watch('resumeFileName') ? (
              <p className="mt-2 text-sm text-success">Resume: {watch('resumeFileName')}</p>
            ) : null}
          </div>
        ) : watch('resumeFileName') ? (
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
              setValue('profileImagePreviewUrl', URL.createObjectURL(file), { shouldDirty: true });
            }}
          />
          {profilePreviewUrl ? (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={profilePreviewUrl}
                alt="Profile preview"
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
              <p className="text-sm text-success">
                {watch('profileImageFileName') ? `Photo: ${watch('profileImageFileName')}` : 'Photo on file'}
              </p>
            </div>
          ) : watch('profileImageFileName') ? (
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

function ReviewTab({ canEditVisibility }: { canEditVisibility: boolean }) {
  const { register, watch } = useFormContext<CandidateWizardFormValues>();
  const values = watch();
  const profileStatus = values.profileStatus;
  const visibility = values.visibility;
  const currency = values.currency ?? 'USD';

  const summaryFields: Array<{ label: string; value: string }> = [
    { label: 'Name', value: [values.firstName, values.lastName].filter(Boolean).join(' ') || '—' },
    { label: 'Email', value: values.email || '—' },
    { label: 'Phone', value: values.phone || '—' },
    { label: 'Location', value: values.location || '—' },
    { label: 'Source', value: values.source || '—' },
    { label: 'Role', value: values.primaryRole || '—' },
    { label: 'Company', value: values.currentCompany || '—' },
    { label: 'Education', value: values.education || '—' },
    { label: 'Timezone', value: values.timezone || '—' },
    { label: 'Skills', value: values.skills?.length ? `${values.skills.length} skill(s)` : '—' },
    { label: 'Available From', value: values.availableFrom || '—' },
    { label: 'Availability', value: values.availabilityStatus || '—' },
    { label: 'Notice Period', value: values.noticePeriodDays != null ? `${values.noticePeriodDays} days` : '—' },
    { label: 'Preferred Shift', value: values.preferredShift || '—' },
    { label: 'Hours / Week', value: values.hoursPerWeek != null ? String(values.hoursPerWeek) : '—' },
    { label: 'Engagement', value: values.preferredEngagement || '—' },
    {
      label: 'Bill Rate',
      value: values.billRate != null ? `${currency} ${values.billRate}/hr` : '—',
    },
    {
      label: 'Pay Rate',
      value: values.payRate != null ? `${currency} ${values.payRate}/hr` : '—',
    },
    { label: 'BesTal Score', value: values.bestalScore != null ? String(values.bestalScore) : '—' },
    { label: 'Technical Score', value: values.technicalScore != null ? String(values.technicalScore) : '—' },
    { label: 'Communication Score', value: values.communicationScore != null ? String(values.communicationScore) : '—' },
    { label: 'Recommendation', value: values.evaluationRecommendation || '—' },
    { label: 'Evaluator', value: values.evaluatorName || '—' },
    { label: 'BGV Status', value: values.bgvStatus || '—' },
    { label: 'BGV Vendor', value: values.bgvVendor || '—' },
    { label: 'Resume', value: values.resumeFileName || '—' },
    { label: 'Profile Photo', value: values.profileImageFileName || '—' },
  ];

  return (
    <div className="space-y-4">
      {values.rejectionReason ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Returned by admin</p>
          <p className="mt-1">{values.rejectionReason}</p>
        </div>
      ) : null}
      <SectionCard title="Review Summary">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {summaryFields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
          {values.aiBgvSummary?.trim() ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">BGV Summary</dt>
              <dd className="font-medium whitespace-pre-wrap">{values.aiBgvSummary}</dd>
            </div>
          ) : null}
          {values.aiSummary?.trim() ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">AI Summary</dt>
              <dd className="font-medium whitespace-pre-wrap">{values.aiSummary}</dd>
            </div>
          ) : null}
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
            {canEditVisibility ? (
              <Select id="visibility" {...register('visibility')}>
                {CANDIDATE_VISIBILITY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CANDIDATE_VISIBILITY_LABELS[status]}
                  </option>
                ))}
              </Select>
            ) : (
              <>
                <input type="hidden" {...register('visibility')} />
                <div className="flex h-11 items-center rounded-md border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
                  {visibility ? CANDIDATE_VISIBILITY_LABELS[visibility] : 'Internal Only'}
                </div>
              </>
            )}
          </FormField>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                disabled={!canEditVisibility}
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
  allowAiScreening,
  canEditVisibility,
}: {
  tabId: WizardTabId;
  pendingUploads: MutableRefObject<CandidateWizardUploads>;
  draftCandidateId?: number | null;
  onAiScreeningComplete: (draftId: number, values: Partial<CandidateWizardFormValues>) => void;
  onToast: (message: string) => void;
  allowAiScreening: boolean;
  canEditVisibility: boolean;
}) {
  switch (tabId) {
    case 'basic':
      return (
        <BasicDetailsTab
          pendingUploads={pendingUploads}
          draftCandidateId={draftCandidateId}
          onAiScreeningComplete={onAiScreeningComplete}
          onToast={onToast}
          allowAiScreening={allowAiScreening}
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
    case 'documents':
      return (
        <DocumentsTab
          pendingUploads={pendingUploads}
          allowResumeUpload={!allowAiScreening}
        />
      );
    case 'review':
      return <ReviewTab canEditVisibility={canEditVisibility} />;
    case 'evaluation':
      return (
        <EvaluationTab
          pendingUploads={pendingUploads}
          draftCandidateId={draftCandidateId}
          onToast={onToast}
          allowAiAnalysis={allowAiScreening}
        />
      );
    case 'background-check':
      return (
        <BackgroundCheckTab
          pendingUploads={pendingUploads}
          draftCandidateId={draftCandidateId}
          onToast={onToast}
          allowAiAnalysis={allowAiScreening}
        />
      );
    default:
      return null;
  }
}

export function CandidateWizard({
  entryMethod,
  initialTab,
  freshStart = false,
  wizardMode = 'superAdminCreate',
  initialFormValues,
  initialUploads,
  draftCandidateId,
  onDraftCandidateId,
  onSaveDraft,
  onSubmitForApproval,
  isEditMode = false,
  onCancel,
  onChangeEntryMethod,
  onToast,
  submitError,
  isSavingDraft = false,
  isSubmitting = false,
}: CandidateWizardProps) {
  const { canRunAiScreening } = usePermissions();
  const { user } = useAuth();
  const allowAiScreening = wizardMode === 'superAdminCreate' && canRunAiScreening;
  const canEditVisibility = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<WizardTabId>(
    initialTab ?? getInitialTabForEntryMethod(entryMethod),
  );
  const [isPersisting, setIsPersisting] = useState(false);
  const pendingUploads = useRef<CandidateWizardUploads>(initialUploads ?? {});
  const {
    data: skillCommunities = [],
    isLoading: skillCommunitiesLoading,
    isError: skillCommunitiesError,
  } = useSkillCommunitiesList();
  const { settings: orgSettings } = useOrgSettings();

  const methods = useForm<CandidateWizardFormValues>({
    resolver: zodResolver(candidateWizardFormSchema) as Resolver<CandidateWizardFormValues>,
    defaultValues: {
      ...candidateWizardDefaults,
      currency: orgSettings.currency,
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

    if (freshStart) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      reset({ ...candidateWizardDefaults });
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
  }, [freshStart, initialFormValues, initialUploads, reset]);

  const currentTab = WIZARD_TABS.find((tab) => tab.id === activeTab) ?? WIZARD_TABS[0]!;
  const currentTabIndex = WIZARD_TABS.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex <= 0;
  const isLastTab = currentTabIndex >= WIZARD_TABS.length - 1;
  const formValues = watchedValues ?? getValues();
  const submitReady = canSubmitCandidateForApproval(formValues, {
    importedEdit: wizardMode === 'importedEdit',
  });
  const isBusy = isPersisting || isSavingDraft || isSubmitting;

  const handleAiScreeningComplete = useCallback(
    (draftId: number, mapped: Partial<CandidateWizardFormValues>) => {
      onDraftCandidateId?.(draftId);
      if (mapped.profileStatus != null) {
        setValue('profileStatus', mapped.profileStatus);
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
    const tabValidation = validateWizardTabForSave(activeTab, values);
    if (!tabValidation.success) {
      onToast(tabValidation.message);
      return false;
    }
    const parsed = candidateWizardSaveSchema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      onToast(first?.message ?? 'Enter first name, last name, email, and source before saving');
      setActiveTab('basic');
      return false;
    }
    persistLocalDraft();
    setIsPersisting(true);
    try {
      return await onSaveDraft(
        buildCandidatePayload(values),
        { ...pendingUploads.current },
        { silent },
      );
    } finally {
      setIsPersisting(false);
    }
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
    if (
      !canSubmitCandidateForApproval(formValuesToSubmit, {
        importedEdit: wizardMode === 'importedEdit',
      })
    ) {
      onToast(
        'Complete Basic Details (with AI screening), Skills, Availability, Pricing, Evaluation, and Background Verification before submitting',
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
            </div>

            <div>
            <TabContent
              tabId={activeTab}
              pendingUploads={pendingUploads}
              draftCandidateId={draftCandidateId}
              onAiScreeningComplete={handleAiScreeningComplete}
              onToast={onToast}
              allowAiScreening={allowAiScreening}
              canEditVisibility={canEditVisibility}
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={goPrevious}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                ) : null}
                {!isLastTab ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => void goNext()}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : isEditMode ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => void saveDraft()}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      'Update'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!submitReady || isBusy}
                    title={
                      submitReady
                        ? undefined
                        : 'Complete Basic Details (with AI screening), Skills, Availability, Pricing, Evaluation, and Background Verification first'
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit for Approval'
                    )}
                  </Button>
                )}
              </div>
            </div>
            {isLastTab && !submitReady && !isEditMode ? (
              <p className="mt-2 text-right text-xs text-muted-foreground">
                Submit unlocks after Basic Details (with AI screening), Skills, Availability, Pricing,
                Evaluation, and Background Verification are complete.
              </p>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </SkillCommunitiesContext.Provider>
  );
}
