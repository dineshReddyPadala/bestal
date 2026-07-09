import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { TrialRequestFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const trialRequestFormSchema = z
  .object({
    roleTitle: z.string().min(1, 'Role title is required').max(255),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    trialType: z.string().max(100).optional(),
    maxTrialHours: z.coerce.number().int().positive().optional(),
    taskDescription: z.string().max(5000).optional(),
    successCriteria: z.string().max(5000).optional(),
    feedback: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after start date',
        path: ['endDate'],
      });
    }
  });

type TrialRequestFormProps = {
  onSubmit: (values: TrialRequestFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  showActions?: boolean;
};

export function TrialRequestForm({
  onSubmit,
  onCancel,
  submitLabel = 'Submit request',
  formId = 'trial-request-form',
  showActions = true,
}: TrialRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrialRequestFormValues>({
    resolver: zodResolver(trialRequestFormSchema) as Resolver<TrialRequestFormValues>,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roleTitle">Role title *</Label>
        <Input id="roleTitle" {...register('roleTitle')} placeholder="Senior Full-Stack Engineer" />
        {errors.roleTitle && <p className="text-xs text-red-600">{errors.roleTitle.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date *</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate && <p className="text-xs text-red-600">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End date *</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
          {errors.endDate && <p className="text-xs text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trialType">Trial type</Label>
          <Select id="trialType" {...register('trialType')}>
            <option value="">— Select —</option>
            <option value="PAID_PILOT">Paid pilot</option>
            <option value="UNPAID_PILOT">Unpaid pilot</option>
            <option value="SKILL_ASSESSMENT">Skill assessment</option>
            <option value="PROBATION">Probation</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTrialHours">Max trial hours</Label>
          <Input
            id="maxTrialHours"
            type="number"
            min={1}
            {...register('maxTrialHours', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskDescription">Task description</Label>
        <textarea
          id="taskDescription"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('taskDescription')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="successCriteria">Success criteria</Label>
        <textarea
          id="successCriteria"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('successCriteria')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Project scope / notes</Label>
        <textarea
          id="feedback"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('feedback')}
        />
        {errors.feedback && <p className="text-xs text-red-600">{errors.feedback.message}</p>}
      </div>

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

export { trialRequestFormSchema };
