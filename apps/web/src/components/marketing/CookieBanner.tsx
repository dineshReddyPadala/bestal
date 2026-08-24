import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'bestal-cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="mkt-cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="mkt-cookie-banner-card">
        <div className="mkt-cookie-banner-content">
          <span className="mkt-cookie-banner-icon" aria-hidden="true">
            <Cookie size={18} strokeWidth={2} />
          </span>
          <p className="mkt-cookie-banner-text">
            BesTal uses cookies to improve your experience, analyze website usage, and help us enhance
            our services. By continuing to use this website, you agree to our use of cookies. Please
            review our{' '}
            <Link to="/cookie-policy" className="mkt-cookie-banner-link">
              Cookie Policy
            </Link>{' '}
            for more information.
          </p>
        </div>

        <div className="mkt-cookie-banner-actions">
          <button type="button" className="mkt-btn mkt-btn-primary mkt-btn-sm" onClick={handleAccept}>
            Accept All
          </button>
          <button type="button" className="mkt-btn mkt-btn-secondary mkt-btn-sm" onClick={handleReject}>
            Reject All
          </button>
        </div>
      </div>
    </div>
  );
}
