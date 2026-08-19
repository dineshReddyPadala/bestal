import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
      portal === 'ADMIN'
        ? '/admin/login'
        : portal === 'RECRUITER'
          ? '/recruiter/login'
          : portal === 'SALES'
            ? '/sales/login'
            : '/client/login';

    try {
      await logout();
    } finally {
      navigate(loginPath, { replace: true });
    }
  };

  return { user: dashboardUser, authUser: user, handleLogout };
}
