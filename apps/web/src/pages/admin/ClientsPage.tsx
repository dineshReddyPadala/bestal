import { ClientManagementView } from '../../components/clients/ClientManagementView';

export function ClientsPage() {
  return (
    <ClientManagementView
      title="Client Management"
      description="Enterprise accounts, spend, contacts, and deployment activity"
      clientDetailBasePath="/admin/clients"
    />
  );
}
