import { cn } from '@bestal/shared-utils';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/avatar.js';
import { Badge } from '../components/badge.js';
import { resolveIcon } from '../lib/icons.js';

export type DashboardNavItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
};

export type DashboardUser = {
  name: string;
  email: string;
  role: string;
};

export type DashboardLayoutProps = {
  navItems: DashboardNavItem[];
  portalName: string;
  user: DashboardUser;
  children: ReactNode;
  currentPath?: string;
  onLogout?: () => void | Promise<void>;
};

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: DashboardNavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = resolveIcon(item.icon);

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <Badge
          variant="default"
          className="h-5 min-w-5 justify-center bg-brand px-1.5 text-[10px]"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

function ProfileMenu({
  user,
  onLogout,
  variant = 'light',
  align = 'right',
}: {
  user: DashboardUser;
  onLogout?: () => void | Promise<void>;
  variant?: 'light' | 'dark';
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDark = variant === 'dark';

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

  const handleLogout = async () => {
    if (!onLogout || loggingOut) return;
    setOpen(false);
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-2 rounded-md text-left transition-colors',
          isDark
            ? 'w-full px-1 py-1 text-white hover:bg-white/5'
            : 'px-2 py-1.5 hover:bg-muted/60',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.name} size="sm" />
        <div className={cn('min-w-0 flex-1', !isDark && 'hidden sm:block')}>
          <p
            className={cn(
              'truncate text-sm font-medium leading-tight',
              isDark ? 'text-white' : 'text-foreground',
            )}
          >
            {user.name}
          </p>
          <p
            className={cn(
              'truncate text-xs leading-tight',
              isDark ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            {isDark ? user.role : user.email}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            isDark ? 'text-white/60' : 'text-muted-foreground',
            !isDark && 'hidden sm:block',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 min-w-[12rem] overflow-hidden rounded-md border bg-background py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            isDark ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.role}</p>
          </div>
          {onLogout && (
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Signing out…' : 'Log out'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardLayout({
  navItems,
  portalName,
  user,
  children,
  currentPath = '',
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-svh overflow-hidden bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col overflow-hidden bg-navy transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="min-w-0">
            <span className="block truncate text-lg font-bold leading-none text-white">Bestal</span>
            <p className="mt-1 truncate text-xs leading-none text-white/60">{portalName}</p>
          </div>
          <button
            type="button"
            className="text-white/70 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-start gap-0.5 overflow-hidden px-2 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={currentPath === item.href}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          <ProfileMenu
            user={user}
            onLogout={onLogout}
            variant="dark"
            align="left"
          />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <ProfileMenu user={user} onLogout={onLogout} />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
