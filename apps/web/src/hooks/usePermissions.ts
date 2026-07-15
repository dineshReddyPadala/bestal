import { useCallback, useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function usePermissions() {
  const auth = useContext(AuthContext);
  const permissions = auth?.user?.permissions ?? [];

  const has = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  return useMemo(
    () => ({
      permissions,
      has,
      canManageUsers: has('users:write'),
    canDeleteCandidates: has('candidates:delete'),
    canApproveCandidates: has('candidates:approve'),
    canWriteCandidates: has('candidates:write'),
      canEditCandidatesLimited: has('candidates:edit_limited'),
      canViewPayRate: has('candidates:view_pay_rate'),
      canManageClients: has('clients:write'),
      canUploadEvaluation: has('evaluations:write'),
      canUploadBgv: has('background_checks:write'),
      canApproveBgv: has('background_checks:approve'),
      canReadBgv: has('background_checks:read'),
      isPlatformAdmin: has('admin:platform'),
    }),
    [has, permissions],
  );
}
