import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { isAuthenticated, type Portal } from '../../lib/api';
import { useContext } from 'react';
import { PageMeta } from '../PageMeta';
import { getChangePasswordPath, isChangePasswordPath } from '../../lib/change-password-path';

type ProtectedRouteProps = {
  portal: Portal;
  children: React.ReactNode;
};

const PORTAL_LOGIN: Record<Portal, string> = {
  ADMIN: '/admin/login',
  RECRUITER: '/recruiter/login',
  SALES: '/sales/login',
  CLIENT: '/login/client',
};

export function ProtectedRoute({ portal, children }: ProtectedRouteProps) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth) {
    if (!isAuthenticated()) {
      return <Navigate to={PORTAL_LOGIN[portal]} state={{ from: location }} replace />;
    }
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const { user, isLoading } = auth;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to={PORTAL_LOGIN[portal]} state={{ from: location }} replace />;
  }

  if (
    user.portal !== portal &&
    user.role !== 'ADMIN' &&
    user.role !== 'SUPER_ADMIN'
  ) {
    return <Navigate to={PORTAL_LOGIN[user.portal]} replace />;
  }

  if (
    user.mustChangePassword &&
    !isChangePasswordPath(location.pathname)
  ) {
    return (
      <Navigate
        to={getChangePasswordPath(portal, user.role)}
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <>
      <PageMeta title="BesTal Portal" description="BesTal authenticated portal." noIndex />
      {children}
    </>
  );
}
