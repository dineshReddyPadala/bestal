import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearTokens,
  getMe,
  isAuthenticated,
  login as apiLogin,
  logout as apiLogout,
  type AuthUserProfile,
  type LoginRequest,
  type Portal,
} from '../lib/api';

type AuthContextValue = {
  user: AuthUserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

const PORTAL_HOME: Record<Portal, string> = {
  ADMIN: '/admin',
  RECRUITER: '/recruiter',
  SALES: '/sales',
  CLIENT: '/client',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthenticated());

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }
    const profile = await getMe();
    setUser(profile);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    refreshProfile()
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [refreshProfile]);

  const login = useCallback(async (credentials: LoginRequest) => {
    await apiLogin(credentials);
    const profile = await getMe();
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function usePortalLogin(portal: Portal) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setSubmitting(true);
      setError(null);
      try {
        await login({ email, password, portal });
        const profile = await getMe();
        if (portal === 'ADMIN' && profile.role === 'SUPER_ADMIN') {
          navigate('/super-admin/dashboard');
        } else {
          navigate(PORTAL_HOME[portal]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setSubmitting(false);
      }
    },
    [login, navigate, portal],
  );

  return { handleLogin, error, submitting };
}

export { PORTAL_HOME };
