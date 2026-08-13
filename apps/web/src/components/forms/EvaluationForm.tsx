import { candidates } from '@bestal/mock-data';
import {
  EVALUATION_RECOMMENDATIONS,
  EVALUATION_TYPES,
  type EvaluationTypeValue,
} from '@bestal/shared-utils';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { EvaluationFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const optionalScore = z.preprocess(
  (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)),
  z.number().min(0).max(100).optional(),
);

const evaluationFormSchema = z.object({
  candidateName: z.string().min(1, 'Select a candidate'),
  evaluatorName: z.string().min(1, 'Enter evaluator name').max(100),
  evaluatorCompany: z.string().max(255).optional(),
  evaluationType: z.enum(EVALUATION_TYPES),
  evaluatedDate: z.string().min(1, 'Date is required'),
  technicalScore: optionalScore,
  communicationScore: optionalScore,
  architectureScore: optionalScore,
  problemSolvingScore: optionalScore,
  clientReadinessScore: optionalScore,
  reliabilityScore: optionalScore,
  recommendation: z.enum(EVALUATION_RECOMMENDATIONS).optional(),
  evaluatorComments: z.string().max(5000).optional(),
  aiEvaluationSummary: z.string().max(5000).optional(),
  recordingFileName: z.string().optional(),
  pdfFileName: z.string().optional(),
});

type EvaluationFormProps = {
  defaultValues?: Partial<EvaluationFormValues>;
  onSubmit: (values: EvaluationFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  uploadOnly?: boolean;
  showActions?: boolean;
};

export function EvaluationForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save evaluation',
  formId = 'evaluation-form',
  uploadOnly = false,
  showActions = true,
}: EvaluationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema) as Resolver<EvaluationFormValues>,
    defaultValues: {
      evaluationType: 'Coding Test' satisfies EvaluationTypeValue,
      evaluatorName: '',
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {!uploadOnly && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate *</Label>
              <Select id="candidateName" {...register('candidateName')}>
                <option value="">— Select —</option>
                {candidates.map((c) => {
                  const name = `${c.firstName} ${c.lastName}`;
                  return (
                    <option key={c.id} value={name}>
                      {name}
                    </option>
                  );
                })}
              </Select>
              {errors.candidateName && (
                <p className="text-xs text-red-600">{errors.candidateName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluatorName">Evaluator *</Label>
              <Input
                id="evaluatorName"
                {...register('evaluatorName')}
                placeholder="Evaluator full name"
              />
              {errors.evaluatorName && (
                <p className="text-xs text-red-600">{errors.evaluatorName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluatorCompany">Evaluator company</Label>
              <Input
                id="evaluatorCompany"
                {...register('evaluatorCompany')}
                placeholder="Company or organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluationType">Evaluation type *</Label>
              <Select id="evaluationType" {...register('evaluationType')}>
                {EVALUATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluatedDate">Evaluation date *</Label>
              <Input id="evaluatedDate" type="date" {...register('evaluatedDate')} />
              {errors.evaluatedDate && (
                <p className="text-xs text-red-600">{errors.evaluatedDate.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="recommendation">Recommendation</Label>
              <Select id="recommendation" {...register('recommendation')}>
                <option value="">— Not set —</option>
                {EVALUATION_RECOMMENDATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="technicalScore">Technical</Label>
              <Input
                id="technicalScore"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                {...register('technicalScore', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communicationScore">Communication</Label>
              <Input
                id="communicationScore"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                {...register('communicationScore', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="architectureScore">Architecture</Label>
              <Input
                id="architectureScore"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                {...register('architectureScore', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemSolvingScore">Problem solving</Label>
              <Input
                id="problemSolvingScore"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                {...register('problemSolvingScore', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientReadinessScore">Client readiness</Label>
              <Input
                id="clientReadinessScore"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                {...register('clientReadinessScore', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reliabilityScore">Reliability</Label>
              <Input
                id="reliabilityScore"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                {...register('reliabilityScore', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluatorComments">Evaluator comments</Label>
            <textarea
              id="evaluatorComments"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('evaluatorComments')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiEvaluationSummary">AI evaluation summary</Label>
            <textarea
              id="aiEvaluationSummary"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('aiEvaluationSummary')}
            />
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FileUpload
          label="Evaluation PDF"
          accept=".pdf"
          onFileSelect={(file) => setValue('pdfFileName', file.name, { shouldValidate: true })}
        />
        <FileUpload
          label="Evaluation recording"
          accept=".mp4,.webm,.mov"
          onFileSelect={(file) => setValue('recordingFileName', file.name, { shouldValidate: true })}
        />
      </div>
      {(watch('pdfFileName') || watch('recordingFileName')) && (
        <div className="text-xs text-muted-foreground">
          {watch('pdfFileName') && <span className="block">PDF: {watch('pdfFileName')}</span>}
          {watch('recordingFileName') && (
            <span className="block">Recording: {watch('recordingFileName')}</span>
          )}
        </div>
      )}

      {showActions && (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      )}
    </form>
  );
}

export { evaluationFormSchema };
