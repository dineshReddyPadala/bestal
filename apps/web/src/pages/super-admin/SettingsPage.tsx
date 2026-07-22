import { Button, Dialog, Input, PageHeader, Select, Tabs, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState, type TextareaHTMLAttributes } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import {
  useAdminMutations,
  useAdminSettings,
  useAdminSkillCommunities,
} from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
      {...props}
    />
  );
}

type SettingsKey =
  | 'ai'
  | 'email'
  | 'security'
  | 'scoring'
  | 'prompts'
  | 'pricing'
  | 'notifications'
  | 'integrations'
  | 'commercials';

function asObj(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function SuperAdminPlatformSettingsPage() {
  const [params] = useSearchParams();
  const defaultTab = params.get('tab') ?? 'system';
  const { data, isLoading } = useAdminSettings();
  const mutations = useAdminMutations();
  const { message, show, showError } = useDemoToast();
  const [saving, setSaving] = useState<SettingsKey | null>(null);

  const [ai, setAi] = useState({ model: 'gpt-4o-mini', enabled: true, maxRetries: '2' });
  const [email, setEmail] = useState({
    fromName: 'BesTal',
    fromEmail: 'noreply@bestal.com',
    notifyApprovals: true,
    notifyTrials: true,
  });
  const [security, setSecurity] = useState({
    sessionTimeoutMinutes: '480',
    requireMfaForAdmins: false,
    passwordMinLength: '8',
  });
  const [scoring, setScoring] = useState({
    minPublishScore: '70',
    weightTechnical: '40',
    weightCommunication: '30',
    weightReliability: '30',
  });
  const [prompts, setPrompts] = useState({
    resumeExtraction: '',
    screening: '',
    evaluationSummary: '',
  });
  const [pricing, setPricing] = useState({
    defaultPayRate: '',
    defaultBillRate: '',
    minMarginPercent: '20',
    currency: 'USD',
  });
  const [notifications, setNotifications] = useState({
    approvalTemplate: '',
    trialTemplate: '',
    deploymentTemplate: '',
    bgvTemplate: '',
  });
  const [integrations, setIntegrations] = useState({
    oorwinEnabled: false,
    oorwinApiUrl: '',
    emailProvider: 'smtp',
    webhookUrl: '',
  });
  const [commercials, setCommercials] = useState({
    viewPayRate: true,
    viewBillRate: true,
    viewGrossMargin: true,
    editCommercialDetails: true,
    defaultPayRate: '',
    defaultBillRate: '',
    notes: '',
  });

  useEffect(() => {
    if (!data) return;
    const a = asObj(data.ai);
    const e = asObj(data.email);
    const s = asObj(data.security);
    const sc = asObj(data.scoring);
    const p = asObj(data.prompts);
    const pr = asObj(data.pricing);
    const n = asObj(data.notifications);
    const i = asObj(data.integrations);
    const c = asObj(data.commercials);

    setAi({
      model: String(a.model ?? 'gpt-4o-mini'),
      enabled: a.enabled === undefined ? true : Boolean(a.enabled),
      maxRetries: String(a.maxRetries ?? '2'),
    });
    setEmail({
      fromName: String(e.fromName ?? 'BesTal'),
      fromEmail: String(e.fromEmail ?? 'noreply@bestal.com'),
      notifyApprovals: e.notifyApprovals === undefined ? true : Boolean(e.notifyApprovals),
      notifyTrials: e.notifyTrials === undefined ? true : Boolean(e.notifyTrials),
    });
    setSecurity({
      sessionTimeoutMinutes: String(s.sessionTimeoutMinutes ?? '480'),
      requireMfaForAdmins: Boolean(s.requireMfaForAdmins),
      passwordMinLength: String(s.passwordMinLength ?? '8'),
    });
    setScoring({
      minPublishScore: String(sc.minPublishScore ?? '70'),
      weightTechnical: String(sc.weightTechnical ?? '40'),
      weightCommunication: String(sc.weightCommunication ?? '30'),
      weightReliability: String(sc.weightReliability ?? '30'),
    });
    setPrompts({
      resumeExtraction: String(p.resumeExtraction ?? ''),
      screening: String(p.screening ?? ''),
      evaluationSummary: String(p.evaluationSummary ?? ''),
    });
    setPricing({
      defaultPayRate: String(pr.defaultPayRate ?? ''),
      defaultBillRate: String(pr.defaultBillRate ?? ''),
      minMarginPercent: String(pr.minMarginPercent ?? '20'),
      currency: String(pr.currency ?? 'USD'),
    });
    setNotifications({
      approvalTemplate: String(n.approvalTemplate ?? ''),
      trialTemplate: String(n.trialTemplate ?? ''),
      deploymentTemplate: String(n.deploymentTemplate ?? ''),
      bgvTemplate: String(n.bgvTemplate ?? ''),
    });
    setIntegrations({
      oorwinEnabled: Boolean(i.oorwinEnabled),
      oorwinApiUrl: String(i.oorwinApiUrl ?? ''),
      emailProvider: String(i.emailProvider ?? 'smtp'),
      webhookUrl: String(i.webhookUrl ?? ''),
    });
    setCommercials({
      viewPayRate: c.viewPayRate === undefined ? true : Boolean(c.viewPayRate),
      viewBillRate: c.viewBillRate === undefined ? true : Boolean(c.viewBillRate),
      viewGrossMargin: c.viewGrossMargin === undefined ? true : Boolean(c.viewGrossMargin),
      editCommercialDetails:
        c.editCommercialDetails === undefined ? true : Boolean(c.editCommercialDetails),
      defaultPayRate: String(c.defaultPayRate ?? ''),
      defaultBillRate: String(c.defaultBillRate ?? ''),
      notes: String(c.notes ?? ''),
    });
  }, [data]);

  async function save(key: SettingsKey, body: Record<string, unknown>, label: string) {
    setSaving(key);
    try {
      await mutations.putSetting.mutateAsync({ key, body });
      show(`${label} saved`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(null);
    }
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading platform settings…</p>;
  }

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        description="Commercials, system configuration, scoring, communities, and integrations"
      />
      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      <div className="p-6">
        <Tabs
          defaultTab={defaultTab}
          tabs={[
            {
              id: 'system',
              label: 'System settings',
              content: (
                <div className="space-y-6">
                  <Section
                    title="AI runtime"
                    busy={saving === 'ai'}
                    onSave={() =>
                      void save(
                        'ai',
                        {
                          model: ai.model,
                          enabled: ai.enabled,
                          maxRetries: Number(ai.maxRetries) || 0,
                        },
                        'System AI settings',
                      )
                    }
                  >
                    <Field label="Model">
                      <Select
                        value={ai.model}
                        onChange={(e) => setAi((p) => ({ ...p, model: e.target.value }))}
                      >
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                      </Select>
                    </Field>
                    <Field label="Max retries">
                      <Input
                        type="number"
                        min={0}
                        max={5}
                        value={ai.maxRetries}
                        onChange={(e) => setAi((p) => ({ ...p, maxRetries: e.target.value }))}
                      />
                    </Field>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={ai.enabled}
                        onChange={(e) => setAi((p) => ({ ...p, enabled: e.target.checked }))}
                      />
                      Enable AI extraction / screening
                    </label>
                  </Section>
                  <Section
                    title="Email"
                    busy={saving === 'email'}
                    onSave={() => void save('email', { ...email }, 'Email settings')}
                  >
                    <Field label="From name">
                      <Input
                        value={email.fromName}
                        onChange={(e) => setEmail((p) => ({ ...p, fromName: e.target.value }))}
                      />
                    </Field>
                    <Field label="From email">
                      <Input
                        type="email"
                        value={email.fromEmail}
                        onChange={(e) => setEmail((p) => ({ ...p, fromEmail: e.target.value }))}
                      />
                    </Field>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={email.notifyApprovals}
                        onChange={(e) =>
                          setEmail((p) => ({ ...p, notifyApprovals: e.target.checked }))
                        }
                      />
                      Notify on candidate approvals
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={email.notifyTrials}
                        onChange={(e) =>
                          setEmail((p) => ({ ...p, notifyTrials: e.target.checked }))
                        }
                      />
                      Notify on trial updates
                    </label>
                  </Section>
                  <Section
                    title="Security"
                    busy={saving === 'security'}
                    onSave={() =>
                      void save(
                        'security',
                        {
                          sessionTimeoutMinutes: Number(security.sessionTimeoutMinutes) || 480,
                          requireMfaForAdmins: security.requireMfaForAdmins,
                          passwordMinLength: Number(security.passwordMinLength) || 8,
                        },
                        'Security settings',
                      )
                    }
                  >
                    <Field label="Session timeout (minutes)">
                      <Input
                        type="number"
                        min={15}
                        value={security.sessionTimeoutMinutes}
                        onChange={(e) =>
                          setSecurity((p) => ({ ...p, sessionTimeoutMinutes: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Minimum password length">
                      <Input
                        type="number"
                        min={6}
                        max={64}
                        value={security.passwordMinLength}
                        onChange={(e) =>
                          setSecurity((p) => ({ ...p, passwordMinLength: e.target.value }))
                        }
                      />
                    </Field>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={security.requireMfaForAdmins}
                        onChange={(e) =>
                          setSecurity((p) => ({ ...p, requireMfaForAdmins: e.target.checked }))
                        }
                      />
                      Require MFA for admin roles
                    </label>
                  </Section>
                </div>
              ),
            },
            {
              id: 'prompts',
              label: 'AI prompts',
              content: (
                <Section
                  title="Configure AI prompts"
                  busy={saving === 'prompts'}
                  onSave={() => void save('prompts', { ...prompts }, 'AI prompts')}
                >
                  <Field label="Resume extraction prompt" className="sm:col-span-2">
                    <Textarea
                      rows={4}
                      value={prompts.resumeExtraction}
                      onChange={(e) =>
                        setPrompts((p) => ({ ...p, resumeExtraction: e.target.value }))
                      }
                      placeholder="System prompt used when extracting candidate data from resumes"
                    />
                  </Field>
                  <Field label="Screening prompt" className="sm:col-span-2">
                    <Textarea
                      rows={4}
                      value={prompts.screening}
                      onChange={(e) => setPrompts((p) => ({ ...p, screening: e.target.value }))}
                      placeholder="Prompt for AI screening recommendations"
                    />
                  </Field>
                  <Field label="Evaluation summary prompt" className="sm:col-span-2">
                    <Textarea
                      rows={4}
                      value={prompts.evaluationSummary}
                      onChange={(e) =>
                        setPrompts((p) => ({ ...p, evaluationSummary: e.target.value }))
                      }
                      placeholder="Prompt for summarizing evaluation forms"
                    />
                  </Field>
                </Section>
              ),
            },
            {
              id: 'scoring',
              label: 'BesTal Score',
              content: (
                <Section
                  title="Configure BesTal Score rules"
                  busy={saving === 'scoring'}
                  onSave={() =>
                    void save(
                      'scoring',
                      {
                        minPublishScore: Number(scoring.minPublishScore) || 0,
                        weightTechnical: Number(scoring.weightTechnical) || 0,
                        weightCommunication: Number(scoring.weightCommunication) || 0,
                        weightReliability: Number(scoring.weightReliability) || 0,
                      },
                      'BesTal Score rules',
                    )
                  }
                >
                  <Field label="Minimum score to publish">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={scoring.minPublishScore}
                      onChange={(e) =>
                        setScoring((p) => ({ ...p, minPublishScore: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Technical weight (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={scoring.weightTechnical}
                      onChange={(e) =>
                        setScoring((p) => ({ ...p, weightTechnical: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Communication weight (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={scoring.weightCommunication}
                      onChange={(e) =>
                        setScoring((p) => ({ ...p, weightCommunication: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Reliability weight (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={scoring.weightReliability}
                      onChange={(e) =>
                        setScoring((p) => ({ ...p, weightReliability: e.target.value }))
                      }
                    />
                  </Field>
                </Section>
              ),
            },
            {
              id: 'communities',
              label: 'Skill Communities',
              content: <SkillCommunitiesPanel />,
            },
            {
              id: 'pricing',
              label: 'Pricing rules',
              content: (
                <Section
                  title="Configure pricing rules"
                  busy={saving === 'pricing'}
                  onSave={() =>
                    void save(
                      'pricing',
                      {
                        defaultPayRate: Number(pricing.defaultPayRate) || 0,
                        defaultBillRate: Number(pricing.defaultBillRate) || 0,
                        minMarginPercent: Number(pricing.minMarginPercent) || 0,
                        currency: pricing.currency,
                      },
                      'Pricing rules',
                    )
                  }
                >
                  <Field label="Default pay rate">
                    <Input
                      type="number"
                      min={0}
                      value={pricing.defaultPayRate}
                      onChange={(e) => setPricing((p) => ({ ...p, defaultPayRate: e.target.value }))}
                    />
                  </Field>
                  <Field label="Default bill rate">
                    <Input
                      type="number"
                      min={0}
                      value={pricing.defaultBillRate}
                      onChange={(e) =>
                        setPricing((p) => ({ ...p, defaultBillRate: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Minimum margin (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={pricing.minMarginPercent}
                      onChange={(e) =>
                        setPricing((p) => ({ ...p, minMarginPercent: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Currency">
                    <Select
                      value={pricing.currency}
                      onChange={(e) => setPricing((p) => ({ ...p, currency: e.target.value }))}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </Select>
                  </Field>
                </Section>
              ),
            },
            {
              id: 'notifications',
              label: 'Notification templates',
              content: (
                <Section
                  title="Configure notification templates"
                  busy={saving === 'notifications'}
                  onSave={() =>
                    void save('notifications', { ...notifications }, 'Notification templates')
                  }
                >
                  {(
                    [
                      ['approvalTemplate', 'Approval template'],
                      ['trialTemplate', 'Trial template'],
                      ['deploymentTemplate', 'Deployment template'],
                      ['bgvTemplate', 'BGV template'],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label} className="sm:col-span-2">
                      <Textarea
                        rows={3}
                        value={notifications[key]}
                        onChange={(e) =>
                          setNotifications((p) => ({ ...p, [key]: e.target.value }))
                        }
                        placeholder={`Email / in-app template for ${label.toLowerCase()}`}
                      />
                    </Field>
                  ))}
                </Section>
              ),
            },
            {
              id: 'integrations',
              label: 'Integrations',
              content: (
                <Section
                  title="Configure integrations"
                  busy={saving === 'integrations'}
                  onSave={() =>
                    void save('integrations', { ...integrations }, 'Integrations')
                  }
                >
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={integrations.oorwinEnabled}
                      onChange={(e) =>
                        setIntegrations((p) => ({ ...p, oorwinEnabled: e.target.checked }))
                      }
                    />
                    Enable Oorwin integration
                  </label>
                  <Field label="Oorwin API URL" className="sm:col-span-2">
                    <Input
                      value={integrations.oorwinApiUrl}
                      onChange={(e) =>
                        setIntegrations((p) => ({ ...p, oorwinApiUrl: e.target.value }))
                      }
                      placeholder="https://…"
                    />
                  </Field>
                  <Field label="Email provider">
                    <Select
                      value={integrations.emailProvider}
                      onChange={(e) =>
                        setIntegrations((p) => ({ ...p, emailProvider: e.target.value }))
                      }
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="ses">Amazon SES</option>
                    </Select>
                  </Field>
                  <Field label="Webhook URL">
                    <Input
                      value={integrations.webhookUrl}
                      onChange={(e) =>
                        setIntegrations((p) => ({ ...p, webhookUrl: e.target.value }))
                      }
                      placeholder="https://…"
                    />
                  </Field>
                </Section>
              ),
            },
            {
              id: 'commercials',
              label: 'Commercials',
              content: (
                <Section
                  title="Commercials platform management"
                  busy={saving === 'commercials'}
                  onSave={() =>
                    void save(
                      'commercials',
                      {
                        ...commercials,
                        defaultPayRate: Number(commercials.defaultPayRate) || 0,
                        defaultBillRate: Number(commercials.defaultBillRate) || 0,
                      },
                      'Commercials',
                    )
                  }
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={commercials.viewPayRate}
                      onChange={(e) =>
                        setCommercials((p) => ({ ...p, viewPayRate: e.target.checked }))
                      }
                    />
                    View pay rate
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={commercials.viewBillRate}
                      onChange={(e) =>
                        setCommercials((p) => ({ ...p, viewBillRate: e.target.checked }))
                      }
                    />
                    View bill rate
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={commercials.viewGrossMargin}
                      onChange={(e) =>
                        setCommercials((p) => ({ ...p, viewGrossMargin: e.target.checked }))
                      }
                    />
                    View gross margin
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={commercials.editCommercialDetails}
                      onChange={(e) =>
                        setCommercials((p) => ({
                          ...p,
                          editCommercialDetails: e.target.checked,
                        }))
                      }
                    />
                    Edit commercial details
                  </label>
                  <Field label="Default pay rate">
                    <Input
                      type="number"
                      min={0}
                      value={commercials.defaultPayRate}
                      onChange={(e) =>
                        setCommercials((p) => ({ ...p, defaultPayRate: e.target.value }))
                      }
                      disabled={!commercials.editCommercialDetails}
                    />
                  </Field>
                  <Field label="Default bill rate">
                    <Input
                      type="number"
                      min={0}
                      value={commercials.defaultBillRate}
                      onChange={(e) =>
                        setCommercials((p) => ({ ...p, defaultBillRate: e.target.value }))
                      }
                      disabled={!commercials.editCommercialDetails}
                    />
                  </Field>
                  <Field label="Commercial notes" className="sm:col-span-2">
                    <Textarea
                      rows={3}
                      value={commercials.notes}
                      onChange={(e) => setCommercials((p) => ({ ...p, notes: e.target.value }))}
                      disabled={!commercials.editCommercialDetails}
                    />
                  </Field>
                </Section>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

/** @deprecated Use SuperAdminPlatformSettingsPage */
export const SuperAdminSettingsPage = SuperAdminPlatformSettingsPage;

function SkillCommunitiesPanel() {
  const { message, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { data, isLoading, isError, error } = useAdminSkillCommunities({ limit: 100 });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    candidateCount?: number;
  }>;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      { accessorKey: 'slug', header: 'Slug' },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const hasCandidates = (r.candidateCount ?? 0) > 0;
          const items: ActionMenuItem[] = [
            { id: 'view', label: 'View Community' },
            {
              id: 'activate',
              label: 'Activate',
              hidden: r.isActive,
              onSelect: () =>
                void mutations.setSkillCommunityStatus
                  .mutateAsync({ id: r.id, isActive: true })
                  .then(() => show('Community activated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'deactivate',
              label: 'Deactivate',
              hidden: !r.isActive,
              onSelect: () =>
                void mutations.setSkillCommunityStatus
                  .mutateAsync({ id: r.id, isActive: false })
                  .then(() => show('Community deactivated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'candidates',
              label: 'View Candidates',
              href: '/super-admin/candidates',
              separatorBefore: true,
            },
            {
              id: 'delete',
              label: 'Delete',
              destructive: true,
              separatorBefore: true,
              disabled: hasCandidates,
              disabledReason:
                'Cannot delete this community because candidates are currently assigned to it.',
              onSelect: () =>
                requestConfirm({
                  title: 'Delete Community?',
                  description: `${r.name} will be permanently deleted.`,
                  confirmLabel: 'Delete',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.deleteSkillCommunity.mutateAsync(r.id);
                    show('Community deleted');
                  },
                }),
            },
          ];
          return <ActionMenu items={items} label={`Actions for ${r.name}`} />;
        },
      },
    ],
    [mutations, requestConfirm, show, showError],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Configure Skill Communities</h3>
          <p className="text-xs text-muted-foreground">Create and manage talent communities</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed'}
        </div>
      )}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search communities…"
          pageSize={10}
          dense
        />
      )}
      {confirmDialog}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create skill community"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                void mutations.createSkillCommunity
                  .mutateAsync({
                    name,
                    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                    description,
                  })
                  .then(() => {
                    show('Created');
                    setOpen(false);
                    setName('');
                    setSlug('');
                    setDescription('');
                  })
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  children,
  onSave,
  busy,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  busy: boolean;
}) {
  return (
    <section className="rounded-xl border border-border/80 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button size="sm" onClick={onSave} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ''}`}>
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
