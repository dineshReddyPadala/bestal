import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isLoginPortalPickerPath } from '../../lib/login-portals';
import { LoginHeroSection } from './LoginHeroSection';

type SplitLoginLayoutProps = {
  children: ReactNode;
};

/** Full-viewport split layout: hero image left, auth content right (no marketing nav). */
export function SplitLoginLayout({ children }: SplitLoginLayoutProps) {
  const { pathname } = useLocation();
  const isPortalPicker = isLoginPortalPickerPath(pathname);

  return (
    <div className={`mkt-login-page${isPortalPicker ? ' mkt-login-page--portals' : ''}`}>
      <LoginHeroSection />
      <section className="mkt-login-panel">{children}</section>
    </div>
  );
}
