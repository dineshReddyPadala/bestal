import { clients } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Avatar,
  Card,
  CardContent,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Building2, MapPin, Rocket } from 'lucide-react';

export function ClientsPage() {
  return (
    <div>
      <PageHeader
        title="Clients"
        description="Enterprise accounts in your recruiting portfolio"
      />

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="transition-shadow hover:shadow-elevated">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar name={client.name} src={client.logoUrl} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <StatusBadge status={client.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{client.industry}</p>
                </div>
              </div>

              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {client.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  {client.employeeCount} employees
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Rocket className="h-4 w-4 shrink-0" />
                  {client.activeDeployments} active deployments
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">Account manager</span>
                <span className="text-sm font-medium">{client.accountManager}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total spend</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(client.totalSpend, client.currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
