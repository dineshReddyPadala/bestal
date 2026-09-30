import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BrandMark } from '@/components/common/BrandMark';
import { CLIENT_WORKSPACE_URL, PORTAL_LOGIN_URL } from '@/constants/app-urls';
import { NAV_LINKS, ROUTES } from '@/constants/routes';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav className="nav">
      <div className="shell">
        <Link to={ROUTES.home} aria-label="BesTal Solutions home">
          <BrandMark />
        </Link>
        <div className={`links ${open ? 'open' : ''}`} id="links">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.id} to={link.to} data-p={link.id} className={({ isActive }) => (isActive ? 'on' : '')}>
              {link.label}
            </NavLink>
          ))}
          <Link className="mobile-action" to={ROUTES.candidate}>
            Join Our Community
          </Link>
          <a className="mobile-action" href={CLIENT_WORKSPACE_URL}>
            Client Workspace
          </a>
          <a className="mobile-action" href={PORTAL_LOGIN_URL}>
            Portal
          </a>
          <Link className="mobile-action" to={ROUTES.contact} style={{ color: 'var(--blue-d)', fontWeight: 700 }}>
            Talk to BesTal
          </Link>
        </div>
        <div className="navr">
          <Link className="btn outline sm navr-action" to={ROUTES.candidate}>
            Join Our Community
          </Link>
          <a className="btn outline sm navr-action" href={CLIENT_WORKSPACE_URL}>
            Client Workspace
          </a>
          <a className="btn outline sm navr-action" href={PORTAL_LOGIN_URL}>
            Portal
          </a>
          <Link className="btn primary sm navr-action" to={ROUTES.contact}>
            Talk to BesTal
          </Link>
          <button
            className="burger"
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="links"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
