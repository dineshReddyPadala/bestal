import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CLIENT_LOGIN_PATH, STAFF_PORTAL_LOGIN_PATH } from '../lib/login-portals';

export function useDashboardUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardUser = useMemo(
    () =>
      user
        ? {
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            role: user.role,
          }
        : { name: 'User', email: '', role: '' },
    [user],
  );

  const handleLogout = async () => {
    const portal = user?.portal;
    const loginPath =
      portal === 'ADMIN' || portal === 'RECRUITER' || portal === 'SALES'
        ? STAFF_PORTAL_LOGIN_PATH
        : CLIENT_LOGIN_PATH;

    try {
      await logout();
    } finally {
      navigate(loginPath, { replace: true });
    }
  };

  return { user: dashboardUser, authUser: user, handleLogout };
}

