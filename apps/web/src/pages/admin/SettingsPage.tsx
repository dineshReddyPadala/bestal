import { Button, Card, CardContent, CardHeader, CardTitle, Input, PageHeader, Tabs } from '@bestal/ui';
import { useDemoToast } from '../../lib/use-demo-toast';

export function SettingsPage() {
  const { message, show } = useDemoToast();

  return (
    <div>
      <PageHeader title="Settings" />

      {message && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      )}

      <div className="p-6">
        <Tabs
          tabs={[
            {
              id: 'general',
              label: 'General',
              content: (
                <Card>
                  <CardHeader>
                    <CardTitle>General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="platform-name" className="text-sm font-medium">
                        Platform name
                      </label>
                      <Input id="platform-name" defaultValue="BesTal" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="support-email" className="text-sm font-medium">
                        Support email
                      </label>
                      <Input id="support-email" type="email" defaultValue="support@bestal.com" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="default-currency" className="text-sm font-medium">
                        Default currency
                      </label>
                      <Input id="default-currency" defaultValue="USD" />
                    </div>
                  </CardContent>
                </Card>
              ),
            },
            {
              id: 'security',
              label: 'Security',
              content: (
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium">Require MFA for admins</p>
                        <p className="text-sm text-muted-foreground">
                          Enforce multi-factor authentication for all admin users
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input" />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium">Session timeout</p>
                        <p className="text-sm text-muted-foreground">
                          Auto-logout after 8 hours of inactivity
                        </p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input" />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium">IP allowlist for admin portal</p>
                        <p className="text-sm text-muted-foreground">
                          Restrict admin access to approved IP ranges
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 rounded border-input" />
                    </label>
                  </CardContent>
                </Card>
              ),
            },
            {
              id: 'notifications',
              label: 'Notifications',
              content: (
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="audit-retention" className="text-sm font-medium">
                        Audit log retention (days)
                      </label>
                      <Input id="audit-retention" type="number" defaultValue="365" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" defaultChecked className="rounded border-input" />
                      Email digest for critical audit events
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" defaultChecked className="rounded border-input" />
                      Notify admins on failed background checks
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-input" />
                      Slack alerts for trial completions
                    </label>
                  </CardContent>
                </Card>
              ),
            },
            {
              id: 'billing',
              label: 'Billing',
              content: (
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Margin</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="platform-margin" className="text-sm font-medium">
                        Default platform margin (%)
                      </label>
                      <Input id="platform-margin" type="number" defaultValue="28.6" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="invoice-terms" className="text-sm font-medium">
                        Invoice terms (days)
                      </label>
                      <Input id="invoice-terms" type="number" defaultValue="30" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" defaultChecked className="rounded border-input" />
                      Auto-generate invoices for active deployments
                    </label>
                  </CardContent>
                </Card>
              ),
            },
          ]}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="button" onClick={() => show('Settings saved (demo)')}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
