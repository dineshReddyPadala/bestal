import { cn } from '@bestal/shared-utils';
import { MoreVertical } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

export type ActionMenuItem = {
  id: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  hidden?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  destructive?: boolean;
  separatorBefore?: boolean;
};

export type ActionMenuProps = {
  items: ActionMenuItem[];
  label?: string;
  align?: 'start' | 'end';
  className?: string;
};

/** Enterprise three-dot contextual action menu (portal-rendered). */
export function ActionMenu({
  items,
  label = 'Open actions',
  align = 'end',
  className,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const visible = items.filter((item) => !item.hidden);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = 220;
    const gap = 4;
    let left = align === 'end' ? rect.right - panelWidth : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
    let top = rect.bottom + gap;
    const estimatedHeight = Math.min(360, visible.length * 36 + 16);
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - gap);
    }
    setCoords({ top, left });
  }, [align, visible.length]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => updatePosition();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, updatePosition]);

  if (visible.length === 0) return null;

  const panel =
    open && coords
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className="fixed z-[80] max-h-[min(360px,70vh)] min-w-[200px] overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-elevated"
            style={{ top: coords.top, left: coords.left, width: 220 }}
          >
            {visible.map((item) => (
              <div key={item.id}>
                {item.separatorBefore ? (
                  <div className="my-1 border-t border-border" role="separator" />
                ) : null}
                {item.href && !item.disabled ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted',
                      item.destructive && 'text-red-600 hover:bg-red-50',
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    title={item.disabled ? item.disabledReason : undefined}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted',
                      item.destructive && 'text-red-600 hover:bg-red-50',
                      item.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                    )}
                    onClick={() => {
                      if (item.disabled) return;
                      item.onSelect?.();
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn('relative inline-flex', className)} onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {panel}
    </div>
  );
}

export type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function emptyConfirm(): ConfirmState {
  return {
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    onConfirm: () => undefined,
  };
}

export function ActionMenuSlot({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2">{children}</div>;
}
