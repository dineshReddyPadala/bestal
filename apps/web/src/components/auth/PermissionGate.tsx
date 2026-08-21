import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

type PermissionGateProps = {
  permission: string;
  redirectTo: string;
  children: ReactNode;
};

export function PermissionGate({ permission, redirectTo, children }: PermissionGateProps) {
  const { has, permissions } = usePermissions();

  if (permissions.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!has(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
