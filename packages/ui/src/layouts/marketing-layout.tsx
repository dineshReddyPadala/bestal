import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BesTalBrand } from '../components/bestal-brand.js';

export type MarketingNavItem = {
  label: string;
  href: string;
};

export type MarketingFooterColumn = {
  title: string;
  links: MarketingNavItem[];
};

export type MarketingLayoutProps = {
  navItems: MarketingNavItem[];
  footerColumns?: MarketingFooterColumn[];
  children: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  brandLogoSrc?: string;
  footerTagline?: string;
};

const defaultFooterColumns: MarketingFooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'How we test', href: '/evaluation-standard' },
      { label: 'Engineering communities', href: '/communities' },
      { label: 'Browse engineers', href: '/sample-talent' },
      { label: '20-hour free trial', href: '/try-for-a-week' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Rates', href: '/rates' },
      { label: 'Trust & verification', href: '/trust' },
      { label: 'For engineers', href: '/for-engineers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '/contact' },
      { label: 'Privacy Policy', href: '/contact' },
      { label: 'Cookie Policy', href: '/contact' },
      { label: 'Engineer Privacy Notice', href: '/contact' },
      { label: 'Trial Terms', href: '/contact' },
    ],
  },
];

export function MarketingLayout({
  navItems,
  footerColumns = defaultFooterColumns,
  children,
  ctaLabel = 'Browse Engineers',
  ctaHref = '/sample-talent',
  brandLogoSrc,
  footerTagline = 'Tested, verified and priced before you commit — working a full day in your time zone.',
}: MarketingLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <header className="mkt-header relative">
        <div className="mx-auto max-w-[1150px] px-[22px] sm:px-[34px]">
          <div className="mkt-hdr">
            <Link to="/" onClick={() => setNavOpen(false)}>
              <BesTalBrand logoSrc={brandLogoSrc} wordmarkClassName="text-[25px] font-bold tracking-[-0.5px]" />
            </Link>

            <nav className={`mkt-nav ${navOpen ? 'open' : ''}`}>
              {navItems.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setNavOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mkt-hdr-cta">
              <Link to="/login" className="mkt-btn mkt-btn-ghost">
                Log in
              </Link>
              <Link to={ctaHref} className="mkt-btn mkt-btn-primary mkt-btn-sm">
                {ctaLabel}
              </Link>
              <button
                type="button"
                className="mkt-menu-btn"
                aria-label="Toggle menu"
                onClick={() => setNavOpen((open) => !open)}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mkt-footer">
        <div className="mx-auto max-w-[1150px] px-[22px] sm:px-[34px]">
          <div className="mkt-ftg">
            <div>
              <Link to="/">
                <BesTalBrand logoSrc={brandLogoSrc} wordmarkClassName="text-[25px] font-bold tracking-[-0.5px]" />
              </Link>
              <p className="mt-[18px] max-w-xs text-[15px] text-[var(--mkt-ink-d)]">{footerTagline}</p>
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h5>{column.title}</h5>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link to={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mkt-ftb">
            <span>&copy; {new Date().getFullYear()} BesTal. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
