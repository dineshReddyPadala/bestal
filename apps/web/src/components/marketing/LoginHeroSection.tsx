/** Shared left hero panel for split login / portal pages. */
import { useLocation } from 'react-router-dom';
import { LOGIN_HERO_IMAGE_SRC } from '../../lib/brand';
import { isLoginPortalPickerPath } from '../../lib/login-portals';

export function LoginHeroSection() {
  const { pathname } = useLocation();
  const isPortalPicker = isLoginPortalPickerPath(pathname);

  return (
    <section
      className={`mkt-login-hero${isPortalPicker ? ' mkt-login-hero--portals' : ''}`}
      aria-hidden="true"
    >
      <img
        className={`mkt-login-hero-img${isPortalPicker ? ' mkt-login-hero-img--portals' : ''}`}
        src={LOGIN_HERO_IMAGE_SRC}
        alt=""
      />
      <div className="mkt-login-hero-overlay" />
      <div className="mkt-login-hero-card">
        <div className="mkt-login-hero-badge">
          <span aria-hidden="true">👍</span> Top Notch Stock Resources
        </div>
        <p className="mkt-login-hero-copy">
          BesTal connects enterprises with rigorously screened engineers, designers, and
          specialists — evaluated, BGV-cleared, and ready to start a pilot.
        </p>
      </div>
    </section>
  );
}
