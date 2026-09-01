/** Shared left hero panel for split login / portal pages. */
import { useLocation } from 'react-router-dom';
import {
  CLIENT_LOGIN_HERO_IMAGE_SRC,
  STAFF_LOGIN_HERO_IMAGE_SRC,
} from '../../lib/brand';
import { getLoginHeroVariant } from '../../lib/login-portals';

const HERO_COPY: Record<
  ReturnType<typeof getLoginHeroVariant>,
  { badge: string; body: string }
> = {
  staff: {
    badge: 'Internal portals',
    body: 'Manage candidates, evaluations, background checks, clients, and trials across Admin, Recruiter, and Sales.',
  },
  client: {
    badge: 'Client portal',
    body: 'BesTal connects enterprises with rigorously screened engineers and specialists — evaluated, BGV-cleared, and ready to start a pilot.',
  },
};

export function LoginHeroSection() {
  const { pathname } = useLocation();
  const variant = getLoginHeroVariant(pathname);
  const isStaffLayout = variant === 'staff';
  const copy = HERO_COPY[variant];
  const imageSrc = isStaffLayout ? STAFF_LOGIN_HERO_IMAGE_SRC : CLIENT_LOGIN_HERO_IMAGE_SRC;

  return (
    <section
      className={`mkt-login-hero${isStaffLayout ? ' mkt-login-hero--portals' : ''}`}
      aria-label="BesTal portal overview"
    >
      <img
        className={`mkt-login-hero-img${isStaffLayout ? ' mkt-login-hero-img--portals' : ''}`}
        src={imageSrc}
        alt=""
      />
      <div className="mkt-login-hero-overlay" />
      <div className="mkt-login-hero-card">
        <div className="mkt-login-hero-badge">
          <span aria-hidden="true">👍</span> {copy.badge}
        </div>
        <p className="mkt-login-hero-copy">{copy.body}</p>
      </div>
    </section>
  );
}
