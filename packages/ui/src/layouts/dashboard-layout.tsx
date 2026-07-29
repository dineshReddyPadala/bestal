import { cn } from '@bestal/shared-utils';
import { ChevronDown, ChevronsLeft, ChevronsRight, LogOut, Menu, X } from 'lucide-react';
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
  /** When true, desktop sidebar can collapse to an icon rail. */
  collapsible?: boolean;
  /** localStorage key for collapsed state (used when collapsible). */
  collapseStorageKey?: string;
};

type DashboardChromeContextValue = {
  setHeaderLeading: (node: ReactNode | null) => void;
};

const DashboardChromeContext = createContext<DashboardChromeContextValue | null>(null);

const DEFAULT_COLLAPSE_KEY = 'bestal.nav.collapsed';

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

function readCollapsed(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // ignore quota / private mode
  }
}

function NavLink({
  item,
  isActive,
  onClick,
  collapsed,
}: {
  item: DashboardNavItem;
  isActive: boolean;
  onClick?: () => void;
  /** Desktop icon-rail mode (lg+ only; mobile drawer always shows labels). */
  collapsed?: boolean;
}) {
  const Icon = resolveIcon(item.icon);

  return (
    <Link
      to={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        collapsed && 'lg:justify-center lg:px-2',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>
        {item.label}
      </span>
      {item.badge !== undefined && item.badge > 0 ? (
        <>
          <Badge
            variant="default"
            className={cn(
              'h-5 min-w-5 justify-center bg-brand px-1.5 text-[10px]',
              collapsed && 'lg:hidden',
            )}
          >
            {item.badge}
          </Badge>
          {collapsed ? (
            <span className="absolute right-1.5 top-1.5 hidden h-1.5 w-1.5 rounded-full bg-brand lg:block" />
          ) : null}
        </>
      ) : null}
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
  collapsible = false,
  collapseStorageKey = DEFAULT_COLLAPSE_KEY,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() =>
    collapsible ? readCollapsed(collapseStorageKey) : false,
  );
  const [headerLeading, setHeaderLeading] = useState<ReactNode | null>(null);
  const chromeValue = useMemo(() => ({ setHeaderLeading }), []);

  const desktopCollapsed = collapsible && collapsed;

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(collapseStorageKey, next);
      return next;
    });
  }

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
            'fixed inset-y-0 left-0 z-50 flex h-svh shrink-0 flex-col overflow-hidden bg-navy transition-[width,transform] duration-200 lg:static lg:translate-x-0',
            desktopCollapsed ? 'lg:w-[4.5rem]' : 'lg:w-64',
            'w-64',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div
            className={cn(
              'flex h-16 shrink-0 items-center border-b border-white/10 px-4',
              desktopCollapsed ? 'justify-between lg:justify-center lg:px-2' : 'justify-between gap-2',
            )}
          >
            <div className={cn('min-w-0', desktopCollapsed && 'lg:hidden')}>
              <span className="block truncate text-lg font-bold leading-none text-white">Bestal</span>
              <p className="mt-1 truncate text-xs leading-none text-white/60">{portalName}</p>
            </div>
            {desktopCollapsed ? (
              <button
                type="button"
                className="hidden flex-col items-center gap-0.5 rounded-md px-1 py-1 text-white/90 hover:bg-white/10 lg:flex"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <span className="text-sm font-bold leading-none text-white">B</span>
                <ChevronsRight className="h-3.5 w-3.5 text-white/70" />
              </button>
            ) : collapsible ? (
              <button
                type="button"
                className="hidden rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:inline-flex"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            ) : null}
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
              <div key={item.href} className="relative">
                <NavLink
                  item={item}
                  isActive={currentPath === item.href}
                  collapsed={desktopCollapsed}
                  onClick={() => setSidebarOpen(false)}
                />
              </div>
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
