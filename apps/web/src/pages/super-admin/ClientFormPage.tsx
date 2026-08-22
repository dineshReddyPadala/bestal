import { Button, Input, PageHeader, Select } from '@bestal/ui';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminClient, useAdminMutations } from '../../hooks/api/useAdmin';
import { clientsApi } from '../../lib/api/clients';
import { useDemoToast } from '../../lib/use-demo-toast';

const REQUIRED_FIELDS = [
  'companyName',
  'website',
  'industry',
  'primaryContactName',
  'primaryContactEmail',
  'primaryContactPhone',
] as const;

export function SuperAdminClientFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = !id || id === 'new';
  const clientId = isNew ? 0 : Number(id);
  const isEdit = isNew || location.pathname.endsWith('/edit');
  const isView = !isNew && !isEdit;
  const navigate = useNavigate();
  const { show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { data, isLoading } = useAdminClient(clientId);
  const { data: managersData } = useQuery({
    queryKey: ['clients', 'account-managers'],
    queryFn: async () => (await clientsApi.listAccountManagers()).data,
  });
  const mutations = useAdminMutations();
  const managers = managersData ?? [];

  const [form, setForm] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    headquarters: '',
    primaryContactName: '',
    primaryContactDesignation: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    accountManagerId: '',
    status: 'PROSPECT',
    notes: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data || isNew) return;
    setForm({
      companyName: String(data.name ?? ''),
      website: String(data.website ?? ''),
      industry: String(data.industry ?? ''),
      companySize: String(data.companySize ?? ''),
      headquarters: String(data.headquarters ?? ''),
      primaryContactName: String(data.contactName ?? ''),
      primaryContactDesignation: String(data.contactDesignation ?? ''),
      primaryContactEmail: String(data.contactEmail ?? ''),
      primaryContactPhone: String(data.contactPhone ?? ''),
      accountManagerId: data.accountManagerId != null ? String(data.accountManagerId) : '',
      status: String(data.status ?? 'PROSPECT'),
      notes: String(data.notes ?? ''),
    });
  }, [data, isNew, clientId, isEdit]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    if (isView) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isView) return;

    for (const key of REQUIRED_FIELDS) {
      if (!form[key].trim()) {
        showError('Company name, website, industry, and primary contact fields are required');
        return;
      }
    }

    setBusy(true);
    const body = {
      ...form,
      accountManagerId: form.accountManagerId ? Number(form.accountManagerId) : undefined,
    };
    try {
      if (isNew) {
        await mutations.createClient.mutateAsync(body);
        show('Client created');
        navigate('/super-admin/clients');
      } else {
        await mutations.updateClient.mutateAsync({ id: clientId, body });
        show('Client updated');
        navigate(`/super-admin/clients/${clientId}`);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  const title = isNew ? 'Create client' : isView ? 'View client' : 'Edit client';
  const active = form.status === 'ACTIVE';

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          isView ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" to={`/super-admin/clients/${clientId}/edit`}>
                Edit client
              </Button>
              {active ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() =>
                    requestConfirm({
                      title: 'Suspend Client?',
                      description: `${form.companyName || 'This client'} will lose portal access until reactivated.`,
                      confirmLabel: 'Suspend Client',
                      destructive: true,
                      onConfirm: async () => {
                        await mutations.setClientStatus.mutateAsync({
                          id: clientId,
                          status: 'SUSPENDED',
                        });
                        setForm((prev) => ({ ...prev, status: 'SUSPENDED' }));
                        show('Client suspended');
                      },
                    })
                  }
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void mutations.setClientStatus
                      .mutateAsync({ id: clientId, status: 'ACTIVE' })
                      .then(() => {
                        setForm((prev) => ({ ...prev, status: 'ACTIVE' }));
                        show('Client activated');
                      })
                      .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
                  }
                >
                  Activate
                </Button>
              )}
            </div>
          ) : undefined
        }
      />
      <form onSubmit={onSubmit} className="grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
        {(
          [
            ['companyName', 'Company name', true],
            ['website', 'Website', true],
            ['industry', 'Industry', true],
            ['companySize', 'Company size', false],
            ['headquarters', 'Headquarters', false],
            ['primaryContactName', 'Primary contact name', true],
            ['primaryContactDesignation', 'Designation', false],
            ['primaryContactEmail', 'Primary contact email', true],
            ['primaryContactPhone', 'Primary contact phone', true],
          ] as const
        ).map(([key, label, required]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="font-medium">
              {label}
              {required ? ' *' : ''}
            </span>
            <Input
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              required={required && isEdit}
              disabled={isView}
              type={key === 'primaryContactEmail' ? 'email' : 'text'}
            />
          </label>
        ))}
        <label className="space-y-1 text-sm">
          <span className="font-medium">Status</span>
          <Select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            disabled={isView}
          >
            {['PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Account manager</span>
          <Select
            value={form.accountManagerId}
            onChange={(e) => set('accountManagerId', e.target.value)}
            disabled={isView}
          >
            <option value="">— None —</option>
            {managers.map((m) => (
              <option key={String(m.id)} value={String(m.id)}>
                {m.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Notes</span>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            disabled={isView}
          />
        </label>
        <div className="flex gap-2 sm:col-span-2">
          {isEdit ? (
            <>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(isNew ? '/super-admin/clients' : `/super-admin/clients/${clientId}`)
                }
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => navigate('/super-admin/clients')}>
              Back to clients
            </Button>
          )}
        </div>
      </form>
      {confirmDialog}
    </div>
  );
}
