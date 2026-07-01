import { cn } from '@bestal/shared-utils';
import { Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
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
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
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

export function DashboardLayout({
  navItems,
  portalName,
  user,
  children,
  currentPath = '',
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div>
            <span className="text-lg font-bold text-white">Bestal</span>
            <p className="text-xs text-white/60">{portalName}</p>
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={currentPath === item.href}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/60">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Avatar name={user.name} size="sm" />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
