import { bgvVendors, candidates } from '@bestal/mock-data';
import { Button, FileUpload, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { BgvCheckType, BgvRequestFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';
import { FormSystemNote } from './FormSystemNote';

const BGV_CHECK_TYPES: { value: BgvCheckType; label: string }[] = [
  { value: 'COMPREHENSIVE', label: 'Comprehensive (all checks)' },
  { value: 'CRIMINAL', label: 'Criminal' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'REFERENCE', label: 'Reference' },
  { value: 'IDENTITY', label: 'Identity / address' },
  { value: 'CREDIT', label: 'Credit' },
];

const DEFAULT_VENDORS = ['Checkr', 'Sterling', 'HireRight', 'GoodHire'] as const;

const bgvRequestFormSchema = z.object({
  candidateName: z.string().min(1, 'Select a candidate'),
  vendor: z.string().min(1, 'Select a vendor'),
  checkType: z.enum([
    'COMPREHENSIVE',
    'CRIMINAL',
    'EMPLOYMENT',
    'EDUCATION',
    'REFERENCE',
    'IDENTITY',
    'CREDIT',
  ]),
  notes: z.string().max(2000).optional(),
  consentFileName: z.string().optional(),
});

type BgvRequestFormProps = {
  onSubmit: (values: BgvRequestFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
};

export function BgvRequestForm({
  onSubmit,
  onCancel,
  submitLabel = 'Request BGV',
  formId = 'bgv-request-form',
}: BgvRequestFormProps) {
  const vendors = [...new Set([...DEFAULT_VENDORS, ...bgvVendors])];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BgvRequestFormValues>({
    resolver: zodResolver(bgvRequestFormSchema) as Resolver<BgvRequestFormValues>,
    defaultValues: {
      vendor: vendors[0],
      checkType: 'COMPREHENSIVE',
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSystemNote />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="candidateName">Candidate *</Label>
          <Select id="candidateName" {...register('candidateName')}>
            <option value="">— Select —</option>
            {candidates.map((c) => {
              const name = `${c.firstName} ${c.lastName}`;
              return (
                <option key={c.id} value={name}>
                  {name}
                </option>
              );
            })}
          </Select>
          {errors.candidateName && (
            <p className="text-xs text-red-600">{errors.candidateName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor *</Label>
          <Select id="vendor" {...register('vendor')}>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
          {errors.vendor && <p className="text-xs text-red-600">{errors.vendor.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkType">Check type *</Label>
          <Select id="checkType" {...register('checkType')}>
            {BGV_CHECK_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Special instructions for the vendor…"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <FileUpload
          label="Consent form (optional)"
          accept=".pdf,.doc,.docx"
          hint="Upload signed consent — no URL needed"
          onFileSelect={(file) => setValue('consentFileName', file.name, { shouldValidate: true })}
        />
        {watch('consentFileName') && (
          <p className="mt-2 text-sm text-emerald-700">Selected: {watch('consentFileName')}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Check statuses, completion date, and report availability are updated automatically as the
        vendor processes the request.
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

export { bgvRequestFormSchema };
