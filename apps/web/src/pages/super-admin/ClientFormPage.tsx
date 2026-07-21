import { Button, Input, PageHeader, Select } from '@bestal/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminClient, useAdminMutations, useAdminUsers } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

export function SuperAdminClientFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const clientId = isNew ? 0 : Number(id);
  const navigate = useNavigate();
  const { show, showError } = useDemoToast();
  const { data, isLoading } = useAdminClient(clientId);
  const { data: usersData } = useAdminUsers({ limit: 100 });
  const mutations = useAdminMutations();
  const managers = ((usersData?.data ?? []) as Array<Record<string, unknown>>).filter(
    (u) => u.role === 'SALES' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN',
  );

  const [form, setForm] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    headquarters: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    accountManagerId: '',
    status: 'PROSPECT',
    paymentTerms: '',
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
      primaryContactEmail: String(data.contactEmail ?? ''),
      primaryContactPhone: String(data.contactPhone ?? ''),
      accountManagerId: data.accountManagerId != null ? String(data.accountManagerId) : '',
      status: String(data.status ?? 'PROSPECT'),
      paymentTerms: String(data.paymentTerms ?? ''),
      notes: String(data.notes ?? ''),
    });
  }, [data, isNew]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body = {
      ...form,
      accountManagerId: form.accountManagerId ? Number(form.accountManagerId) : undefined,
    };
    try {
      if (isNew) {
        await mutations.createClient.mutateAsync(body);
        show('Client created');
      } else {
        await mutations.updateClient.mutateAsync({ id: clientId, body });
        show('Client updated');
      }
      navigate('/super-admin/clients');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <PageHeader title={isNew ? 'Create client' : 'Edit client'} />
      <form onSubmit={onSubmit} className="grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
        {(
          [
            ['companyName', 'Company name', true],
            ['website', 'Website', false],
            ['industry', 'Industry', false],
            ['companySize', 'Company size', false],
            ['headquarters', 'Headquarters', false],
            ['primaryContactName', 'Primary contact name', false],
            ['primaryContactEmail', 'Primary contact email', false],
            ['primaryContactPhone', 'Primary contact phone', false],
            ['paymentTerms', 'Payment terms', false],
          ] as const
        ).map(([key, label, required]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="font-medium">{label}</span>
            <Input value={form[key]} onChange={(e) => set(key, e.target.value)} required={required} />
          </label>
        ))}
        <label className="space-y-1 text-sm">
          <span className="font-medium">Status</span>
          <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
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
          >
            <option value="">— None —</option>
            {managers.map((m) => (
              <option key={String(m.id)} value={String(m.id)}>
                {String(m.firstName)} {String(m.lastName)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Notes</span>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/super-admin/clients')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
