import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BesTalBrand } from '../components/bestal-brand.js';
import { SocialMediaIcons } from '../components/social-media-icons.js';

function parseFooterHref(href: string): { pathname: string; hash: string } {
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) {
    return { pathname: href, hash: '' };
  }

  return {
    pathname: href.slice(0, hashIndex) || '/',
    hash: href.slice(hashIndex + 1),
  };
}

function isSameMarketingPage(currentPathname: string, targetPathname: string): boolean {
  if (targetPathname === '/') {
    return currentPathname === '/';
  }

  if (targetPathname === '/sample-talent') {
    return currentPathname === '/sample-talent' || currentPathname === '/talent';
  }

  return (
    currentPathname === targetPathname || currentPathname.startsWith(`${targetPathname}/`)
  );
}

function scrollMarketingPageTo(href: string) {
  const { hash } = parseFooterHref(href);

  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash));
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function handleSamePageFooterLink(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  currentPathname: string,
) {
  const { pathname } = parseFooterHref(href);
  if (!isSameMarketingPage(currentPathname, pathname)) return;

  event.preventDefault();
  scrollMarketingPageTo(href);
}

export type MarketingNavItem = {
  label: string;
  href: string;
  children?: MarketingNavItem[];
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
  hideFooter?: boolean;
  layoutClassName?: string;
  isAuthenticated?: boolean;
  loginHref?: string;
  onLogout?: () => void | Promise<void>;
};

function navItemKey(item: MarketingNavItem) {
  return `${item.href}-${item.label}`;
}

const HOW_IT_WORKS_DROPDOWN_META: Record<string, string> = {
  '/how-it-works': 'From onboarding to engagement',
  '/evaluation-standard': 'See our evaluation standard',
  '/try-for-a-week': 'Try talent before you commit',
  '/rates': 'Transparent hourly rates',
  '/trust': 'Verification and compliance',
};

