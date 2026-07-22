import { cn } from '@bestal/shared-utils';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotificationMutations,
  useNotificationsList,
} from '../../hooks/api/useNotifications';

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useNotificationsList({ limit: 20 });
  const mutations = useNotificationMutations();

  const items = data?.data ?? [];
  const unreadCount = useMemo(
    () => items.filter((n) => !n.readAt && n.status !== 'READ').length,
    [items],
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  async function onItemClick(id: number, actionUrl: string | null, readAt: string | null) {
    if (!readAt) {
      try {
        await mutations.markRead.mutateAsync(id);
      } catch {
        // still navigate if possible
      }
    }
    setOpen(false);
    if (actionUrl) {
      try {
        const url = new URL(actionUrl, window.location.origin);
        if (url.origin === window.location.origin) {
          navigate(`${url.pathname}${url.search}${url.hash}`);
          return;
        }
        window.open(actionUrl, '_blank', 'noopener,noreferrer');
      } catch {
        navigate(actionUrl);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border bg-background shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
                disabled={mutations.markAllRead.isPending}
                onClick={() => void mutations.markAllRead.mutateAsync()}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              items.map((item) => {
                const unread = !item.readAt && item.status !== 'READ';
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => void onItemClick(item.id, item.actionUrl, item.readAt)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-muted/50',
                      unread && 'bg-brand/5',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm leading-snug',
                          unread ? 'font-semibold text-foreground' : 'font-medium text-foreground',
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                    {item.body ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
