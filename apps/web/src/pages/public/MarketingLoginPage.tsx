import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { SplitLoginLayout } from '../../components/marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../../components/marketing/SplitLoginPanel';
import { PageMeta } from '../../components/PageMeta';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { ClientLoginForm } from '../../components/marketing/ClientLoginForm';
import { useAuth } from '../../contexts/AuthContext';
import { getMe, type Portal } from '../../lib/api';
import { CLIENT_LOGIN_PATH } from '../../lib/login-portals';

type MarketingLoginPageProps = {
  variant?: 'admin' | 'client';
};

const LOGIN_CONFIG = {
  admin: {
    portal: 'ADMIN' as Portal,
    demoEmail: 'admin@bestal.com',
    demoPassword: 'Password123!',
    successPath: '/login/portal',
    forgotPath: '/admin/forgot-password',
    secondaryHref: '/login/portal',
    // secondaryLabel: "Don't have an account? Sign up",
  },
  client: {
    portal: 'CLIENT' as Portal,
    demoEmail: 'client@bestal.com',
    demoPassword: 'Password123!',
    successPath: '/client',
    forgotPath: '/client/forgot-password',
    secondaryHref: `${CLIENT_LOGIN_PATH}/signup`,
    secondaryLabel: 'New to BesTal? Sign up',
  },
};

export function MarketingLoginPage({ variant = 'admin' }: MarketingLoginPageProps) {
  const config = LOGIN_CONFIG[variant];
  const [searchParams] = useSearchParams();
  const { login, user, isLoading, refreshProfile } = useAuth();
  const [email, setEmail] = useState(config.demoEmail);
  const [password, setPassword] = useState(config.demoPassword);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isClientLogin = variant === 'client';
  const discipline = searchParams.get('discipline');
  const signupHref =
    discipline != null && discipline !== ''
      ? `${CLIENT_LOGIN_PATH}/signup?discipline=${encodeURIComponent(discipline)}`
      : `${CLIENT_LOGIN_PATH}/signup`;
  const successPath =
    isClientLogin && discipline
      ? `/client/search?q=${encodeURIComponent(discipline)}`
      : config.successPath;

  // Admin login: skip form if already signed in as admin
  if (
    !isClientLogin &&
    !isLoading &&
    user &&
    (user.portal === 'ADMIN' || user.role === 'SUPER_ADMIN')
  ) {
    return <Navigate to={config.successPath} replace />;
  }

  if (isClientLogin && !isLoading && user && user.portal === 'CLIENT') {
    return <Navigate to={successPath} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password, portal: config.portal });
      await getMe();
      window.location.assign(successPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <SplitLoginLayout>
        <div className="mkt-login-loading">
          <p>Loading…</p>
        </div>
      </SplitLoginLayout>
    );
  }

  return (
    <>
      <PageMeta title="Sign In | BesTal" description="Sign in to BesTal." noIndex />
      <SplitLoginLayout>
        <SplitLoginPanel brandHref={isClientLogin ? '/' : undefined}>
          {isClientLogin ? (
            <ClientLoginForm
              successPath={successPath}
              signupHref={signupHref}
              onAuthenticated={refreshProfile}
            />
          ) : (
            <form className="mkt-login-form" onSubmit={handleSubmit}>
              {error && <div className="mkt-login-error">{error}</div>}

              <label className="mkt-login-field">
                <span className="mkt-login-label">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="mkt-login-input"
                />
              </label>

              <label className="mkt-login-field">
                <span className="mkt-login-label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="mkt-login-input"
                />
              </label>

              <p className="mkt-login-forgot">
                <Link to={config.forgotPath}>Forgot password ?</Link>
              </p>

              <button
                type="submit"
                className="mkt-btn mkt-btn-primary mkt-login-submit"
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
                {!submitting && <ForwardArrow className="h-4 w-4" />}
              </button>
            </form>
          )}
        </SplitLoginPanel>
      </SplitLoginLayout>
    </>
  );
}
