import { candidates } from '@bestal/mock-data';
import { Button, FileUpload, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import {
  getBgvChecksForType,
  type BgvCheckType,
  type BgvRequestFormValues,
} from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const BGV_CHECK_TYPES: { value: BgvCheckType; label: string }[] = [
  { value: 'COMPREHENSIVE', label: 'Comprehensive' },
  { value: 'CRIMINAL', label: 'Criminal' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'REFERENCE', label: 'Reference' },
  { value: 'IDENTITY', label: 'Identity / address' },
  { value: 'CREDIT', label: 'Credit' },
];

const checkStatusSchema = z.enum(['NOT_STARTED', 'PENDING']);

const bgvRequestFormSchema = z.object({
  candidateName: z.string().min(1, 'Select a candidate'),
  vendor: z.string().min(1, 'Enter vendor name').max(100),
  requestedByName: z.string().min(1, 'Enter requester name').max(100),
  checkType: z.enum([
    'COMPREHENSIVE',
    'CRIMINAL',
    'EMPLOYMENT',
    'EDUCATION',
    'REFERENCE',
    'IDENTITY',
    'CREDIT',
  ]),
  employment: checkStatusSchema,
  education: checkStatusSchema,
  reference: checkStatusSchema,
  address: checkStatusSchema,
  criminal: checkStatusSchema,
  notes: z.string().max(2000).optional(),
  consentFileName: z.string().optional(),
  reportFileName: z.string().optional(),
});

type BgvRequestFormProps = {
  onSubmit: (values: BgvRequestFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  showActions?: boolean;
};

const defaultChecks = getBgvChecksForType('COMPREHENSIVE');

export function BgvRequestForm({
  onSubmit,
  onCancel,
  submitLabel = 'Request BGV',
  formId = 'bgv-request-form',
  showActions = true,
}: BgvRequestFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BgvRequestFormValues>({
    resolver: zodResolver(bgvRequestFormSchema) as Resolver<BgvRequestFormValues>,
    defaultValues: {
      vendor: 'Checkr',
      requestedByName: '',
      checkType: 'COMPREHENSIVE',
      ...defaultChecks,
    },
  });

  const checkType = watch('checkType');

  useEffect(() => {
    const checks = getBgvChecksForType(checkType);
    setValue('employment', checks.employment);
    setValue('education', checks.education);
    setValue('reference', checks.reference);
    setValue('address', checks.address);
    setValue('criminal', checks.criminal);
  }, [checkType, setValue]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
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
          <Label htmlFor="requestedByName">Requested by *</Label>
          <Input
            id="requestedByName"
            {...register('requestedByName')}
            placeholder="Requester full name"
          />
          {errors.requestedByName && (
            <p className="text-xs text-red-600">{errors.requestedByName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor *</Label>
          <Input id="vendor" {...register('vendor')} placeholder="e.g. Checkr, Sterling" />
          {errors.vendor && <p className="text-xs text-red-600">{errors.vendor.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkType">Package type *</Label>
          <Select id="checkType" {...register('checkType')}>
            {BGV_CHECK_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Checks to run</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              ['employment', 'Employment'],
              ['education', 'Education'],
              ['reference', 'Reference'],
              ['address', 'Address'],
              ['criminal', 'Criminal'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Select id={key} {...register(key)}>
                <option value="NOT_STARTED">Not requested</option>
                <option value="PENDING">Requested</option>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('notes')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileUpload
          label="Consent form"
          accept=".pdf,.doc,.docx"
          onFileSelect={(file) => setValue('consentFileName', file.name, { shouldValidate: true })}
        />
        <FileUpload
          label="Report document"
          accept=".pdf,.doc,.docx"
          onFileSelect={(file) => setValue('reportFileName', file.name, { shouldValidate: true })}
        />
      </div>
      {(watch('consentFileName') || watch('reportFileName')) && (
        <div className="text-xs text-muted-foreground">
          {watch('consentFileName') && <span className="block">Consent: {watch('consentFileName')}</span>}
          {watch('reportFileName') && <span className="block">Report: {watch('reportFileName')}</span>}
        </div>
      )}

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

export { bgvRequestFormSchema };
