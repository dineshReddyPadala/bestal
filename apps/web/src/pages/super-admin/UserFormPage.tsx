import { Button, Input, PageHeader, Select } from '@bestal/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminMutations, useAdminUser } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

const ROLES = ['ADMIN', 'RECRUITER', 'SALES', 'VIEWER'] as const;

export function SuperAdminUserFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const userId = isNew ? 0 : Number(id);
  const navigate = useNavigate();
  const { show, showError } = useDemoToast();
  const { data, isLoading } = useAdminUser(userId);
  const mutations = useAdminMutations();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('RECRUITER');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data || isNew) return;
    setFirstName(String(data.firstName ?? ''));
    setLastName(String(data.lastName ?? ''));
    setEmail(String(data.email ?? ''));
    setRole(String(data.role ?? 'RECRUITER'));
    setIsActive(Boolean(data.isActive));
  }, [data, isNew]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isNew) {
        await mutations.createUser.mutateAsync({
          firstName,
          lastName,
          email,
          role,
          temporaryPassword: temporaryPassword || undefined,
          isActive,
        });
        show('User created');
      } else {
        await mutations.updateUser.mutateAsync({
          id: userId,
          body: { firstName, lastName, role, isActive },
        });
        show('User updated');
      }
      navigate('/super-admin/users');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <PageHeader
        title={isNew ? 'Create user' : 'Edit user'}
        description="ADMIN, RECRUITER, SALES, or VIEWER"
      />
      <form onSubmit={onSubmit} className="max-w-xl space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">First name</span>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Last name</span>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!isNew}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Role</span>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </label>
        {isNew && (
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Temporary password (optional)</span>
            <Input
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              placeholder="Auto-generated if blank"
            />
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/super-admin/users')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
