import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type MarketingNavItem = {
  label: string;
  href: string;
};

export type MarketingLayoutProps = {
  navItems: MarketingNavItem[];
  children: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
};

export function MarketingLayout({
  navItems,
  children,
  ctaLabel = 'Get Started',
  ctaHref = '/contact',
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Bestal</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-white/80 hover:text-white sm:inline"
            >
              Sign In
            </Link>
            <Link
              to={ctaHref}
              className="inline-flex h-8 items-center justify-center rounded-md bg-brand px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-brand-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <span className="text-lg font-bold">Bestal</span>
              <p className="mt-3 max-w-sm text-sm text-white/70">
                Enterprise talent solutions. Connect with top professionals
                vetted for your most critical projects.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                Platform
              </h4>
              <ul className="mt-4 space-y-2">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                Company
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-white/60 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/enterprise" className="text-sm text-white/60 hover:text-white">
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-white/60 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
            &copy; {new Date().getFullYear()} Bestal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
