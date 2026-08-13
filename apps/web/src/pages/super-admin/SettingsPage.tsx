import { Button, Dialog, Input, PageHeader, Select, Tabs, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type TextareaHTMLAttributes } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import {
  useAdminMutations,
  useAdminSettings,
  useAdminSkillCommunities,
} from '../../hooks/api/useAdmin';
import { adminApi } from '../../lib/api/admin';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../../components/ui/ToastHost';
import { getApiErrorMessage } from '../../lib/api/errors';

function workflowsFromApi(w: Record<string, unknown>) {
  return {
    enabled: Boolean(w.enabled),
    baseUrl: String(w.baseUrl ?? ''),
    resumeWorkflowPath: String(w.resumeWorkflowPath ?? ''),
    resumeWorkflowName: String(w.resumeWorkflowName ?? 'BESTAL_RESUME_AI_SCREENING'),
    resumeWorkflowVersion: String(w.resumeWorkflowVersion ?? '1.0.0'),
    evaluationWorkflowPath: String(w.evaluationWorkflowPath ?? ''),
    evaluationWorkflowName: String(w.evaluationWorkflowName ?? 'BESTAL_EVALUATION_AI_ANALYSIS'),
    evaluationWorkflowVersion: String(w.evaluationWorkflowVersion ?? '1.0.0'),
    bgvWorkflowPath: String(w.bgvWorkflowPath ?? ''),
    bgvWorkflowName: String(w.bgvWorkflowName ?? 'BESTAL_BGV_AI_ANALYSIS'),
    bgvWorkflowVersion: String(w.bgvWorkflowVersion ?? '1.0.0'),
    webhookSecret: String(w.webhookSecret ?? ''),
    requestTimeoutMs: String(w.requestTimeoutMs ?? '30000'),
  };
}

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
      {...props}
    />
  );
}