function MarketingNavDropdown({
  item,
  isActive,
  onNavigate,
  navOpen,
  isTouchViewport,
}: {
  item: MarketingNavItem;
  isActive: boolean;
  onNavigate: () => void;
  navOpen: boolean;
  isTouchViewport: boolean;
}) {
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];

  useEffect(() => {
    if (!isTouchViewport) return;
    setOpen(navOpen);
  }, [isTouchViewport, navOpen]);

  return (
    <div
      className={`mkt-nav-dropdown${open ? ' is-open' : ''}${isActive ? ' is-active' : ''}`}
      onMouseEnter={() => {
        if (!isTouchViewport) setOpen(true);
      }}
      onMouseLeave={() => {
        if (!isTouchViewport) setOpen(false);
      }}
    >
      <div className="mkt-nav-dropdown-trigger">
        <button
          type="button"
          className={isActive ? 'is-active' : undefined}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {item.label}
        </button>
        <button
          type="button"
          className="mkt-nav-dropdown-toggle"
          aria-expanded={open}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5 6 8 9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="mkt-nav-dropdown-menu" role="menu" aria-label={`${item.label} pages`}>
        <div className="mkt-nav-dropdown-items">
          {children.map((child) => {
            const description = HOW_IT_WORKS_DROPDOWN_META[child.href];

            return (
              <NavLink
                key={navItemKey(child)}
                to={child.href}
                role="menuitem"
                className={({ isActive: childActive }) =>
                  `mkt-nav-dropdown-item${childActive ? ' is-active' : ''}`
                }
                onClick={() => {
                  setOpen(false);
                  onNavigate();
                }}
              >
                <span className="mkt-nav-dropdown-copy">
                  <span className="mkt-nav-dropdown-item-label">{child.label}</span>
                  {description ? (
                    <span className="mkt-nav-dropdown-item-desc">{description}</span>
                  ) : null}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const defaultFooterColumns: MarketingFooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Pre-Vetted Talent', href: '/sample-talent' },
      { label: 'Skill Communities', href: '/sample-talent' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Time Zone Overlap', href: '/#time-zone' },
      { label: 'Pricing', href: '/rates' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Our Evaluation Standard', href: '/evaluation-standard' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Free Trial Terms', href: '/free-trial-terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
];

export function MarketingLayout({
  navItems,
  footerColumns = defaultFooterColumns,
  children,
  ctaLabel = 'Reach out to us',
  ctaHref = '/reach-out',
  brandLogoSrc,
  footerTagline = 'Evaluated, verified and priced before you interview — with a committed working window in your zone.',
  hideFooter = false,
  layoutClassName = '',
  isAuthenticated = false,
  loginHref = '/login/portal',
  onLogout,
}: MarketingLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isTouchViewport, setIsTouchViewport] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsTouchViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  function isNavItemActive(item: MarketingNavItem, isActive: boolean) {
    if (isActive) return true;
    if (item.href === '/sample-talent' && location.pathname === '/talent') return true;
    if (
      item.children?.some(
        (child) =>
          location.pathname === child.href ||
          location.pathname.startsWith(`${child.href}/`),
      )
    ) {
      return true;
    }
    return false;
  }

  function closeNav() {
    setNavOpen(false);
  }

  async function handleLogout() {
    if (!onLogout || loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setNavOpen(false);
    }
  }

  return (
    <div
      className={`marketing-site flex min-h-screen flex-col${isTouchViewport ? ' mkt-touch-viewport' : ''} ${layoutClassName}`.trim()}
    >
      <header className="mkt-header mkt-header-light relative">
        <div className="mkt-shell">
          <div className="mkt-hdr">
            <Link to="/" onClick={() => setNavOpen(false)} aria-label="BesTal home">
              <BesTalBrand variant="light" logoSrc={brandLogoSrc} />
            </Link>

            <nav className={`mkt-nav ${navOpen ? 'open' : ''}`} aria-label="Primary">
              {navItems.map((item) =>
                item.children?.length ? (
                  <MarketingNavDropdown
                    key={navItemKey(item)}
                    item={item}
                    isActive={isNavItemActive(item, location.pathname === item.href)}
                    onNavigate={closeNav}
                    navOpen={navOpen}
                    isTouchViewport={isTouchViewport}
                  />
                ) : (
                  <NavLink
                    key={navItemKey(item)}
                    to={item.href}
                    end={item.href === '/'}
                    onClick={closeNav}
                    className={({ isActive }) =>
                      isNavItemActive(item, isActive) ? 'is-active' : undefined
                    }
                  >
                    {item.label}
                  </NavLink>
                ),
              )}

              {isAuthenticated ? (
                <button
                  type="button"
                  className="mkt-nav-login"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              ) : (
                <Link
                  to={loginHref}
                  className="mkt-nav-login"
                  onClick={() => setNavOpen(false)}
                >
                  Log in
                </Link>
              )}
            </nav>

            <div className="mkt-hdr-cta">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="mkt-btn mkt-btn-ghost"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              ) : (
                <Link to={loginHref} className="mkt-btn mkt-btn-ghost" onClick={() => setNavOpen(false)}>
                  Log in
                </Link>
              )}
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

      <main className="flex-1 overflow-x-clip">{children}</main>

      {!hideFooter && (
      <footer className="mkt-footer">
        <div className="mkt-shell">
          <div className="mkt-ftg">
            <div>
              <Link
                to="/"
                aria-label="BesTal home"
                onClick={(event) => handleSamePageFooterLink(event, '/', location.pathname)}
              >
                <BesTalBrand variant="light" logoSrc={brandLogoSrc} />
              </Link>
              <p className="mt-[18px] max-w-xs text-[15px] text-[var(--mkt-ink-d)]">{footerTagline}</p>
              <SocialMediaIcons />
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h5>{column.title}</h5>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        to={link.href}
                        onClick={(event) =>
                          handleSamePageFooterLink(event, link.href, location.pathname)
                        }
                      >
                        {link.label}
                      </Link>
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
      )}
    </div>
  );
}
