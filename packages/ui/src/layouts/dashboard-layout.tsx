import { cn } from '@bestal/shared-utils';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  /** Optional top-right actions (e.g. notification bell) rendered before the profile menu */
  headerActions?: ReactNode;
};

type DashboardChromeContextValue = {
  setHeaderLeading: (node: ReactNode | null) => void;
};

const DashboardChromeContext = createContext<DashboardChromeContextValue | null>(null);

/**
 * Render content in the top bar leading slot (page actions, breadcrumbs, etc.).
 * Returns true when inside DashboardLayout (leading slot is active).
 */
export function useDashboardHeaderLeading(node: ReactNode | null): boolean {
  const ctx = useContext(DashboardChromeContext);

  useLayoutEffect(() => {
    if (!ctx) return;
    ctx.setHeaderLeading(node);
    return () => ctx.setHeaderLeading(null);
  }, [ctx, node]);

  return ctx != null;
}

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
}: {
  user: DashboardUser;
  onLogout?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/60"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
      >
        <Avatar name={user.name} size="sm" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium leading-tight text-foreground">{user.name}</p>
          <p className="truncate text-xs leading-tight text-muted-foreground">{user.email}</p>
        </div>
        <ChevronDown
          className={cn(
            'hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform sm:block',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border bg-background py-1 shadow-lg"
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
  headerActions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerLeading, setHeaderLeading] = useState<ReactNode | null>(null);
  const chromeValue = useMemo(() => ({ setHeaderLeading }), []);

  return (
    <DashboardChromeContext.Provider value={chromeValue}>
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

          <nav className="flex flex-1 flex-col justify-start gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={currentPath === item.href}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
            <button
              type="button"
              className="shrink-0 text-muted-foreground hover:text-foreground lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center">{headerLeading}</div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {headerActions}
              <ProfileMenu user={user} onLogout={onLogout} />
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
            {children}
          </main>
        </div>
      </div>
    </DashboardChromeContext.Provider>
  );
}
