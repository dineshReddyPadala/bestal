import { clientIndustries } from '@bestal/mock-data';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { clientsApi } from '../../lib/api/clients';
import type { ClientFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const clientFormSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  industry: z.string().min(1, 'Industry is required'),
  primaryContact: z.string().min(1, 'Primary contact name is required').max(100),
  email: z.string().email('Valid primary contact email is required').max(255),
  phone: z.string().min(1, 'Primary contact phone is required').max(30),
  accountManagerId: z.string().optional().default(''),
  companySize: z.string().max(50).optional(),
  headquarters: z.string().max(255).optional(),
  website: z.string().min(1, 'Website is required').max(500),
  logoFileName: z.string().optional(),
  logoPreviewUrl: z.string().optional(),
});

export type AccountManagerOption = {
  id: number;
  label: string;
};

type ClientFormProps = {
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  /** When true, fields are disabled and submit is hidden (View mode). */
  readOnly?: boolean;
  /** Optional preloaded managers; otherwise loaded from the clients API. */
  accountManagers?: AccountManagerOption[];
};

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save client',
  formId = 'client-form',
  readOnly = false,
  accountManagers: accountManagersProp,
}: ClientFormProps) {
  const { data: managersData, isLoading: usersLoading } = useQuery({
    queryKey: ['clients', 'account-managers'],
    queryFn: () => clientsApi.listAccountManagers(),
    enabled: !accountManagersProp?.length,
  });

  const accountManagers = useMemo(() => {
    if (accountManagersProp?.length) return accountManagersProp;
    return (managersData?.data ?? []).map((m) => ({
      id: m.id,
      label: m.label || `${m.firstName} ${m.lastName}`.trim() || m.email,
    }));
  }, [accountManagersProp, managersData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: {
      company: '',
      industry: '',
      primaryContact: '',
      email: '',
      phone: '',
      website: '',
      accountManagerId: '',
      companySize: '',
      headquarters: '',
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company">Company name *</Label>
          <Input
            id="company"
            {...register('company')}
            placeholder="Acme Corp"
            disabled={readOnly}
          />
          {errors.company && <p className="text-xs text-red-600">{errors.company.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select id="industry" {...register('industry')} disabled={readOnly}>
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
          <Label htmlFor="website">Website *</Label>
          <Input
            id="website"
            {...register('website')}
            placeholder="https://example.com"
            disabled={readOnly}
          />
          {errors.website && <p className="text-xs text-red-600">{errors.website.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryContact">Primary contact name *</Label>
          <Input id="primaryContact" {...register('primaryContact')} disabled={readOnly} />
          {errors.primaryContact && (
            <p className="text-xs text-red-600">{errors.primaryContact.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Primary contact email *</Label>
          <Input id="email" type="email" {...register('email')} disabled={readOnly} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Primary contact phone *</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+1 (415) 555-0100"
            disabled={readOnly}
          />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountManagerId">Account manager</Label>
          <Select id="accountManagerId" {...register('accountManagerId')} disabled={readOnly}>
            <option value="">— None —</option>
            {accountManagers.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.label}
              </option>
            ))}
          </Select>
          {usersLoading && accountManagers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Loading users…</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company size</Label>
          <Select id="companySize" {...register('companySize')} disabled={readOnly}>
            <option value="">— Select —</option>
            <option value="1-50">1–50</option>
            <option value="51-200">51–200</option>
            <option value="201-1000">201–1,000</option>
            <option value="1000+">1,000+</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headquarters">Headquarters</Label>
          <Input
            id="headquarters"
            {...register('headquarters')}
            placeholder="San Francisco, CA"
            disabled={readOnly}
          />
        </div>
      </div>

      {!readOnly ? (
        <div className="border-t border-border pt-4">
          <FileUpload
            label="Company logo"
            accept=".jpg,.jpeg,.png,.webp,.svg"
            onFileSelect={(file) => {
              setValue('logoFileName', file.name, { shouldValidate: true });
              setValue('logoPreviewUrl', URL.createObjectURL(file));
            }}
          />
          {watch('logoFileName') && (
            <p className="mt-2 text-xs text-muted-foreground">{watch('logoFileName')}</p>
          )}
        </div>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly ? <Button type="submit">{submitLabel}</Button> : null}
      </div>
    </form>
  );
}

export { clientFormSchema };
