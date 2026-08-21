import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isClientSignupPath, isPortalLoginPath, isStaffSplitLoginPath } from '../../lib/login-portals';
import { LoginHeroSection } from './LoginHeroSection';

type SplitLoginLayoutProps = {
  children: ReactNode;
};

/** Full-viewport split layout: hero image left, auth content right (no marketing nav). */
export function SplitLoginLayout({ children }: SplitLoginLayoutProps) {
  const { pathname } = useLocation();
  const usePortalLayout = isPortalLoginPath(pathname);
  const useStaffPortalLayout = isStaffSplitLoginPath(pathname);
  const useScrollPanelLayout = isClientSignupPath(pathname);

  return (
    <div
      className={`mkt-login-page${usePortalLayout || useStaffPortalLayout ? ' mkt-login-page--portals' : ''}${useStaffPortalLayout ? ' mkt-login-page--staff-portal' : ''}${useScrollPanelLayout ? ' mkt-login-page--scroll-panel' : ''}`}
    >
      <LoginHeroSection />
      <section className="mkt-login-panel">{children}</section>
    </div>
  );
}
