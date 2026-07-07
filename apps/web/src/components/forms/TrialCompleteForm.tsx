import { Button, Input } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { TrialCompleteFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const schema = z.object({
  outcome: z.string().min(1, 'Outcome is required').max(500),
  feedback: z.string().max(5000).optional(),
});

type TrialCompleteFormProps = {
  onSubmit: (values: TrialCompleteFormValues) => void;
  onCancel: () => void;
  formId?: string;
  showActions?: boolean;
};

export function TrialCompleteForm({
  onSubmit,
  onCancel,
  formId = 'trial-complete-form',
  showActions = true,
}: TrialCompleteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrialCompleteFormValues>({
    resolver: zodResolver(schema) as Resolver<TrialCompleteFormValues>,
    defaultValues: { outcome: 'Successful — recommend conversion' },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="outcome">Outcome *</Label>
        <Input id="outcome" {...register('outcome')} placeholder="e.g. Successful — recommend conversion" />
        {errors.outcome && <p className="text-xs text-red-600">{errors.outcome.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <textarea
          id="feedback"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('feedback')}
        />
      </div>
      {showActions && (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Mark completed</Button>
        </div>
      )}
    </form>
  );
}