type SettingsKey =
  | 'security'
  | 'scoring'
  | 'pricing'
  | 'trials'
  | 'notifications'
  | 'integrations'
  | 'commercials'
  | 'workflows'
  | 'email'
  | 'localization';

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
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [saving, setSaving] = useState<SettingsKey | null>(null);
  const settingsHydrated = useRef(false);

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
  const [pricing, setPricing] = useState({
    defaultPayRate: '',
    defaultBillRate: '',
    minMarginPercent: '20',
    currency: 'USD',
    supportedCurrencies: 'USD,EUR,GBP,INR',
  });
  const [email, setEmail] = useState({
    enabled: false,
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    password: '',
    fromAddress: '',
    fromName: 'BesTal',
    secure: false,
  });
  const [localization, setLocalization] = useState({
    dateFormat: 'MMM d, yyyy',
    locale: 'en-US',
  });
  const [integrations, setIntegrations] = useState({
    oorwinEnabled: false,
    oorwinApiUrl: '',
    webhookUrl: '',
    smsProvider: 'none',
    smsApiKey: '',
    smsSenderId: '',
    whatsAppPhoneNumberId: '',
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
  const [trials, setTrials] = useState({ freeTrialHours: '20' });
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    trialEndingSoonDays: '2',
    deploymentEndingSoonDays: '7',
  });
  const [workflows, setWorkflows] = useState(() =>
    workflowsFromApi({
      resumeWorkflowName: 'BESTAL_RESUME_AI_SCREENING',
      resumeWorkflowVersion: '1.0.0',
      evaluationWorkflowName: 'BESTAL_EVALUATION_AI_ANALYSIS',
      evaluationWorkflowVersion: '1.0.0',
      bgvWorkflowName: 'BESTAL_BGV_AI_ANALYSIS',
      bgvWorkflowVersion: '1.0.0',
    }),
  );

  useEffect(() => {
    if (!data || settingsHydrated.current) return;
    settingsHydrated.current = true;
    const s = asObj(data.security);
    const sc = asObj(data.scoring);
    const pr = asObj(data.pricing);
    const em = asObj(data.email);
    const loc = asObj(data.localization);
    const i = asObj(data.integrations);
    const c = asObj(data.commercials);
    const t = asObj(data.trials);
    const n = asObj(data.notifications);
    const w = asObj(data.workflows);

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
    setPricing({
      defaultPayRate: String(pr.defaultPayRate ?? ''),
      defaultBillRate: String(pr.defaultBillRate ?? ''),
      minMarginPercent: String(pr.minMarginPercent ?? '20'),
      currency: String(pr.currency ?? 'USD'),
      supportedCurrencies: Array.isArray(pr.supportedCurrencies)
        ? (pr.supportedCurrencies as string[]).join(',')
        : 'USD,EUR,GBP,INR',
    });
    setEmail({
      enabled: Boolean(em.enabled),
      host: String(em.host ?? 'smtp.gmail.com'),
      port: String(em.port ?? '587'),
      user: String(em.user ?? ''),
      password: String(em.password ?? ''),
      fromAddress: String(em.fromAddress ?? ''),
      fromName: String(em.fromName ?? 'BesTal'),
      secure: Boolean(em.secure),
    });
    setLocalization({
      dateFormat: String(loc.dateFormat ?? 'MMM d, yyyy'),
      locale: String(loc.locale ?? 'en-US'),
    });
    setIntegrations({
      oorwinEnabled: Boolean(i.oorwinEnabled),
      oorwinApiUrl: String(i.oorwinApiUrl ?? ''),
      webhookUrl: String(i.webhookUrl ?? ''),
      smsProvider: String(i.smsProvider ?? 'none'),
      smsApiKey: String(i.smsApiKey ?? ''),
      smsSenderId: String(i.smsSenderId ?? ''),
      whatsAppPhoneNumberId: String(i.whatsAppPhoneNumberId ?? ''),
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
    setTrials({
      freeTrialHours: String(t.freeTrialHours ?? '20'),
    });
    setNotifications({
      emailEnabled: n.emailEnabled === undefined ? true : Boolean(n.emailEnabled),
      trialEndingSoonDays: String(n.trialEndingSoonDays ?? '2'),
      deploymentEndingSoonDays: String(n.deploymentEndingSoonDays ?? '7'),
    });
    setWorkflows(workflowsFromApi(w));
  }, [data]);

  async function save(key: SettingsKey, body: Record<string, unknown>, label: string) {
    setSaving(key);
    try {
      const result = (await mutations.putSetting.mutateAsync({ key, body })) as {
        key?: string;
        value?: unknown;
      };
      if (key === 'workflows' && result?.value && typeof result.value === 'object') {
        setWorkflows(workflowsFromApi(result.value as Record<string, unknown>));
      }
      show(`${label} saved`);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(null);
    }
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading platform settings…</p>;
  }

  return (
    <div>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <PageHeader
        title="Platform Settings"
      />
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
              id: 'trials',
              label: 'Trials',
              content: (
                <Section
                  title="Free trial settings"
                  busy={saving === 'trials'}
                  onSave={() =>
                    void save(
                      'trials',
                      {
                        freeTrialHours: Number(trials.freeTrialHours) || 20,
                      },
                      'Trial settings',
                    )
                  }
                >
                  <Field label="Free trial hours (default per request)">
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={trials.freeTrialHours}
                      onChange={(e) =>
                        setTrials((p) => ({ ...p, freeTrialHours: e.target.value }))
                      }
                    />
                  </Field>
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    Applied as the default max hours when a client or staff creates a free trial
                    request without specifying hours.
                  </p>
                </Section>
              ),
            },
            {
              id: 'notifications',
              label: 'Notifications',
              content: (
                <Section
                  title="Reminders & email"
                  busy={saving === 'notifications'}
                  onSave={() =>
                    void save(
                      'notifications',
                      {
                        emailEnabled: notifications.emailEnabled,
                        trialEndingSoonDays: Number(notifications.trialEndingSoonDays) || 0,
                        deploymentEndingSoonDays:
                          Number(notifications.deploymentEndingSoonDays) || 0,
                        importNotifyRoles: ['SUPER_ADMIN', 'ADMIN', 'RECRUITER'],
                      },
                      'Notification settings',
                    )
                  }
                >
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={notifications.emailEnabled}
                      onChange={(e) =>
                        setNotifications((p) => ({ ...p, emailEnabled: e.target.checked }))
                      }
                    />
                    Send email notifications (in addition to in-app)
                  </label>
                  <Field label="Trial ending soon (days before end)">
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={notifications.trialEndingSoonDays}
                      onChange={(e) =>
                        setNotifications((p) => ({
                          ...p,
                          trialEndingSoonDays: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Deployment ending soon (days before end)">
                    <Input
                      type="number"
                      min={0}
                      max={90}
                      value={notifications.deploymentEndingSoonDays}
                      onChange={(e) =>
                        setNotifications((p) => ({
                          ...p,
                          deploymentEndingSoonDays: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </Section>
              ),
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
                        supportedCurrencies: pricing.supportedCurrencies
                          .split(',')
                          .map((value) => value.trim())
                          .filter(Boolean),
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
                      {(pricing.supportedCurrencies || 'USD,EUR,GBP,INR')
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean)
                        .map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                    </Select>
                  </Field>
                  <Field label="Supported currencies (comma-separated)" className="sm:col-span-2">
                    <Input
                      value={pricing.supportedCurrencies}
                      onChange={(e) =>
                        setPricing((p) => ({ ...p, supportedCurrencies: e.target.value }))
                      }
                      placeholder="USD,EUR,GBP,INR"
                    />
                  </Field>
                </Section>
              ),
            },
            {
              id: 'workflows',
              label: 'Automation',
              content: (
                <Section
                  title="n8n workflow configuration"
                  busy={saving === 'workflows'}
                  onSave={() => {
                    if (workflows.enabled) {
                      if (!workflows.baseUrl.trim()) {
                        showError('n8n base URL is required when workflows are enabled');
                        return;
                      }
                      if (!workflows.webhookSecret.trim()) {
                        showError(
                          'Webhook secret is required when workflows are enabled (leave blank only after one is already saved)',
                        );
                        return;
                      }
                      if (
                        !workflows.resumeWorkflowPath.trim() &&
                        !workflows.evaluationWorkflowPath.trim() &&
                        !workflows.bgvWorkflowPath.trim()
                      ) {
                        showError(
                          'Enter at least one workflow webhook path when workflows are enabled',
                        );
                        return;
                      }
                    }
                    void save(
                      'workflows',
                      {
                        enabled: workflows.enabled,
                        baseUrl: workflows.baseUrl.trim() || null,
                        resumeWorkflowPath: workflows.resumeWorkflowPath.trim() || null,
                        resumeWorkflowName: workflows.resumeWorkflowName.trim() || null,
                        resumeWorkflowVersion: workflows.resumeWorkflowVersion.trim() || null,
                        evaluationWorkflowPath:
                          workflows.evaluationWorkflowPath.trim() || null,
                        evaluationWorkflowName:
                          workflows.evaluationWorkflowName.trim() || null,
                        evaluationWorkflowVersion:
                          workflows.evaluationWorkflowVersion.trim() || null,
                        bgvWorkflowPath: workflows.bgvWorkflowPath.trim() || null,
                        bgvWorkflowName: workflows.bgvWorkflowName.trim() || null,
                        bgvWorkflowVersion: workflows.bgvWorkflowVersion.trim() || null,
                        webhookSecret: workflows.webhookSecret.trim() || null,
                        requestTimeoutMs: Number(workflows.requestTimeoutMs) || 30000,
                      },
                      'Automation workflows',
                    );
                  }}
                >
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={workflows.enabled}
                      onChange={(e) =>
                        setWorkflows((p) => ({ ...p, enabled: e.target.checked }))
                      }
                    />
                    Enable n8n automation workflows
                  </label>
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    When enabled, base URL, webhook secret, and at least one webhook path are
                    required. You can fill in the fields below before checking this box.
                  </p>
                  <Field label="n8n base URL" className="sm:col-span-2">
                    <Input
                      value={workflows.baseUrl}
                      onChange={(e) =>
                        setWorkflows((p) => ({ ...p, baseUrl: e.target.value }))
                      }
                      placeholder="https://your-instance.app.n8n.cloud"
                    />
                  </Field>
                  <Field label="Resume screening webhook path">
                    <Input
                      value={workflows.resumeWorkflowPath}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          resumeWorkflowPath: e.target.value,
                        }))
                      }
                      placeholder="/webhook/resume-screening"
                    />
                  </Field>
                  <Field label="Resume workflow name">
                    <Input
                      value={workflows.resumeWorkflowName}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          resumeWorkflowName: e.target.value,
                        }))
                      }
                      placeholder="BESTAL_RESUME_AI_SCREENING"
                    />
                  </Field>
                  <Field label="Resume workflow version">
                    <Input
                      value={workflows.resumeWorkflowVersion}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          resumeWorkflowVersion: e.target.value,
                        }))
                      }
                      placeholder="1.0.0"
                    />
                  </Field>
                  <Field label="Evaluation analysis webhook path">
                    <Input
                      value={workflows.evaluationWorkflowPath}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          evaluationWorkflowPath: e.target.value,
                        }))
                      }
                      placeholder="/webhook/evaluation-analysis"
                    />
                  </Field>
                  <Field label="Evaluation workflow name">
                    <Input
                      value={workflows.evaluationWorkflowName}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          evaluationWorkflowName: e.target.value,
                        }))
                      }
                      placeholder="BESTAL_EVALUATION_AI_ANALYSIS"
                    />
                  </Field>
                  <Field label="Evaluation workflow version">
                    <Input
                      value={workflows.evaluationWorkflowVersion}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          evaluationWorkflowVersion: e.target.value,
                        }))
                      }
                      placeholder="1.0.0"
                    />
                  </Field>
                  <Field label="BGV analysis webhook path">
                    <Input
                      value={workflows.bgvWorkflowPath}
                      onChange={(e) =>
                        setWorkflows((p) => ({ ...p, bgvWorkflowPath: e.target.value }))
                      }
                      placeholder="/webhook/bgv-analysis"
                    />
                  </Field>
                  <Field label="BGV workflow name">
                    <Input
                      value={workflows.bgvWorkflowName}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          bgvWorkflowName: e.target.value,
                        }))
                      }
                      placeholder="BESTAL_BGV_AI_ANALYSIS"
                    />
                  </Field>
                  <Field label="BGV workflow version">
                    <Input
                      value={workflows.bgvWorkflowVersion}
                      onChange={(e) =>
                        setWorkflows((p) => ({
                          ...p,
                          bgvWorkflowVersion: e.target.value,
                        }))
                      }
                      placeholder="1.0.0"
                    />
                  </Field>
                  <Field label="Webhook secret (Fastify → n8n)">
                    <Input
                      type="password"
                      value={workflows.webhookSecret}
                      onChange={(e) =>
                        setWorkflows((p) => ({ ...p, webhookSecret: e.target.value }))
                      }
                      placeholder="Required when enabling workflows; leave as ******** to keep existing"
                    />
                  </Field>
                  <Field label="Request timeout (ms)">
                    <Input
                      type="number"
                      min={5000}
                      max={120000}
                      value={workflows.requestTimeoutMs}
                      onChange={(e) =>
                        setWorkflows((p) => ({ ...p, requestTimeoutMs: e.target.value }))
                      }
                    />
                  </Field>
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    Workflow name and version are sent to n8n on each trigger and stored on
                    automation jobs. Inbound callback auth ({'`'}AUTOMATION_CALLBACK_SECRET{'`'})
                    remains in server environment variables. Re-import n8n workflow JSON after
                    changing paths.
                  </p>
                </Section>
              ),
            },
            {
              id: 'localization',
              label: 'Localization',
              content: (
                <Section
                  title="Date & locale"
                  busy={saving === 'localization'}
                  onSave={() =>
                    void save(
                      'localization',
                      {
                        dateFormat: localization.dateFormat,
                        locale: localization.locale,
                      },
                      'Localization settings',
                    )
                  }
                >
                  <Field label="Date format">
                    <Select
                      value={localization.dateFormat}
                      onChange={(e) =>
                        setLocalization((p) => ({ ...p, dateFormat: e.target.value }))
                      }
                    >
                      <option value="MMM d, yyyy">Aug 12, 2026</option>
                      <option value="dd/MM/yyyy">12/08/2026</option>
                      <option value="yyyy-MM-dd">2026-08-12</option>
                    </Select>
                  </Field>
                  <Field label="Locale">
                    <Select
                      value={localization.locale}
                      onChange={(e) => setLocalization((p) => ({ ...p, locale: e.target.value }))}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="en-IN">English (India)</option>
                      <option value="de-DE">German</option>
                    </Select>
                  </Field>
                </Section>
              ),
            },
            {
              id: 'email',
              label: 'Email & SMS',
              content: (
                <div className="space-y-6">
                  <Section
                    title="SMTP configuration"
                    busy={saving === 'email'}
                    onSave={() =>
                      void save(
                        'email',
                        {
                          enabled: email.enabled,
                          host: email.host.trim(),
                          port: Number(email.port) || 587,
                          user: email.user.trim() || null,
                          password: email.password.trim() || null,
                          fromAddress: email.fromAddress.trim() || null,
                          fromName: email.fromName.trim() || null,
                          secure: email.secure,
                        },
                        'Email settings',
                      )
                    }
                  >
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={email.enabled}
                        onChange={(e) => setEmail((p) => ({ ...p, enabled: e.target.checked }))}
                      />
                      Use platform SMTP settings (falls back to server env when disabled)
                    </label>
                    <Field label="SMTP host">
                      <Input
                        value={email.host}
                        onChange={(e) => setEmail((p) => ({ ...p, host: e.target.value }))}
                      />
                    </Field>
                    <Field label="SMTP port">
                      <Input
                        type="number"
                        value={email.port}
                        onChange={(e) => setEmail((p) => ({ ...p, port: e.target.value }))}
                      />
                    </Field>
                    <Field label="SMTP user">
                      <Input
                        value={email.user}
                        onChange={(e) => setEmail((p) => ({ ...p, user: e.target.value }))}
                      />
                    </Field>
                    <Field label="SMTP password">
                      <Input
                        type="password"
                        value={email.password}
                        onChange={(e) => setEmail((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Leave as ******** to keep existing"
                      />
                    </Field>
                    <Field label="From address">
                      <Input
                        value={email.fromAddress}
                        onChange={(e) => setEmail((p) => ({ ...p, fromAddress: e.target.value }))}
                      />
                    </Field>
                    <Field label="From name">
                      <Input
                        value={email.fromName}
                        onChange={(e) => setEmail((p) => ({ ...p, fromName: e.target.value }))}
                      />
                    </Field>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={email.secure}
                        onChange={(e) => setEmail((p) => ({ ...p, secure: e.target.checked }))}
                      />
                      Use TLS/SSL (port 465)
                    </label>
                    <div className="sm:col-span-2">
                      <EmailTestButton />
                    </div>
                  </Section>
                  <Section
                    title="SMS / WhatsApp"
                    busy={saving === 'integrations'}
                    onSave={() =>
                      void save(
                        'integrations',
                        {
                          oorwinEnabled: integrations.oorwinEnabled,
                          oorwinApiUrl: integrations.oorwinApiUrl.trim() || null,
                          webhookUrl: integrations.webhookUrl.trim() || null,
                          smsProvider: integrations.smsProvider,
                          smsApiKey: integrations.smsApiKey.trim() || null,
                          smsSenderId: integrations.smsSenderId.trim() || null,
                          whatsAppPhoneNumberId:
                            integrations.whatsAppPhoneNumberId.trim() || null,
                        },
                        'Integration settings',
                      )
                    }
                  >
                    <Field label="SMS provider">
                      <Select
                        value={integrations.smsProvider}
                        onChange={(e) =>
                          setIntegrations((p) => ({ ...p, smsProvider: e.target.value }))
                        }
                      >
                        <option value="none">None</option>
                        <option value="twilio">Twilio</option>
                        <option value="whatsapp">WhatsApp Business</option>
                      </Select>
                    </Field>
                    <Field label="API key">
                      <Input
                        type="password"
                        value={integrations.smsApiKey}
                        onChange={(e) =>
                          setIntegrations((p) => ({ ...p, smsApiKey: e.target.value }))
                        }
                        placeholder="Leave as ******** to keep existing"
                      />
                    </Field>
                    <Field label="Sender ID / phone">
                      <Input
                        value={integrations.smsSenderId}
                        onChange={(e) =>
                          setIntegrations((p) => ({ ...p, smsSenderId: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="WhatsApp phone number ID">
                      <Input
                        value={integrations.whatsAppPhoneNumberId}
                        onChange={(e) =>
                          setIntegrations((p) => ({
                            ...p,
                            whatsAppPhoneNumberId: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </Section>
                </div>
              ),
            },
            {
              id: 'templates',
              label: 'Templates',
              content: <CommunicationTemplatesPanel />,
            },
            {
              id: 'integrations',
              label: 'Integrations',
              content: (
                <Section
                  title="Configure integrations"
                  busy={saving === 'integrations'}
                  onSave={() =>
                    void save(
                      'integrations',
                      {
                        oorwinEnabled: integrations.oorwinEnabled,
                        oorwinApiUrl: integrations.oorwinApiUrl.trim() || null,
                        webhookUrl: integrations.webhookUrl.trim() || null,
                        smsProvider: integrations.smsProvider,
                        smsApiKey: integrations.smsApiKey.trim() || null,
                        smsSenderId: integrations.smsSenderId.trim() || null,
                        whatsAppPhoneNumberId:
                          integrations.whatsAppPhoneNumberId.trim() || null,
                      },
                      'Integrations',
                    )
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

function EmailTestButton() {
  const { show, showError } = useDemoToast();
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field label="Send test email to" className="min-w-[16rem] flex-1">
        <Input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="you@company.com"
        />
      </Field>
      <Button
        type="button"
        disabled={busy || !to.trim()}
        onClick={() => {
          setBusy(true);
          void adminApi
            .sendTestEmail(to.trim())
            .then((result) => {
              show(result.sent ? 'Test email sent' : 'SMTP not configured — check settings');
            })
            .catch((err) => showError(getApiErrorMessage(err, 'Test email failed')))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? 'Sending…' : 'Send test'}
      </Button>
    </div>
  );
}

function CommunicationTemplatesPanel() {
  const { show, showError } = useDemoToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['communication-templates'],
    queryFn: () => adminApi.listCommunicationTemplates(),
  });
  const templates = data ?? [];
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const selected = templates.find((template) => template.key === selectedKey);
    if (!selected) return;
    setSubject(selected.subject ?? '');
    setBody(selected.body);
  }, [selectedKey, templates]);

  useEffect(() => {
    if (!selectedKey && templates.length > 0) {
      setSelectedKey(templates[0]!.key);
    }
  }, [selectedKey, templates]);

  async function saveTemplate() {
    if (!selectedKey) return;
    const selected = templates.find((template) => template.key === selectedKey);
    if (!selected) return;
    setBusy(true);
    try {
      await adminApi.upsertCommunicationTemplate({
        key: selectedKey,
        channel: selected.channel as 'EMAIL' | 'SMS' | 'IN_APP',
        subject: subject.trim() || null,
        body,
        variables: selected.variables,
      });
      show('Template saved');
      await refetch();
    } catch (err) {
      showError(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading templates…</p>;
  }

  return (
    <Section title="Notification templates" busy={busy} onSave={() => void saveTemplate()}>
      <Field label="Template">
        <Select value={selectedKey ?? ''} onChange={(e) => setSelectedKey(e.target.value)}>
          {templates.map((template) => (
            <option key={template.key} value={template.key}>
              {template.key}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Subject (email)">
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Body" className="sm:col-span-2">
        <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <p className="text-sm text-muted-foreground sm:col-span-2">
        Use placeholders like {'{{candidateName}}'} — available variables are listed per template
        in the database seed.
      </p>
    </Section>
  );
}

function SkillCommunitiesPanel() {
  const { message, variant, show, showError, dismiss } = useDemoToast();
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
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
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
