import { DeploymentManagementView } from '../../components/deployments/DeploymentManagementView';

export function DeploymentsPage() {
  return (
    <DeploymentManagementView
      title="Deployment Management"
      description="Active placements with bill rate, pay rate, margin, and lifecycle controls"
    />
  );
}
