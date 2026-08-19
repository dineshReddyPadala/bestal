import { BesTalBrand } from '@bestal/ui';
import type { ReactNode } from 'react';
import { BESTAL_LOGO_SRC } from '../../lib/brand';

type SplitLoginPanelProps = {
  children: ReactNode;
  wide?: boolean;
  title?: string;
  subtitle?: string;
};

export function SplitLoginPanel({ children, wide = false, title, subtitle }: SplitLoginPanelProps) {
  return (
    <div className={`mkt-login-card${wide ? ' mkt-login-card-wide' : ''}`}>
      <div className="mkt-login-brand">
        <BesTalBrand logoSrc={BESTAL_LOGO_SRC} variant="light" />
      </div>
      {title ? <h1 className="mkt-login-portal-title">{title}</h1> : null}
      {subtitle ? <p className="mkt-login-portal-sub">{subtitle}</p> : null}
      {children}
    </div>
  );
}
