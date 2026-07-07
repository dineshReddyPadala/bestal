import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { InterviewRequestFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const INTERVIEW_TYPES: { value: InterviewRequestFormValues['type']; label: string }[] = [
  { value: 'VIDEO', label: 'Video call' },
  { value: 'PHONE', label: 'Phone call' },
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'TECHNICAL', label: 'Technical assessment' },
  { value: 'PANEL', label: 'Panel interview' },
  { value: 'FINAL', label: 'Final round' },
  { value: 'HR', label: 'HR screen' },
];

const interviewRequestFormSchema = z
  .object({
    type: z.enum(['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'PANEL', 'FINAL', 'HR']),
    preferredDate: z.string().min(1, 'Preferred date is required'),
    preferredTime: z.string().min(1, 'Preferred time is required'),
    durationMinutes: z.coerce.number().int().positive(),
    timezone: z.string().max(50).optional(),
    location: z.string().max(500).optional(),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'IN_PERSON' && !data.location?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Location is required for in-person interviews',
        path: ['location'],
      });
    }
  });

type InterviewRequestFormProps = {
  onSubmit: (values: InterviewRequestFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  showActions?: boolean;
};

export function InterviewRequestForm({
  onSubmit,
  onCancel,
  submitLabel = 'Submit request',
  formId = 'interview-request-form',
  showActions = true,
}: InterviewRequestFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InterviewRequestFormValues>({
    resolver: zodResolver(interviewRequestFormSchema) as Resolver<InterviewRequestFormValues>,
    defaultValues: {
      type: 'VIDEO',
      preferredTime: '10:00',
      durationMinutes: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    },
  });

  const interviewType = watch('type');

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="type">Interview type *</Label>
          <Select id="type" {...register('type')}>
            {INTERVIEW_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredDate">Preferred date *</Label>
          <Input id="preferredDate" type="date" {...register('preferredDate')} />
          {errors.preferredDate && (
            <p className="text-xs text-red-600">{errors.preferredDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredTime">Preferred time *</Label>
          <Input id="preferredTime" type="time" {...register('preferredTime')} />
          {errors.preferredTime && (
            <p className="text-xs text-red-600">{errors.preferredTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration *</Label>
          <Select id="durationMinutes" {...register('durationMinutes', { valueAsNumber: true })}>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" {...register('timezone')} placeholder="America/New_York" />
        </div>

        {interviewType === 'IN_PERSON' && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" {...register('location')} placeholder="Office address or meeting location" />
            {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
          </div>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('notes')}
          />
        </div>
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

export { interviewRequestFormSchema };
