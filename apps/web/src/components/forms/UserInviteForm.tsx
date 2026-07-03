import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { UserInviteFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';
import { FormSystemNote } from './FormSystemNote';

const userInviteFormSchema = z.object({
  email: z.string().email('Invalid email').max(255),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(30).optional(),
  role: z.enum(['ADMIN', 'RECRUITER', 'SALES', 'CLIENT']),
});

type UserInviteFormProps = {
  onSubmit: (values: UserInviteFormValues) => void;
  onCancel: () => void;
  formId?: string;
};

export function UserInviteForm({
  onSubmit,
  onCancel,
  formId = 'user-invite-form',
}: UserInviteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInviteFormValues>({
    resolver: zodResolver(userInviteFormSchema),
    defaultValues: { role: 'RECRUITER' },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSystemNote />

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
          <Input id="phone" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select id="role" {...register('role')}>
            <option value="ADMIN">Admin</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="SALES">Sales</option>
            <option value="CLIENT">Client</option>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Organization, active status, and login timestamps are set automatically.
      </p>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Send invite</Button>
      </div>
    </form>
  );
}

export { userInviteFormSchema };
