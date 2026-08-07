import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BesTalBrand } from '../components/bestal-brand.js';

export type MarketingNavItem = {
  label: string;
  href: string;
};

export type MarketingLayoutProps = {
  navItems: MarketingNavItem[];
  children: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  brandLogoSrc?: string;
};

export function MarketingLayout({
  navItems,
  children,
  ctaLabel = 'Get started',
  ctaHref = '/contact',
  brandLogoSrc,
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="shell-header-h mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <BesTalBrand logoSrc={brandLogoSrc} wordmarkClassName="text-lg" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              Log in
            </Link>
            <Link
              to={ctaHref}
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-lg font-semibold text-foreground">
                  Bes<span className="font-bold">Tal</span>
                </span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Enterprise talent solutions. Connect with top professionals
                vetted for your most critical projects.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Platform
              </h4>
              <ul className="mt-4 space-y-2">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Company
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/enterprise"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BesTal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
