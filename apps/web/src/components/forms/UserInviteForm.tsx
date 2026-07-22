import { Button, Input, Select } from '@bestal/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { UserInviteFormValues } from '../../lib/entity-field-metadata';
import { Label } from '../ui/label';

const userInviteFormSchema = z.object({
  email: z.string().email('Invalid email').max(255),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(30).optional(),
  role: z.enum(['RECRUITER', 'SALES', 'ADMIN']),
});

type UserInviteFormProps = {
  onSubmit: (values: UserInviteFormValues) => void;
  onCancel: () => void;
  formId?: string;
  submitting?: boolean;
};

export function UserInviteForm({
  onSubmit,
  onCancel,
  formId = 'user-invite-form',
  submitting = false,
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
            <option value="RECRUITER">Recruiter</option>
            <option value="SALES">Sales</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending invite…' : 'Send invite'}
        </Button>
      </div>
    </form>
  );
}

export { userInviteFormSchema };
