import { Button } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { TrialRejectFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const schema = z.object({
  reason: z.string().max(500).optional(),
});

type TrialRejectFormProps = {
  onSubmit: (values: TrialRejectFormValues) => void;
  onCancel: () => void;
  formId?: string;
  showActions?: boolean;
};

export function TrialRejectForm({
  onSubmit,
  onCancel,
  formId = 'trial-reject-form',
  showActions = true,
}: TrialRejectFormProps) {
  const { register, handleSubmit } = useForm<TrialRejectFormValues>({
    resolver: zodResolver(schema) as Resolver<TrialRejectFormValues>,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reject reason</Label>
        <textarea
          id="reason"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('reason')}
          placeholder="Optional reason for the client"
        />
      </div>
      {showActions && (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm reject
          </Button>
        </div>
      )}
    </form>
  );
}
