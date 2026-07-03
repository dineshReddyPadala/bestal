import { ClientManagementView } from '../../components/clients/ClientManagementView';

export function ClientsPage() {
  return (
    <ClientManagementView
      title="Client Management"
      description="Manage enterprise accounts, spend, and engagement history"
      clientDetailBasePath="/sales/clients"
    />
  );
}
