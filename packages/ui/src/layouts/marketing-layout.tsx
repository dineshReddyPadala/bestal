import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
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
      { label: 'Find Talent', href: '/sample-talent' },
      { label: 'Skill Communities', href: '/communities' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Time Zone Overlap', href: '/#time-zone' },
      { label: 'Pricing', href: '/rates' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Our Evaluation Standard', href: '/evaluation-standard' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/contact' },
      { label: 'Terms of Service', href: '/contact' },
      { label: 'Cookie Policy', href: '/contact' },
    ],
  },
];

export function MarketingLayout({
  navItems,
  footerColumns = defaultFooterColumns,
  children,
  ctaLabel = 'Reach out to us',
  ctaHref = '/contact',
  brandLogoSrc,
  footerTagline = 'Evaluated, verified and priced before you interview — with a committed working window in your zone.',
}: MarketingLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <header className="mkt-header mkt-header-light relative">
        <div className="mkt-shell">
          <div className="mkt-hdr">
            <Link to="/" onClick={() => setNavOpen(false)} aria-label="BesTal home">
              <BesTalBrand variant="light" logoSrc={brandLogoSrc} />
            </Link>

            <nav className={`mkt-nav ${navOpen ? 'open' : ''}`} aria-label="Primary">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setNavOpen(false)}
                  className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mkt-hdr-cta">
              <Link to="/login" className="mkt-btn mkt-btn-ghost">
                Log in
              </Link>
              <Link to={ctaHref} className="mkt-btn mkt-btn-primary mkt-btn-sm">
                <span className="hidden min-[480px]:inline">{ctaLabel}</span>
                <span className="min-[480px]:hidden">Contact</span>
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

      <main className="flex-1 overflow-x-clip">{children}</main>

      <footer className="mkt-footer">
        <div className="mkt-shell">
          <div className="mkt-ftg">
            <div>
              <Link to="/" aria-label="BesTal home">
                <BesTalBrand variant="light" logoSrc={brandLogoSrc} />
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
