import { candidates, evaluationEvaluators, evaluationRecommendations, evaluationTypes, schemaUsers } from '@bestal/mock-data';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { EvaluationFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';
import { FormSystemNote } from './FormSystemNote';

const optionalScore = z.preprocess(
  (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)),
  z.number().min(0).max(100).optional(),
);

const evaluationFormSchema = z.object({
  candidateName: z.string().min(1, 'Select a candidate'),
  evaluatorName: z.string().min(1, 'Select an evaluator'),
  evaluationType: z.enum(['TECHNICAL', 'BEHAVIORAL', 'ARCHITECTURE', 'FULL_STACK', 'SECURITY']),
  evaluatedDate: z.string().min(1, 'Date is required'),
  technicalScore: optionalScore,
  communicationScore: optionalScore,
  architectureScore: optionalScore,
  problemSolvingScore: optionalScore,
  recommendation: z
    .enum(['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE'])
    .optional(),
  summary: z.string().max(5000).optional(),
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
};

export function EvaluationForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save evaluation',
  formId = 'evaluation-form',
  uploadOnly = false,
}: EvaluationFormProps) {
  const evaluatorOptions = [
    ...new Set([
      ...evaluationEvaluators,
      ...schemaUsers
        .filter((u) => u.role === 'ADMIN' || u.role === 'RECRUITER')
        .map((u) => `${u.firstName} ${u.lastName}`),
    ]),
  ].sort();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema) as Resolver<EvaluationFormValues>,
    defaultValues: {
      evaluationType: 'TECHNICAL',
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSystemNote />

      {!uploadOnly && (
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
            <Select id="evaluatorName" {...register('evaluatorName')}>
              <option value="">— Select —</option>
              {evaluatorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            {errors.evaluatorName && (
              <p className="text-xs text-red-600">{errors.evaluatorName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluationType">Evaluation type *</Label>
            <Select id="evaluationType" {...register('evaluationType')}>
              {evaluationTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
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

          <div className="space-y-2">
            <Label htmlFor="recommendation">Recommendation</Label>
            <Select id="recommendation" {...register('recommendation')}>
              <option value="">— Not set —</option>
              {evaluationRecommendations.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicalScore">Technical score (0–100)</Label>
            <Input
              id="technicalScore"
              type="number"
              min={0}
              max={100}
              {...register('technicalScore', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communicationScore">Communication score</Label>
            <Input
              id="communicationScore"
              type="number"
              min={0}
              max={100}
              {...register('communicationScore', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="architectureScore">Architecture score</Label>
            <Input
              id="architectureScore"
              type="number"
              min={0}
              max={100}
              {...register('architectureScore', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemSolvingScore">Problem solving score</Label>
            <Input
              id="problemSolvingScore"
              type="number"
              min={0}
              max={100}
              {...register('problemSolvingScore', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="summary">Summary</Label>
            <textarea
              id="summary"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('summary')}
            />
          </div>
        </div>
      )}

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-sm font-medium">Documents</p>
        <FileUpload
          label="Evaluation PDF"
          accept=".pdf"
          onFileSelect={(file) => setValue('pdfFileName', file.name, { shouldValidate: true })}
        />
        {watch('pdfFileName') && (
          <p className="text-sm text-emerald-700">PDF: {watch('pdfFileName')}</p>
        )}
        <FileUpload
          label="Interview recording"
          accept=".mp4,.webm,.mov"
          hint="MP4 or WebM — upload file, not a URL"
          onFileSelect={(file) => setValue('recordingFileName', file.name, { shouldValidate: true })}
        />
        {watch('recordingFileName') && (
          <p className="text-sm text-emerald-700">Recording: {watch('recordingFileName')}</p>
        )}
      </div>

      {!uploadOnly && (
        <p className="text-xs text-muted-foreground">
          Status and audit timestamps are set automatically when you save.
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

export { evaluationFormSchema };
