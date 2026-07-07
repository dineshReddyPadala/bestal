import { clientIndustries, clientManagers } from '@bestal/mock-data';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { ClientFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const clientFormSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  industry: z.string().min(1, 'Industry is required'),
  primaryContact: z.string().min(1, 'Primary contact is required').max(100),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().max(30).default(''),
  accountManager: z.string().min(1, 'Account manager is required'),
  logoFileName: z.string().optional(),
});

type ClientFormProps = {
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
};

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save client',
  formId = 'client-form',
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: {
      accountManager: clientManagers[0],
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company">Company name *</Label>
          <Input id="company" {...register('company')} placeholder="Acme Corp" />
          {errors.company && <p className="text-xs text-red-600">{errors.company.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select id="industry" {...register('industry')}>
            <option value="">— Select —</option>
            {clientIndustries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
          {errors.industry && <p className="text-xs text-red-600">{errors.industry.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountManager">Account manager *</Label>
          <Select id="accountManager" {...register('accountManager')}>
            {clientManagers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryContact">Primary contact *</Label>
          <Input id="primaryContact" {...register('primaryContact')} />
          {errors.primaryContact && (
            <p className="text-xs text-red-600">{errors.primaryContact.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Contact email *</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="+1 (415) 555-0100" />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <FileUpload
          label="Company logo"
          accept=".jpg,.jpeg,.png,.webp,.svg"
          onFileSelect={(file) => setValue('logoFileName', file.name, { shouldValidate: true })}
        />
        {watch('logoFileName') && (
          <p className="mt-2 text-xs text-muted-foreground">{watch('logoFileName')}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

export { clientFormSchema };
