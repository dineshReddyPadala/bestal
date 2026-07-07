import { Button } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { InterviewCancelFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const schema = z.object({
  cancelReason: z.string().max(500).optional(),
});

type InterviewCancelFormProps = {
  onSubmit: (values: InterviewCancelFormValues) => void;
  onCancel: () => void;
  formId?: string;
  showActions?: boolean;
};

export function InterviewCancelForm({
  onSubmit,
  onCancel,
  formId = 'interview-cancel-form',
  showActions = true,
}: InterviewCancelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewCancelFormValues>({
    resolver: zodResolver(schema) as Resolver<InterviewCancelFormValues>,
    defaultValues: { cancelReason: '' },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cancelReason">Cancellation reason</Label>
        <textarea
          id="cancelReason"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Optional reason for the client"
          {...register('cancelReason')}
        />
        {errors.cancelReason && (
          <p className="text-xs text-red-600">{errors.cancelReason.message}</p>
        )}
      </div>
      {showActions && (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Button type="submit">
            Cancel interview
          </Button>
        </div>
      )}
    </form>
  );
}
