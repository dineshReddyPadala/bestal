import { Button, Input, PageHeader, Select } from '@bestal/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminMutations, useAdminUser } from '../../hooks/api/useAdmin';
import { useClientsList } from '../../hooks/api/useClients';
import { useDemoToast } from '../../lib/use-demo-toast';
import { getApiErrorMessage } from '../../lib/api/errors';
import { ToastHost } from '../../components/ui/ToastHost';

const ROLES = ['ADMIN', 'RECRUITER', 'SALES', 'VIEWER', 'CLIENT'] as const;

export function SuperAdminUserFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const userId = isNew ? 0 : Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { data, isLoading } = useAdminUser(userId);
  const mutations = useAdminMutations();
  const { data: clientsData } = useClientsList({ limit: 100, sort: 'name' });
  const clients = clientsData?.data ?? [];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('RECRUITER');
  const [clientId, setClientId] = useState<string>('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data || isNew) return;
    setFirstName(String(data.firstName ?? ''));
    setLastName(String(data.lastName ?? ''));
    setEmail(String(data.email ?? ''));
    setRole(String(data.role ?? 'RECRUITER'));
    setClientId(
      data.clientId != null && data.clientId !== undefined
        ? String(data.clientId)
        : '',
    );
    setIsActive(Boolean(data.isActive));
  }, [data, isNew]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === 'CLIENT' && !clientId) {
      showError('Select a client account for CLIENT users');
      return;
    }
    setBusy(true);
    try {
      const linkedClientId = role === 'CLIENT' ? Number(clientId) : undefined;
      if (isNew) {
        const created = await mutations.createUser.mutateAsync({
          firstName,
          lastName,
          email,
          role,
          clientId: linkedClientId,
          temporaryPassword: temporaryPassword || undefined,
          isActive,
        });
        const emailSent = Boolean(
          created && typeof created === 'object' && 'emailSent' in created
            ? (created as { emailSent?: boolean }).emailSent
            : false,
        );
        show(
          emailSent
            ? 'User created — invite email sent'
            : 'User created — invite email was not sent (check SMTP / FROM_MAIL settings)',
          emailSent ? 'success' : 'error',
        );
        setTimeout(() => navigate('/super-admin/users'), 1500);
      } else {
        await mutations.updateUser.mutateAsync({
          id: userId,
          body: {
            firstName,
            lastName,
            role,
            isActive,
            clientId: role === 'CLIENT' ? linkedClientId : null,
          },
        });
        show('User updated');
        navigate('/super-admin/users');
      }
    } catch (err) {
      showError(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  }

  const isSelf = !isNew && user?.id === userId;
  const displayName = `${firstName} ${lastName}`.trim() || email || 'User';
  const headerActions: ActionMenuItem[] = isNew
    ? []
    : [
        {
          id: 'activate',
          label: 'Activate',
          hidden: isActive || isSelf,
          onSelect: () =>
            void mutations.setUserStatus
              .mutateAsync({ id: userId, isActive: true })
              .then(() => {
                setIsActive(true);
                show('User activated');
              })
              .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
        },
        {
          id: 'deactivate',
          label: 'Deactivate',
          hidden: !isActive || isSelf,
          destructive: true,
          onSelect: () =>
            requestConfirm({
              title: 'Deactivate User?',
              description: `${displayName} will no longer be able to access the platform.`,
              confirmLabel: 'Deactivate User',
              destructive: true,
              onConfirm: async () => {
                await mutations.setUserStatus.mutateAsync({ id: userId, isActive: false });
                setIsActive(false);
                show('User deactivated');
              },
            }),
        },
        {
          id: 'reset',
          label: 'Reset Password',
          separatorBefore: true,
          onSelect: () =>
            requestConfirm({
              title: 'Reset Password?',
              description: `A reset email will be sent to ${email}.`,
              confirmLabel: 'Reset Password',
              onConfirm: async () => {
                await mutations.resetUserPassword.mutateAsync(userId);
                show('Password reset emailed');
              },
            }),
        },
        {
          id: 'resend',
          label: 'Resend Invitation',
          onSelect: () =>
            void mutations.resendInvite
              .mutateAsync(userId)
              .then(() => show('Invitation resent'))
              .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
        },
        {
          id: 'audit',
          label: 'View Audit History',
          href: '/super-admin/audit-logs',
          separatorBefore: true,
        },
      ];

  return (
    <div>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <PageHeader
        title={isNew ? 'Create user' : 'Edit user'}
        actions={
          headerActions.length > 0 ? (
            <ActionMenu items={headerActions} label={`Actions for ${displayName}`} />
          ) : undefined
        }
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
          <Select
            value={role}
            onChange={(e) => {
              const next = e.target.value;
              setRole(next);
              if (next !== 'CLIENT') setClientId('');
            }}
            disabled={isSelf}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </label>
        {role === 'CLIENT' ? (
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Client account</span>
            <Select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              disabled={isSelf}
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Multiple users can be linked to the same client account.
            </p>
          </label>
        ) : null}
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
            disabled={isSelf}
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
      {confirmDialog}
    </div>
  );
}
