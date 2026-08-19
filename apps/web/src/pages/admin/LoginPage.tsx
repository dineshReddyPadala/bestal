import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { PageMeta } from '../../components/PageMeta';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { usePortalLogin } from '../../contexts/AuthContext';

export function LoginPage() {
  const { handleLogin, error, submitting } = usePortalLogin('ADMIN');
  const [email, setEmail] = useState('admin@bestal.com');
  const [password, setPassword] = useState('Password123!');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleLogin(email, password);
  }

  return (
    <>
      <PageMeta title="Admin Sign In | BesTal" description="Admin portal sign in." noIndex />
      <AdminAuthPageShell title="Admin Portal">
        <form className="mkt-login-form" onSubmit={onSubmit}>
          {error ? <div className="mkt-login-error">{error}</div> : null}

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
            <Link to="/admin/forgot-password">Forgot password ?</Link>
          </p>

          <button
            type="submit"
            className="mkt-btn mkt-btn-primary mkt-login-submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
            {!submitting && <ForwardArrow className="h-4 w-4" />}
          </button>

          <Link to="/login/portals" className="mkt-btn mkt-login-signup">
            Back to sign in
          </Link>
        </form>
      </AdminAuthPageShell>
    </>
  );
}
