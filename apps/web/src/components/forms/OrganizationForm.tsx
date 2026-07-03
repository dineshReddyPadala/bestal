import { Button, Input } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { OrganizationFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';
import { FormSystemNote } from './FormSystemNote';

const organizationFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
});

type OrganizationFormProps = {
  defaultValues?: Partial<OrganizationFormValues>;
  onSubmit: (values: OrganizationFormValues) => void;
  onCancel: () => void;
  formId?: string;
};

export function OrganizationForm({
  defaultValues,
  onSubmit,
  onCancel,
  formId = 'organization-form',
}: OrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSystemNote />

      <div className="space-y-2">
        <Label htmlFor="name">Organization name *</Label>
        <Input id="name" {...register('name')} placeholder="Acme Staffing" />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <p className="text-xs text-muted-foreground">
        Slug, member counts, and timestamps are generated automatically.
      </p>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create organization</Button>
      </div>
    </form>
  );
}

export { organizationFormSchema };
