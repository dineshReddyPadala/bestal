import { BesTalBrand } from '@bestal/ui';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { useAuth } from '../../contexts/AuthContext';
import { getMe, type Portal } from '../../lib/api';
import { BESTAL_LOGO_SRC } from '../../lib/brand';

type MarketingLoginPageProps = {
  variant?: 'admin' | 'client';
};

const LOGIN_CONFIG = {
  admin: {
    portal: 'ADMIN' as Portal,
    demoEmail: 'admin@bestal.com',
    demoPassword: 'Password123!',
    successPath: '/login/portals',
    forgotPath: '/admin/forgot-password',
    secondaryHref: '/login/portals',
    secondaryLabel: "Don't have an account? Sign up",
  },
  client: {
    portal: 'CLIENT' as Portal,
    demoEmail: 'client@bestal.com',
    demoPassword: 'Password123!',
    successPath: '/sample-talent',
    forgotPath: '/client/forgot-password',
    secondaryHref: '/login/engineers',
    secondaryLabel: "Don't have an account? Sign up here",
  },
};

export function MarketingLoginPage({ variant = 'admin' }: MarketingLoginPageProps) {
  const config = LOGIN_CONFIG[variant];
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState(config.demoEmail);
  const [password, setPassword] = useState(config.demoPassword);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isClientLogin = variant === 'client';

  // Admin login: skip form if already signed in as admin
  if (
    !isClientLogin &&
    !isLoading &&
    user &&
    (user.portal === 'ADMIN' || user.role === 'SUPER_ADMIN')
  ) {
    return <Navigate to={config.successPath} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password, portal: config.portal });
      await getMe();
      navigate(config.successPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="marketing-site mkt-login-page mkt-login-loading">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Sign In | BesTal" description="Sign in to BesTal." noIndex />
      <div className="marketing-site mkt-login-page">
        <section className="mkt-login-hero" aria-hidden="true">
          <div className="mkt-login-hero-overlay" />
          <div className="mkt-login-hero-card">
            <div className="mkt-login-hero-badge">
              <span aria-hidden="true">👍</span> Top Notch Stock Resources
            </div>
            <p className="mkt-login-hero-copy">
              BesTal connects enterprises with rigorously screened engineers, designers, and
              specialists — evaluated, BGV-cleared, and ready to start a pilot.
            </p>
          </div>
        </section>

        <section className="mkt-login-panel">
          <div className="mkt-login-card">
            <div className="mkt-login-brand">
              <BesTalBrand logoSrc={BESTAL_LOGO_SRC} variant="light" />
            </div>

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

              <Link to={config.secondaryHref} className="mkt-btn mkt-login-signup">
                {config.secondaryLabel}
              </Link>

              <p className="mkt-login-demo-hint">
                Demo: {config.demoEmail} / {config.demoPassword}
              </p>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
