import { deploymentCandidates, deploymentClients } from '@bestal/mock-data';
import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { DeploymentFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';
import { FormSystemNote } from './FormSystemNote';

const deploymentFormSchema = z.object({
  clientName: z.string().min(1, 'Select a client'),
  candidateName: z.string().min(1, 'Select a candidate'),
  roleTitle: z.string().min(1, 'Role title is required').max(200),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  billRate: z.coerce.number().positive('Must be greater than 0'),
  payRate: z.coerce.number().positive('Must be greater than 0'),
  currency: z.string().length(3),
  hoursPerWeek: z.number().int().min(1).max(168),
  timezone: z.string().min(1, 'Timezone is required'),
  notes: z.string().max(2000).optional(),
});

type DeploymentFormProps = {
  defaultValues?: Partial<DeploymentFormValues>;
  onSubmit: (values: DeploymentFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
};

export function DeploymentForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create deployment',
  formId = 'deployment-form',
}: DeploymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeploymentFormValues>({
    resolver: zodResolver(deploymentFormSchema) as Resolver<DeploymentFormValues>,
    defaultValues: {
      currency: 'USD',
      hoursPerWeek: 40,
      timezone: 'America/New_York',
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSystemNote />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client *</Label>
          <Select id="clientName" {...register('clientName')}>
            <option value="">— Select —</option>
            {deploymentClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {errors.clientName && <p className="text-xs text-red-600">{errors.clientName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidateName">Candidate *</Label>
          <Select id="candidateName" {...register('candidateName')}>
            <option value="">— Select —</option>
            {deploymentCandidates.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {errors.candidateName && (
            <p className="text-xs text-red-600">{errors.candidateName.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="roleTitle">Role title *</Label>
          <Input id="roleTitle" {...register('roleTitle')} placeholder="Senior Full-Stack Engineer" />
          {errors.roleTitle && <p className="text-xs text-red-600">{errors.roleTitle.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start date *</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate && <p className="text-xs text-red-600">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billRate">Bill rate ($/hr) *</Label>
          <Input
            id="billRate"
            type="number"
            min={0}
            step={0.01}
            {...register('billRate', { valueAsNumber: true })}
          />
          {errors.billRate && <p className="text-xs text-red-600">{errors.billRate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payRate">Pay rate ($/hr) *</Label>
          <Input
            id="payRate"
            type="number"
            min={0}
            step={0.01}
            {...register('payRate', { valueAsNumber: true })}
          />
          {errors.payRate && <p className="text-xs text-red-600">{errors.payRate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" maxLength={3} {...register('currency')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hoursPerWeek">Hours per week</Label>
          <Input
            id="hoursPerWeek"
            type="number"
            min={1}
            max={168}
            {...register('hoursPerWeek', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="timezone">Timezone *</Label>
          <Input id="timezone" {...register('timezone')} placeholder="America/New_York" />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('notes')}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Margin, manager, and deployment status are calculated automatically.
      </p>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

export { deploymentFormSchema };
