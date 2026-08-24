import { Link } from 'react-router-dom';
import { footer, footerDraft } from '../../data/homeCopy';
import { Draft } from './Draft';
import { Logo } from './Logo';

const FOOTER_LINK_HREF: Record<string, string> = {
  'Find Talent': '/sample-talent',
  'Skill Communities': '/communities',
  'How It Works': '/how-it-works',
  'Time-Zone Overlap': '/#time-zone',
  'Post a Job': '/contact',
  About: '/about',
  'Our Evaluation Standard': '/evaluation-standard',
  Enterprise: '/enterprise',
  Contact: '/contact',
  'Privacy Policy': '/privacy-policy',
  'Terms of Service': '/terms-of-service',
  'Free Trial Terms': '/free-trial-terms',
  'Cookie Policy': '/cookie-policy',
};

export function Footer() {
  return (
    <footer className="bg-ink pt-16">
      <div className="section-shell grid gap-10 pb-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
            {footer.tagline}
          </p>
        </div>

        {footerDraft.columns.map((column) => (
          <Draft key={column.heading} label="Draft links">
            <h3 className="font-display text-[14px] font-semibold text-white">{column.heading}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link}>
                  <Link
                    to={FOOTER_LINK_HREF[link] ?? '/'}
                    className="text-[13px] text-white/55 transition-colors duration-150 ease-out hover:text-white"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </Draft>
        ))}
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="section-shell text-center text-[12px] text-white/40">{footer.legalLine}</p>
      </div>
    </footer>
  );
}
