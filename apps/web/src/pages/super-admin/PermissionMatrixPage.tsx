import { Fragment } from 'react';
import { PageHeader } from '@bestal/ui';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminRoles } from '../../hooks/api/useAdmin';
import {
  PERMISSION_GROUPS,
  permissionLabel,
} from '../../lib/rbac/roles';

export function SuperAdminPermissionMatrixPage() {
  const { data, isLoading, isError, error } = useAdminRoles();
  const roles = ((data?.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    code: String(r.code),
    name: String(r.name),
    permissions: Array.isArray(r.permissions) ? (r.permissions as string[]) : [],
  }));

  return (
    <div>
      <PageHeader
        title="Permission Matrix"
        breadcrumbs={
          <Link to="/super-admin/roles" className="hover:text-foreground">
            Role Management
          </Link>
        }
      />

      <div className="space-y-4 px-6 pb-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading matrix…</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load roles'}
          </p>
        ) : (
          <div className="overflow-auto rounded-xl border border-border/80">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/95 px-3 py-2 text-left font-semibold">
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th key={role.code} className="min-w-[88px] px-2 py-2 text-center font-semibold">
                      <Link
                        to={`/super-admin/roles/${role.code}`}
                        className="hover:text-brand hover:underline"
                        title={role.name}
                      >
                        {role.name}
                      </Link>
                      <div className="mt-0.5 text-[10px] font-normal text-muted-foreground">
                        {role.code}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) => (
                  <Fragment key={group.id}>
                    <tr className="border-b border-border bg-muted/20">
                      <td
                        colSpan={roles.length + 1}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {group.permissions.map((permission) => (
                      <tr key={permission} className="border-b border-border/60 hover:bg-muted/20">
                        <td className="sticky left-0 z-10 bg-background px-3 py-1.5">
                          <div className="font-medium">{permissionLabel(permission)}</div>
                          <code className="text-[10px] text-muted-foreground">{permission}</code>
                        </td>
                        {roles.map((role) => {
                          const granted = role.permissions.includes(permission);
                          return (
                            <td key={`${role.code}-${permission}`} className="px-2 py-1.5 text-center">
                              {granted ? (
                                <Check
                                  className="mx-auto h-4 w-4 text-success"
                                  aria-label="granted"
                                />
                              ) : (
                                <X
                                  className="mx-auto h-4 w-4 text-muted-foreground/40"
                                  aria-label="not granted"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
