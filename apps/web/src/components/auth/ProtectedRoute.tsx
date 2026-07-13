import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { isAuthenticated, type Portal } from '../../lib/api';
import { useContext } from 'react';

type ProtectedRouteProps = {
  portal: Portal;
  children: React.ReactNode;
};

const PORTAL_LOGIN: Record<Portal, string> = {
  ADMIN: '/admin/login',
  RECRUITER: '/recruiter/login',
  SALES: '/sales/login',
  CLIENT: '/client/login',
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

  return children;
}
