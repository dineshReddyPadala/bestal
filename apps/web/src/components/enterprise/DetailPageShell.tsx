import { Button, PageHeader, StatusBadge } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ToastVariant } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';

export type WorkflowAction = {
  id: string;
  label: string;
  variant?: 'primary' | 'outline' | 'ghost';
  onClick?: () => void;
  to?: string;
  icon?: ReactNode;
};

type DetailPageShellProps = {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  statusBadges?: string[];
  actions?: WorkflowAction[];
  onAction?: (actionId: string) => void;
  children: ReactNode;
  toast?: string | null;
  toastVariant?: ToastVariant;
  onToastDismiss?: () => void;
};

export function DetailPageShell({
  title,
  description,
  backHref,
  backLabel = 'Back',
  statusBadges = [],
  actions = [],
  onAction,
  children,
  toast,
  toastVariant = 'success',
  onToastDismiss,
}: DetailPageShellProps) {
  return (
    <div>
      <ToastHost message={toast ?? null} variant={toastVariant} onDismiss={onToastDismiss} />

      <PageHeader
        title={title}
        description={description}
        breadcrumbs={
          <Link
            to={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        }
        actions={
          statusBadges.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {statusBadges.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          ) : undefined
        }
      />

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-border bg-muted/20 px-6 py-3">
          {actions.map((action) =>
            action.to ? (
              <Button key={action.id} to={action.to} variant={action.variant ?? 'outline'} size="sm">
                {action.icon}
                {action.label}
              </Button>
            ) : (
              <Button
                key={action.id}
                variant={action.variant ?? 'outline'}
                size="sm"
                onClick={() => {
                  action.onClick?.();
                  onAction?.(action.id);
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ),
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
