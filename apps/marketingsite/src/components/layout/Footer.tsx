import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/common/BrandMark';
import { ROUTES } from '@/constants/routes';

const COLUMNS = [
  {
    title: 'Solutions',
    links: [
      { to: ROUTES.consulting, label: 'Technology Consulting' },
      { to: ROUTES.delivery, label: 'Managed Services' },
      { to: ROUTES.talent, label: 'Talent Solutions' },
    ],
  },
  {
    title: 'Technology',
    links: [
      { to: ROUTES.communities, label: 'Technology Communities' },
      { to: ROUTES.workspace, label: 'Client Workspace' },
      { to: ROUTES.trust, label: 'Trust & Governance' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: ROUTES.about, label: 'About BesTal' },
      { to: ROUTES.help, label: 'How We Can Help' },
      { to: ROUTES.contact, label: 'Contact' },
    ],
  },
  {
    title: 'Professionals',
    links: [
      { to: ROUTES.candidate, label: 'Join Our Community' },
      { to: `${ROUTES.candidate}#fit`, label: 'How It Works' },
      { to: `${ROUTES.workspace}?mode=candidate`, label: 'Professional Workspace' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: ROUTES.privacy, label: 'Privacy Policy' },
      { to: ROUTES.terms, label: 'Terms of Use' },
      { to: ROUTES.cookies, label: 'Cookie Policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      <div className="shell">
        <div className="ft">
          <div>
            <Link to={ROUTES.home} aria-label="BesTal Solutions home">
              <BrandMark />
            </Link>
            <p style={{ marginTop: 12, fontSize: 13.5, maxWidth: 290 }}>
              Technology Consulting. Managed Services. Talent Solutions.
              <br />
              Helping organizations build, modernize and scale technology capabilities.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h5>{column.title}</h5>
              <ul>
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ftb">
          <span>© 2026 BesTal Solutions. All rights reserved.</span>
          <span>Prototype — all professionals, teams, requests and figures shown are illustrative.</span>
        </div>
      </div>
    </footer>
  );
}
