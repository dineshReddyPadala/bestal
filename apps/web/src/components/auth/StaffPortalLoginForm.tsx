import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';
import { MarketingPasswordInput } from '../ui/MarketingPasswordInput';
import { usePortalLogin } from '../../contexts/AuthContext';
import type { Portal } from '../../lib/api/types';

type StaffPortal = Extract<Portal, 'ADMIN' | 'RECRUITER' | 'SALES'>;

type StaffPortalLoginFormProps = {
  portal: StaffPortal;
  defaultEmail: string;
  forgotPasswordPath: string;
};

export function StaffPortalLoginForm({
  portal,
  defaultEmail,
  forgotPasswordPath,
}: StaffPortalLoginFormProps) {
  const { handleLogin, error, submitting } = usePortalLogin(portal);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleLogin(email, password);
  }

  return (
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
        <MarketingPasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <p className="mkt-login-forgot">
        <Link to={forgotPasswordPath}>Forgot password ?</Link>
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
  );
}
