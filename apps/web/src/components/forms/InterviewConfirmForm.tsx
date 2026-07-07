import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { InterviewConfirmFormValues, InterviewRequestType } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const schema = z.object({
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  durationMinutes: z.coerce.number().int().positive(),
  timezone: z.string().max(50).optional(),
  location: z.string().max(500).optional(),
  meetingLink: z.string().max(500).optional(),
});

type InterviewConfirmFormProps = {
  interviewType: InterviewRequestType;
  onSubmit: (values: InterviewConfirmFormValues) => void;
  onCancel: () => void;
  formId?: string;
  showActions?: boolean;
};

export function InterviewConfirmForm({
  interviewType,
  onSubmit,
  onCancel,
  formId = 'interview-confirm-form',
  showActions = true,
}: InterviewConfirmFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewConfirmFormValues>({
    resolver: zodResolver(schema) as Resolver<InterviewConfirmFormValues>,
    defaultValues: {
      scheduledTime: '10:00',
      durationMinutes: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Scheduled date *</Label>
          <Input id="scheduledDate" type="date" {...register('scheduledDate')} />
          {errors.scheduledDate && (
            <p className="text-xs text-red-600">{errors.scheduledDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledTime">Scheduled time *</Label>
          <Input id="scheduledTime" type="time" {...register('scheduledTime')} />
          {errors.scheduledTime && (
            <p className="text-xs text-red-600">{errors.scheduledTime.message}</p>
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
          <Input id="timezone" {...register('timezone')} />
        </div>
        {interviewType === 'IN_PERSON' && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} placeholder="Office or meeting address" />
          </div>
        )}
        {interviewType !== 'IN_PERSON' && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="meetingLink">Meeting link</Label>
            <Input id="meetingLink" {...register('meetingLink')} placeholder="https://…" />
          </div>
        )}
      </div>
      {showActions && (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Confirm interview</Button>
        </div>
      )}
    </form>
  );
}
