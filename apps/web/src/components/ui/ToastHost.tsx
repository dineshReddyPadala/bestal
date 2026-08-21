import { cn } from '@bestal/shared-utils';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { ToastVariant } from '../../lib/use-demo-toast';

type ToastHostProps = {
  message: string | null;
  variant?: ToastVariant;
  onDismiss?: () => void;
};

export function ToastHost({ message, variant = 'success', onDismiss }: ToastHostProps) {
  if (!message || typeof document === 'undefined') {
    return null;
  }

  const isError = variant === 'error';

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-4 top-6 z-[200] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg',
          isError
            ? 'border-destructive/40 bg-destructive text-destructive-foreground'
            : 'border-emerald-300 bg-emerald-600 text-white',
        )}
      >
        {isError ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <p className="flex-1 font-medium leading-snug">{message}</p>
        {onDismiss ? (
          <button
            type="button"
            className="rounded p-0.5 opacity-80 hover:opacity-100"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
