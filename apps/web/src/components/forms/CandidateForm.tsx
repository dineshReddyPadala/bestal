import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from '../ui/label';

const candidateFormSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().max(30).optional(),
  headline: z.string().max(255).optional(),
  summary: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  availableFrom: z.string().optional(),
  expectedRate: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  source: z.enum(['DIRECT', 'REFERRAL', 'JOB_BOARD', 'LINKEDIN', 'AGENCY', 'INTERNAL', 'OTHER']),
  status: z.enum(['NEW', 'ACTIVE', 'INACTIVE', 'PLACED', 'DO_NOT_CONTACT']).optional(),
  visibility: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN']).optional(),
  organizationId: z.number().int().positive().optional(),
  primarySkillCommunityId: z.number().int().positive().optional().nullable(),
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;

type CandidateFormProps = {
  defaultValues?: Partial<CandidateFormValues>;
  onSubmit: (values: CandidateFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
};

export function CandidateForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save candidate',
}: CandidateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      source: 'LINKEDIN',
      currency: 'USD',
      status: 'NEW',
      visibility: 'DRAFT',
      organizationId: 1,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name *</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name *</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="+1 (415) 555-0100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizationId">Organization ID</Label>
          <Input id="organizationId" type="number" {...register('organizationId', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" {...register('headline')} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <textarea
            id="summary"
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('summary')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years of experience</Label>
          <Input id="yearsExperience" type="number" min={0} {...register('yearsExperience', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableFrom">Available from</Label>
          <Input id="availableFrom" type="date" {...register('availableFrom')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedRate">Expected rate ($/hr)</Label>
          <Input id="expectedRate" type="number" min={0} {...register('expectedRate', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" maxLength={3} {...register('currency')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primarySkillCommunityId">Primary skill community ID</Label>
          <Input id="primarySkillCommunityId" type="number" {...register('primarySkillCommunityId', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select id="source" {...register('source')}>
            <option value="DIRECT">Direct</option>
            <option value="REFERRAL">Referral</option>
            <option value="JOB_BOARD">Job Board</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="AGENCY">Agency</option>
            <option value="INTERNAL">Internal</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            <option value="NEW">New</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PLACED">Placed</option>
            <option value="DO_NOT_CONTACT">Do Not Contact</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select id="visibility" {...register('visibility')}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="HIDDEN">Hidden</option>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
          {errors.linkedinUrl && <p className="text-xs text-red-600">{errors.linkedinUrl.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
