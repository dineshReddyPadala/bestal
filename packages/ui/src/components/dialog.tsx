import { cn } from '@bestal/shared-utils';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Button } from './button.js';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Scroll long form content inside the dialog instead of overflowing the viewport. */
  scrollable?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  scrollable = false,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="dialog-title"
        className={cn(
          'relative z-10 flex w-full max-w-lg flex-col rounded-xl border border-border bg-background shadow-elevated',
          scrollable && 'max-h-[min(90vh,840px)]',
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-3">
          <div className="min-w-0 pr-4">
            <h2 id="dialog-title" className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn('px-5 py-3', scrollable && 'min-h-0 flex-1 overflow-y-auto scrollbar-thin')}>
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
