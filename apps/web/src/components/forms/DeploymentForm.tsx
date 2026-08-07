import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { DeploymentFormValues } from '../../lib/entity-field-metadata';
import { TIMEZONE_OPTIONS } from '../../lib/timezones';
import { Label } from '../ui/label';

const PLACEMENT_TYPES: { value: DeploymentFormValues['placementType']; label: string }[] = [
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'TEMP_TO_PERM', label: 'Temp to perm' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const deploymentFormSchema = z.object({
  clientName: z.string().min(1, 'Select a client'),
  candidateName: z.string().min(1, 'Select a candidate'),
  placementType: z.enum(['CONTRACT', 'PERMANENT', 'TEMP_TO_PERM', 'FREELANCE']),
  roleTitle: z.string().min(1, 'Role title is required').max(255),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  billingRate: z.coerce.number().positive('Must be greater than 0'),
  candidatePayRate: z.coerce.number().positive().optional(),
  grossMarginPerHour: z.coerce.number().optional(),
  expectedHoursPerWeek: z.coerce.number().int().positive().optional(),
  timezone: z.string().max(100).optional(),
  reportingManagerName: z.string().max(150).optional(),
  reportingManagerEmail: z.string().email().max(255).optional().or(z.literal('')),
  currency: z.string().length(3),
  workLocation: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
});

type DeploymentSelectOption = { id: number; name: string };

type DeploymentFormProps = {
  defaultValues?: Partial<DeploymentFormValues>;
  onSubmit: (values: DeploymentFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  showActions?: boolean;
  clients?: DeploymentSelectOption[];
  candidates?: DeploymentSelectOption[];
};

export function DeploymentForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create deployment',
  formId = 'deployment-form',
  showActions = true,
  clients = [],
  candidates = [],
}: DeploymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeploymentFormValues>({
    resolver: zodResolver(deploymentFormSchema) as Resolver<DeploymentFormValues>,
    defaultValues: {
      placementType: 'CONTRACT',
      currency: 'USD',
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client *</Label>
          <Select id="clientName" {...register('clientName')}>
            <option value="">— Select —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          {errors.clientName && <p className="text-xs text-red-600">{errors.clientName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidateName">Candidate *</Label>
          <Select id="candidateName" {...register('candidateName')}>
            <option value="">— Select —</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
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
          <Label htmlFor="placementType">Placement type *</Label>
          <Select id="placementType" {...register('placementType')}>
            {PLACEMENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingRate">Billing rate ($/hr) *</Label>
          <Input
            id="billingRate"
            type="number"
            min={0}
            step={0.01}
            {...register('billingRate', { valueAsNumber: true })}
          />
          {errors.billingRate && (
            <p className="text-xs text-red-600">{errors.billingRate.message}</p>
          )}
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
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" maxLength={3} {...register('currency')} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="workLocation">Work location</Label>
          <Input id="workLocation" {...register('workLocation')} placeholder="Remote, hybrid, or office city" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidatePayRate">Candidate pay rate ($/hr)</Label>
          <Input
            id="candidatePayRate"
            type="number"
            min={0}
            step={0.01}
            {...register('candidatePayRate', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grossMarginPerHour">Gross margin ($/hr)</Label>
          <Input
            id="grossMarginPerHour"
            type="number"
            step={0.01}
            {...register('grossMarginPerHour', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedHoursPerWeek">Expected hours / week</Label>
          <Input
            id="expectedHoursPerWeek"
            type="number"
            min={1}
            max={168}
            {...register('expectedHoursPerWeek', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select id="timezone" {...register('timezone')}>
            <option value="">— Select —</option>
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportingManagerName">Reporting manager</Label>
          <Input id="reportingManagerName" {...register('reportingManagerName')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportingManagerEmail">Manager email</Label>
          <Input id="reportingManagerEmail" type="email" {...register('reportingManagerEmail')} />
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

export { deploymentFormSchema };
