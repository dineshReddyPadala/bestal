import { BesTalBrand } from '@bestal/ui';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BESTAL_LOGO_SRC } from '../../lib/brand';

type SplitLoginPanelProps = {
  children: ReactNode;
  wide?: boolean;
  title?: string;
  subtitle?: string;
  backLink?: { href: string; label?: string };
  brandHref?: string;
};

export function SplitLoginPanel({
  children,
  wide = false,
  title,
  subtitle,
  backLink,
  brandHref,
}: SplitLoginPanelProps) {
  return (
    <div className={`mkt-login-panel-stack${wide ? ' mkt-login-panel-stack--wide' : ''}`}>
      {backLink ? (
        <div className="mkt-login-back-row">
          <Link to={backLink.href} className="mkt-login-back-link mkt-btn mkt-btn-ghost">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {backLink.label ?? 'Back to portal'}
          </Link>
        </div>
      ) : null}
      <div className={`mkt-login-card${wide ? ' mkt-login-card-wide' : ''}`}>
        <div className="mkt-login-brand">
          {brandHref ? (
            <Link to={brandHref} className="mkt-login-brand-link" aria-label="BesTal home">
              <BesTalBrand logoSrc={BESTAL_LOGO_SRC} variant="light" />
            </Link>
          ) : (
            <BesTalBrand logoSrc={BESTAL_LOGO_SRC} variant="light" />
          )}
        </div>
        {title ? <h1 className="mkt-login-portal-title">{title}</h1> : null}
        {subtitle ? <p className="mkt-login-portal-sub">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}
